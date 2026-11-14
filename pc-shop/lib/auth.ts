import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

export const TEN_COOKIE = "apex_phien";
const SO_NGAY = 30;

export interface NguoiDung {
  id: number;
  email: string;
  hoTen: string;
  laAdmin: boolean;
  soDienThoai: string | null;
  diaChi: string | null;
}

type DongUser = {
  id: number;
  email: string;
  ho_ten: string;
  la_admin: number;
  so_dien_thoai: string | null;
  dia_chi: string | null;
};

const chuyen = (d: DongUser): NguoiDung => ({
  id: d.id,
  email: d.email,
  hoTen: d.ho_ten,
  laAdmin: d.la_admin === 1,
  soDienThoai: d.so_dien_thoai,
  diaChi: d.dia_chi,
});

/** Tạo phiên mới và đặt cookie. Chỉ gọi trong Server Action hoặc Route Handler. */
export async function taoPhien(userId: number) {
  const token = randomBytes(32).toString("hex");
  const hetHan = new Date(Date.now() + SO_NGAY * 864e5);
  db.prepare("INSERT INTO sessions (token, user_id, het_han) VALUES (?, ?, ?)").run(token, userId, hetHan.toISOString());
  (await cookies()).set(TEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: hetHan,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function xoaPhien() {
  const kho = await cookies();
  const token = kho.get(TEN_COOKIE)?.value;
  if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  kho.delete(TEN_COOKIE);
}

export async function layNguoiDung(): Promise<NguoiDung | null> {
  const token = (await cookies()).get(TEN_COOKIE)?.value;
  if (!token) return null;
  const d = db
    .prepare(
      `SELECT u.id, u.email, u.ho_ten, u.la_admin, u.so_dien_thoai, u.dia_chi
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.het_han > ?`,
    )
    .get(token, new Date().toISOString()) as DongUser | undefined;
  return d ? chuyen(d) : null;
}

/** Bắt buộc đăng nhập; chưa đăng nhập thì chuyển tới trang đăng nhập rồi quay lại `tiep`. */
export async function canDangNhap(tiep: string): Promise<NguoiDung> {
  const u = await layNguoiDung();
  if (!u) redirect(`/dang-nhap?tiep=${encodeURIComponent(tiep)}`);
  return u;
}

export async function canAdmin(): Promise<NguoiDung> {
  const u = await canDangNhap("/quan-tri");
  if (!u.laAdmin) redirect("/");
  return u;
}

/** Chỉ cho phép đường dẫn nội bộ để tránh chuyển hướng ra ngoài. */
export function duongDanAnToan(tiep: unknown, macDinh = "/"): string {
  return typeof tiep === "string" && tiep.startsWith("/") && !tiep.startsWith("//") ? tiep : macDinh;
}
