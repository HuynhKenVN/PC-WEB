import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { duongDanAnToan, layNguoiDung } from "@/lib/auth";
import { DangNhapForm } from "@/components/form-tai-khoan";
import { KhungXacThuc } from "@/components/khung-xac-thuc";

export const metadata: Metadata = { title: "Đăng nhập" };

export default async function TrangDangNhap({ searchParams }: PageProps<"/dang-nhap">) {
  const tiep = duongDanAnToan((await searchParams).tiep);
  if (await layNguoiDung()) redirect(tiep);
  return (
    <KhungXacThuc tieuDe="Đăng nhập" moTa="Giỏ hàng và cấu hình nháp trên máy này vẫn được giữ sau khi đăng nhập.">
      <DangNhapForm tiep={tiep} />
    </KhungXacThuc>
  );
}
