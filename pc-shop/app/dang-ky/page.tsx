import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { duongDanAnToan, layNguoiDung } from "@/lib/auth";
import { DangKyForm } from "@/components/form-tai-khoan";
import { KhungXacThuc } from "@/components/khung-xac-thuc";

export const metadata: Metadata = { title: "Đăng ký" };

export default async function TrangDangKy({ searchParams }: PageProps<"/dang-ky">) {
  const tiep = duongDanAnToan((await searchParams).tiep);
  if (await layNguoiDung()) redirect(tiep);
  return (
    <KhungXacThuc tieuDe="Tạo tài khoản" moTa="Để lưu cấu hình, đặt hàng và xem lại đơn.">
      <DangKyForm tiep={tiep} />
    </KhungXacThuc>
  );
}
