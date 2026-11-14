"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "../db";
import { canAdmin } from "../auth";
import { SAN_PHAM_MAU } from "../du-lieu-mau";
import { THU_TU_LOAI, type LoaiLinhKien } from "../tuong-thich";
import type { TrangThaiForm } from "./tai-khoan";

const TRANG_THAI_DON = ["cho-xac-nhan", "dang-giao", "da-giao", "da-huy"] as const;

/** Kiểm tra specs có đủ khóa và đúng kiểu như mẫu của loại đó. */
function kiemSpecs(loai: LoaiLinhKien, specs: unknown): string | null {
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return "Thông số phải là một đối tượng JSON.";
  const mau = SAN_PHAM_MAU.find((s) => s.loai === loai)!.specs as unknown as Record<string, unknown>;
  const s = specs as Record<string, unknown>;
  for (const [khoa, giaTri] of Object.entries(mau)) {
    if (!(khoa in s)) return `Thiếu thông số "${khoa}".`;
    const kieuMau = Array.isArray(giaTri) ? "array" : typeof giaTri;
    const kieu = Array.isArray(s[khoa]) ? "array" : typeof s[khoa];
    if (kieuMau !== kieu) return `Thông số "${khoa}" phải là ${kieuMau === "number" ? "số" : kieuMau === "boolean" ? "true/false" : kieuMau === "array" ? "mảng" : "chuỗi"}.`;
  }
  return null;
}

function taoSlug(ten: string) {
  return ten
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function luuSanPham(_: TrangThaiForm, fd: FormData): Promise<TrangThaiForm> {
  await canAdmin();
  const id = Number(fd.get("id")) || null;
  const ten = String(fd.get("ten") ?? "").trim();
  const hang = String(fd.get("hang") ?? "").trim();
  const loai = String(fd.get("loai") ?? "") as LoaiLinhKien;
  const gia = Number(fd.get("gia"));
  const giaGocRaw = String(fd.get("giaGoc") ?? "").trim();
  const giaGoc = giaGocRaw ? Number(giaGocRaw) : null;
  const tonKho = Number(fd.get("tonKho"));
  const moTa = String(fd.get("moTa") ?? "").trim();
  const specsRaw = String(fd.get("specs") ?? "");

  const truongLoi: Record<string, string> = {};
  if (ten.length < 3) truongLoi.ten = "Tên ít nhất 3 ký tự.";
  if (!hang) truongLoi.hang = "Nhập hãng sản xuất.";
  if (!THU_TU_LOAI.includes(loai)) truongLoi.loai = "Chọn loại linh kiện.";
  if (!Number.isInteger(gia) || gia <= 0) truongLoi.gia = "Giá là số nguyên dương (VND).";
  if (giaGoc !== null && (!Number.isInteger(giaGoc) || giaGoc <= gia)) truongLoi.giaGoc = "Giá gốc phải lớn hơn giá bán, hoặc để trống.";
  if (!Number.isInteger(tonKho) || tonKho < 0) truongLoi.tonKho = "Tồn kho là số nguyên từ 0.";
  let specs: unknown = null;
  try {
    specs = JSON.parse(specsRaw);
  } catch {
    truongLoi.specs = "JSON không hợp lệ. Kiểm tra dấu phẩy và ngoặc kép.";
  }
  if (!truongLoi.specs && !truongLoi.loai) {
    const loiSpecs = kiemSpecs(loai, specs);
    if (loiSpecs) truongLoi.specs = loiSpecs;
  }
  if (Object.keys(truongLoi).length) return { truongLoi };

  const json = JSON.stringify(specs);
  if (id) {
    db.prepare("UPDATE products SET ten=?, hang=?, loai=?, gia=?, gia_goc=?, ton_kho=?, mo_ta=?, specs=? WHERE id=?").run(
      ten, hang, loai, gia, giaGoc, tonKho, moTa, json, id,
    );
  } else {
    let slug = taoSlug(ten);
    if (db.prepare("SELECT 1 FROM products WHERE slug = ?").get(slug)) slug = `${slug}-${Date.now().toString(36)}`;
    db.prepare("INSERT INTO products (slug, ten, hang, loai, gia, gia_goc, ton_kho, mo_ta, specs) VALUES (?,?,?,?,?,?,?,?,?)").run(
      slug, ten, hang, loai, gia, giaGoc, tonKho, moTa, json,
    );
  }
  revalidatePath("/", "layout");
  redirect("/quan-tri/san-pham?daLuu=1");
}

export async function xoaSanPham(fd: FormData) {
  await canAdmin();
  const id = Number(fd.get("id"));
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
  revalidatePath("/", "layout");
  redirect("/quan-tri/san-pham?daXoa=1");
}

export async function doiTrangThaiDon(fd: FormData) {
  await canAdmin();
  const id = Number(fd.get("id"));
  const trangThai = String(fd.get("trangThai"));
  if (!(TRANG_THAI_DON as readonly string[]).includes(trangThai)) return;
  const cu = db.prepare("SELECT trang_thai FROM orders WHERE id = ?").get(id) as { trang_thai: string } | undefined;
  if (!cu || cu.trang_thai === trangThai) return;
  db.exec("BEGIN");
  try {
    db.prepare("UPDATE orders SET trang_thai = ? WHERE id = ?").run(trangThai, id);
    // Đã giao với COD thì coi như đã thu tiền
    if (trangThai === "da-giao") db.prepare("UPDATE orders SET da_thanh_toan = 1 WHERE id = ?").run(id);
    // Hủy thì hoàn kho; mở lại đơn đã hủy thì trừ kho lại
    const dau = trangThai === "da-huy" ? 1 : cu.trang_thai === "da-huy" ? -1 : 0;
    if (dau !== 0) {
      db.prepare(
        "UPDATE products SET ton_kho = MAX(0, ton_kho + ? * (SELECT COALESCE(SUM(so_luong),0) FROM order_items oi WHERE oi.order_id = ? AND oi.product_id = products.id)) WHERE id IN (SELECT product_id FROM order_items WHERE order_id = ?)",
      ).run(dau, id, id);
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  revalidatePath("/quan-tri/don-hang");
  revalidatePath(`/don-hang/${id}`);
}
