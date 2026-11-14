"use server";

import { revalidatePath } from "next/cache";
import { db, laySanPhamTheoIds } from "../db";
import { canDangNhap, layNguoiDung } from "../auth";
import { demMucDo, kiemTra } from "../tuong-thich";

export type KetQuaDatHang =
  | { loi?: string; truongLoi?: Record<string, string>; canXacNhan?: boolean; soLoi?: number; donId?: undefined }
  | { donId: number; loi?: undefined }
  | null;

export async function datHang(_: KetQuaDatHang, fd: FormData): Promise<KetQuaDatHang> {
  const u = await layNguoiDung();
  if (!u) return { loi: "Phiên đăng nhập đã hết. Đăng nhập lại để đặt hàng; giỏ hàng vẫn được giữ." };

  let dong: { id: number; soLuong: number }[];
  try {
    dong = JSON.parse(String(fd.get("gio") ?? "[]"));
  } catch {
    return { loi: "Giỏ hàng không đọc được. Tải lại trang rồi thử lại." };
  }
  dong = dong.filter((d) => Number.isInteger(d.id) && Number.isInteger(d.soLuong) && d.soLuong > 0);
  if (dong.length === 0) return { loi: "Giỏ hàng đang trống." };

  const hoTen = String(fd.get("hoTen") ?? "").trim();
  const soDienThoai = String(fd.get("soDienThoai") ?? "").trim();
  const diaChi = String(fd.get("diaChi") ?? "").trim();
  const ghiChu = String(fd.get("ghiChu") ?? "").trim().slice(0, 500);
  const thanhToan = fd.get("thanhToan") === "chuyen-khoan" ? "chuyen-khoan" : "cod";
  const truongLoi: Record<string, string> = {};
  if (hoTen.length < 2) truongLoi.hoTen = "Nhập họ tên người nhận.";
  if (!/^0\d{9,10}$/.test(soDienThoai)) truongLoi.soDienThoai = "Số điện thoại gồm 10–11 chữ số, bắt đầu bằng 0.";
  if (diaChi.length < 10) truongLoi.diaChi = "Nhập địa chỉ đầy đủ: số nhà, đường, phường, quận, tỉnh/thành.";
  if (Object.keys(truongLoi).length) return { truongLoi };

  // Giá và tồn kho luôn lấy từ CSDL, không tin dữ liệu gửi lên
  const sps = laySanPhamTheoIds(dong.map((d) => d.id));
  const theoId = new Map(sps.map((s) => [s.id, s]));
  for (const d of dong) {
    const sp = theoId.get(d.id);
    if (!sp) return { loi: "Một sản phẩm trong giỏ đã ngừng bán. Xóa nó khỏi giỏ rồi đặt lại." };
    if (sp.tonKho < d.soLuong) return { loi: `${sp.ten} chỉ còn ${sp.tonKho} sản phẩm. Giảm số lượng rồi đặt lại.` };
  }

  const { loi: soLoi } = demMucDo(kiemTra(dong.map((d) => ({ sanPham: theoId.get(d.id)!, soLuong: d.soLuong })), { cheDo: "gio-hang" }));
  if (soLoi > 0 && fd.get("xacNhanLoi") !== "on") {
    return { canXacNhan: true, soLoi, loi: `Giỏ có ${soLoi} lỗi tương thích. Đánh dấu ô xác nhận nếu bạn vẫn muốn đặt (ví dụ mua cho nhiều máy khác nhau).` };
  }

  const tong = dong.reduce((t, d) => t + theoId.get(d.id)!.gia * d.soLuong, 0);
  let donId = 0;
  db.exec("BEGIN");
  try {
    const r = db
      .prepare(
        "INSERT INTO orders (user_id, thanh_toan, ho_ten, so_dien_thoai, dia_chi, ghi_chu, tong_tien, so_loi) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(u.id, thanhToan, hoTen, soDienThoai, diaChi, ghiChu, tong, soLoi);
    donId = Number(r.lastInsertRowid);
    const them = db.prepare("INSERT INTO order_items (order_id, product_id, ten, loai, gia, so_luong) VALUES (?, ?, ?, ?, ?, ?)");
    const truKho = db.prepare("UPDATE products SET ton_kho = ton_kho - ? WHERE id = ? AND ton_kho >= ?");
    for (const d of dong) {
      const sp = theoId.get(d.id)!;
      them.run(donId, sp.id, sp.ten, sp.loai, sp.gia, d.soLuong);
      if (truKho.run(d.soLuong, sp.id, d.soLuong).changes !== 1) throw new Error("het-hang");
    }
    db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(u.id);
    // Lưu lại thông tin giao hàng cho lần sau nếu tài khoản chưa có
    db.prepare("UPDATE users SET so_dien_thoai = COALESCE(so_dien_thoai, ?), dia_chi = COALESCE(dia_chi, ?) WHERE id = ?").run(soDienThoai, diaChi, u.id);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    if (e instanceof Error && e.message === "het-hang") return { loi: "Có sản phẩm vừa hết hàng. Tải lại giỏ rồi thử lại." };
    throw e;
  }
  revalidatePath("/don-hang");
  return { donId };
}

/** Thanh toán chuyển khoản giả lập: khách bấm "Tôi đã chuyển khoản". */
export async function xacNhanChuyenKhoan(fd: FormData) {
  const u = await canDangNhap("/don-hang");
  const id = Number(fd.get("donId"));
  db.prepare("UPDATE orders SET da_thanh_toan = 1 WHERE id = ? AND user_id = ? AND thanh_toan = 'chuyen-khoan' AND trang_thai != 'da-huy'").run(id, u.id);
  revalidatePath(`/don-hang/${id}`);
}

export async function huyDon(fd: FormData) {
  const u = await canDangNhap("/don-hang");
  const id = Number(fd.get("donId"));
  db.exec("BEGIN");
  try {
    const r = db.prepare("UPDATE orders SET trang_thai = 'da-huy' WHERE id = ? AND user_id = ? AND trang_thai = 'cho-xac-nhan'").run(id, u.id);
    if (r.changes === 1) {
      // Hoàn kho
      db.prepare(
        "UPDATE products SET ton_kho = ton_kho + (SELECT COALESCE(SUM(so_luong),0) FROM order_items oi WHERE oi.order_id = ? AND oi.product_id = products.id) WHERE id IN (SELECT product_id FROM order_items WHERE order_id = ?)",
      ).run(id, id);
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  revalidatePath(`/don-hang/${id}`);
  revalidatePath("/don-hang");
}
