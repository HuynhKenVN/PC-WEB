import type { Metadata } from "next";
import { layNguoiDung } from "@/lib/auth";
import { layCauHinh } from "@/lib/cau-hinh";
import { layTatCaSanPham } from "@/lib/db";
import { CAU_HINH_GOI_Y } from "@/lib/du-lieu-mau";
import type { NhapCauHinh } from "@/lib/nhap-cau-hinh";
import { BuildPcClient } from "@/components/build-pc/build-pc-client";
import { KhungTrang, TieuDeTrang } from "@/components/ui";

export const metadata: Metadata = { title: "Build PC" };

export default async function TrangBuildPc({ searchParams }: PageProps<"/build-pc">) {
  const ts = await searchParams;
  const nguoiDung = await layNguoiDung();

  // Mở từ cấu hình gợi ý (?goi-y=0) hoặc sửa cấu hình đã lưu (?sua=12)
  let khoiTao: NhapCauHinh | null = null;
  const goiY = typeof ts["goi-y"] === "string" ? CAU_HINH_GOI_Y[Number(ts["goi-y"])] : undefined;
  if (goiY) {
    const theoSlug = new Map(layTatCaSanPham().map((s) => [s.slug, s.id]));
    khoiTao = {
      ten: goiY.ten,
      doPhanGiai: goiY.ten.includes("1440p") ? "1440p" : "1080p",
      items: goiY.slugs.map((s) => theoSlug.get(s)).filter((id): id is number => !!id).map((id) => ({ id, soLuong: 1 })),
      suaId: null,
    };
  } else if (typeof ts.sua === "string" && nguoiDung) {
    const ch = layCauHinh(Number(ts.sua));
    if (ch && ch.userId === nguoiDung.id) {
      khoiTao = { ten: ch.ten, doPhanGiai: ch.doPhanGiai, items: ch.items.map((i) => ({ id: i.sanPham.id, soLuong: i.soLuong })), suaId: ch.id };
    }
  }

  return (
    <KhungTrang>
      <TieuDeTrang phu="Chọn từng linh kiện; mỗi lựa chọn được so ngay với những món đã có. Món không hợp vẫn hiện trong ngăn chọn, kèm lý do.">Build PC</TieuDeTrang>
      <BuildPcClient daDangNhap={!!nguoiDung} khoiTao={khoiTao} />
    </KhungTrang>
  );
}
