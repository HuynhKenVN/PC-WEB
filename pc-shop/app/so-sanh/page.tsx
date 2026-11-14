import type { Metadata } from "next";
import { SoSanhClient } from "@/components/so-sanh-client";
import { DuongDan, KhungTrang, TieuDeTrang } from "@/components/ui";

export const metadata: Metadata = { title: "So sánh linh kiện" };

export default function TrangSoSanh() {
  return (
    <KhungTrang>
      <DuongDan ds={[["Trang chủ", "/"], ["So sánh"]]} />
      <TieuDeTrang phu="Đặt tối đa 3 linh kiện cùng loại cạnh nhau.">So sánh linh kiện</TieuDeTrang>
      <SoSanhClient />
    </KhungTrang>
  );
}
