import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { laySanPhamTheoId } from "@/lib/db";
import { SAN_PHAM_MAU } from "@/lib/du-lieu-mau";
import { THU_TU_LOAI, type LoaiLinhKien } from "@/lib/tuong-thich";
import { FormSanPham, type GiaTriSanPham } from "@/components/quan-tri/form-san-pham";
import { DuongDan } from "@/components/ui";

export const metadata: Metadata = { title: "Sửa sản phẩm · Quản trị" };

export default async function TrangSuaSanPham({ params }: PageProps<"/quan-tri/san-pham/[id]">) {
  const { id } = await params;
  const mauSpecs = Object.fromEntries(
    THU_TU_LOAI.map((l) => [l, JSON.stringify(SAN_PHAM_MAU.find((s) => s.loai === l)!.specs, null, 2)]),
  ) as Record<LoaiLinhKien, string>;

  let dau: GiaTriSanPham;
  if (id === "moi") {
    dau = { id: null, ten: "", hang: "", loai: "cpu", gia: "", giaGoc: "", tonKho: 0, moTa: "", specs: mauSpecs.cpu };
  } else {
    const sp = laySanPhamTheoId(Number(id));
    if (!sp) notFound();
    dau = {
      id: sp.id,
      ten: sp.ten,
      hang: sp.hang,
      loai: sp.loai,
      gia: sp.gia,
      giaGoc: sp.giaGoc ?? "",
      tonKho: sp.tonKho,
      moTa: sp.moTa,
      specs: JSON.stringify(sp.specs, null, 2),
    };
  }
  return (
    <div className="max-w-3xl">
      <DuongDan ds={[["Sản phẩm", "/quan-tri/san-pham"], [dau.id ? dau.ten : "Thêm mới"]]} />
      <h1 className="pb-5 pt-3 text-co-gia font-bold tracking-[-0.015em] text-n-10">{dau.id ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h1>
      <FormSanPham dau={dau} mauSpecs={mauSpecs} />
    </div>
  );
}
