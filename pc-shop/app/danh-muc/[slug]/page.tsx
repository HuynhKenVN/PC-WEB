import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { layNhieuSanPham } from "@/lib/db";
import { THU_TU_LOAI, TEN_LOAI, type LoaiLinhKien } from "@/lib/tuong-thich";
import { LuoiCoLoc } from "@/components/luoi-san-pham";
import { DuongDan, KhungTrang, TieuDeTrang } from "@/components/ui";

const MO_TA: Record<LoaiLinhKien, string> = {
  cpu: "Chọn CPU trước: socket của nó quyết định mainboard, chuẩn RAM và tản nhiệt bạn dùng được.",
  mainboard: "Main phải cùng socket với CPU, đúng chuẩn RAM và vừa kích thước case.",
  ram: "DDR4 và DDR5 không cắm lẫn được. Xem số khe RAM của main trước khi chọn kit 4 thanh.",
  vga: "Kiểm tra chiều dài card so với case và đầu cấp nguồn 8-pin / 12VHPWR của nguồn.",
  "o-cung": "SSD M.2 cần khe M.2 trên main; SSD SATA cần cổng SATA và dây SATA.",
  nguon: "Nên chọn nguồn dư ít nhất 30% so với công suất ước tính của cả máy.",
  case: "Đối chiếu kích thước main hỗ trợ, chiều dài VGA và chiều cao tản tối đa.",
  "tan-nhiet": "Tản phải có ngàm cho socket CPU, đủ sức giải nhiệt và vừa khoảng hở case.",
};

export async function generateMetadata({ params }: PageProps<"/danh-muc/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: TEN_LOAI[slug as LoaiLinhKien] ?? "Danh mục" };
}

export default async function TrangDanhMuc({ params, searchParams }: PageProps<"/danh-muc/[slug]">) {
  const { slug } = await params;
  if (!THU_TU_LOAI.includes(slug as LoaiLinhKien)) notFound();
  const loai = slug as LoaiLinhKien;
  const ts = await searchParams;
  return (
    <KhungTrang>
      <DuongDan ds={[["Trang chủ", "/"], [TEN_LOAI[loai]]]} />
      <TieuDeTrang phu={MO_TA[loai]}>{TEN_LOAI[loai]}</TieuDeTrang>
      <LuoiCoLoc ds={layNhieuSanPham({ loai })} ts={ts} hanhDong={`/danh-muc/${loai}`} loai={loai} />
    </KhungTrang>
  );
}
