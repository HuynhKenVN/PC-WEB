import type { Metadata } from "next";
import { GioHangClient } from "@/components/gio-hang-client";
import { DuongDan, KhungTrang, TieuDeTrang } from "@/components/ui";

export const metadata: Metadata = { title: "Giỏ hàng" };

export default function TrangGioHang() {
  return (
    <KhungTrang>
      <DuongDan ds={[["Trang chủ", "/"], ["Giỏ hàng"]]} />
      <TieuDeTrang>Giỏ hàng</TieuDeTrang>
      <GioHangClient />
    </KhungTrang>
  );
}
