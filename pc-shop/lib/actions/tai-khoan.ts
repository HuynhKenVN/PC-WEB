"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "../db";
import { bamMatKhau, kiemMatKhau } from "../mat-khau";
import { canDangNhap, duongDanAnToan, taoPhien, xoaPhien } from "../auth";

export type TrangThaiForm = { loi?: string; truongLoi?: Record<string, string>; ok?: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function dangKy(_: TrangThaiForm, fd: FormData): Promise<TrangThaiForm> {
  const hoTen = String(fd.get("hoTen") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const matKhau = String(fd.get("matKhau") ?? "");
  const truongLoi: Record<string, string> = {};
  if (hoTen.length < 2) truongLoi.hoTen = "Nhập họ tên, ít nhất 2 ký tự.";
  if (!EMAIL_RE.test(email)) truongLoi.email = "Email chưa đúng dạng, ví dụ ten@gmail.com.";
  if (matKhau.length < 8) truongLoi.matKhau = "Mật khẩu cần ít nhất 8 ký tự.";
  if (Object.keys(truongLoi).length) return { truongLoi };

  const daCo = db.prepare("SELECT 1 FROM users WHERE email = ?").get(email);
  if (daCo) return { truongLoi: { email: "Email này đã có tài khoản. Đăng nhập thay vì đăng ký." } };

  const r = db.prepare("INSERT INTO users (email, ho_ten, mat_khau) VALUES (?, ?, ?)").run(email, hoTen, bamMatKhau(matKhau));
  await taoPhien(Number(r.lastInsertRowid));
  redirect(duongDanAnToan(fd.get("tiep")));
}

export async function dangNhap(_: TrangThaiForm, fd: FormData): Promise<TrangThaiForm> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const matKhau = String(fd.get("matKhau") ?? "");
  const u = db.prepare("SELECT id, mat_khau FROM users WHERE email = ?").get(email) as { id: number; mat_khau: string } | undefined;
  if (!u || !kiemMatKhau(matKhau, u.mat_khau)) {
    return { loi: "Email hoặc mật khẩu không đúng." };
  }
  await taoPhien(u.id);
  redirect(duongDanAnToan(fd.get("tiep")));
}

export async function dangXuat() {
  await xoaPhien();
  redirect("/");
}

export async function capNhatThongTin(_: TrangThaiForm, fd: FormData): Promise<TrangThaiForm> {
  const u = await canDangNhap("/tai-khoan");
  const hoTen = String(fd.get("hoTen") ?? "").trim();
  const soDienThoai = String(fd.get("soDienThoai") ?? "").trim();
  const diaChi = String(fd.get("diaChi") ?? "").trim();
  if (hoTen.length < 2) return { truongLoi: { hoTen: "Nhập họ tên, ít nhất 2 ký tự." } };
  if (soDienThoai && !/^0\d{9,10}$/.test(soDienThoai)) return { truongLoi: { soDienThoai: "Số điện thoại gồm 10–11 chữ số, bắt đầu bằng 0." } };
  db.prepare("UPDATE users SET ho_ten = ?, so_dien_thoai = ?, dia_chi = ? WHERE id = ?").run(hoTen, soDienThoai || null, diaChi || null, u.id);
  revalidatePath("/tai-khoan");
  return { ok: "Đã lưu thông tin." };
}
