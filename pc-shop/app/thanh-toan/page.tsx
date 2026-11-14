import type { Metadata } from "next";
import { canDangNhap } from "@/lib/auth";
import { ThanhToanClient } from "@/components/thanh-toan-client";
import { DuongDan, KhungTrang, TieuDeTrang } from "@/components/ui";

export const metadata: Metadata = { title: "Đặt hàng" };

export default async function TrangThanhToan() {
  const u = await canDangNhap("/thanh-toan");
  return (
    <KhungTrang>
      <DuongDan ds={[["Giỏ hàng", "/gio-hang"], ["Đặt hàng"]]} />
      <TieuDeTrang>Đặt hàng</TieuDeTrang>
      <ThanhToanClient macDinh={{ hoTen: u.hoTen, soDienThoai: u.soDienThoai ?? "", diaChi: u.diaChi ?? "" }} />
    </KhungTrang>
  );
}
