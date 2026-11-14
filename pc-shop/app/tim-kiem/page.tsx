import type { Metadata } from "next";
import { layNhieuSanPham } from "@/lib/db";
import { LuoiCoLoc } from "@/components/luoi-san-pham";
import { DuongDan, KhungTrang, TieuDeTrang } from "@/components/ui";

export const metadata: Metadata = { title: "Tìm kiếm" };

export default async function TrangTimKiem({ searchParams }: PageProps<"/tim-kiem">) {
  const ts = await searchParams;
  const q = typeof ts.q === "string" ? ts.q.trim().slice(0, 80) : "";
  const giam = ts.giam === "1";
  const ds = layNhieuSanPham({ tuKhoa: q || undefined });
  const tieuDe = q ? <>Kết quả cho &ldquo;{q}&rdquo;</> : giam ? "Đang giảm giá" : "Tất cả sản phẩm";
  return (
    <KhungTrang>
      <DuongDan ds={[["Trang chủ", "/"], ["Tìm kiếm"]]} />
      <TieuDeTrang phu={q ? "Tìm theo tên, hãng và mô tả. Thử mã ngắn như 7600, B650, 4070." : undefined}>{tieuDe}</TieuDeTrang>
      <LuoiCoLoc ds={ds} ts={ts} hanhDong="/tim-kiem" giuLai={{ ...(q ? { q } : {}), ...(giam ? { giam: "1" } : {}) }} />
    </KhungTrang>
  );
}
