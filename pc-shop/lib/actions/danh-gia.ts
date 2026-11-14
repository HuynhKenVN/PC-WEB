"use server";

import { revalidatePath } from "next/cache";
import { db } from "../db";
import { layNguoiDung } from "../auth";
import type { TrangThaiForm } from "./tai-khoan";

export async function guiDanhGia(_: TrangThaiForm, fd: FormData): Promise<TrangThaiForm> {
  const u = await layNguoiDung();
  if (!u) return { loi: "Đăng nhập để viết đánh giá." };
  const productId = Number(fd.get("productId"));
  const slug = String(fd.get("slug") ?? "");
  const soSao = Number(fd.get("soSao"));
  const noiDung = String(fd.get("noiDung") ?? "").trim();
  if (!Number.isInteger(soSao) || soSao < 1 || soSao > 5) return { truongLoi: { soSao: "Chọn từ 1 đến 5 sao." } };
  if (noiDung.length < 10) return { truongLoi: { noiDung: "Viết ít nhất 10 ký tự để người khác hiểu trải nghiệm của bạn." } };
  if (noiDung.length > 1000) return { truongLoi: { noiDung: "Tối đa 1000 ký tự." } };
  const sp = db.prepare("SELECT 1 FROM products WHERE id = ?").get(productId);
  if (!sp) return { loi: "Sản phẩm không còn tồn tại." };

  db.prepare(
    `INSERT INTO reviews (product_id, user_id, so_sao, noi_dung) VALUES (?, ?, ?, ?)
     ON CONFLICT (product_id, user_id) DO UPDATE SET so_sao = excluded.so_sao, noi_dung = excluded.noi_dung, tao_luc = datetime('now')`,
  ).run(productId, u.id, soSao, noiDung);
  revalidatePath(`/san-pham/${slug}`);
  return { ok: "Đã lưu đánh giá của bạn." };
}
