import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { layTatCaSanPham } from "@/lib/db";
import { dinhDangTien } from "@/lib/thong-so";
import { THU_TU_LOAI, TEN_LOAI, type LoaiLinhKien } from "@/lib/tuong-thich";
import { xoaSanPham } from "@/lib/actions/quan-tri";
import { NutXoa } from "@/components/quan-tri/nut-xoa";
import { lopNut } from "@/components/ui";

export const metadata: Metadata = { title: "Sản phẩm · Quản trị" };

export default async function TrangQuanTriSanPham({ searchParams }: PageProps<"/quan-tri/san-pham">) {
  const ts = await searchParams;
  const loai = THU_TU_LOAI.includes(ts.loai as LoaiLinhKien) ? (ts.loai as LoaiLinhKien) : undefined;
  const ds = layTatCaSanPham().filter((s) => !loai || s.loai === loai);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
        <h1 className="text-co-gia font-bold tracking-[-0.015em] text-n-10">Sản phẩm</h1>
        <Link href="/quan-tri/san-pham/moi" className={lopNut("chinh")}>
          <Plus className="size-4" aria-hidden /> Thêm sản phẩm
        </Link>
      </div>
      {ts.daLuu && <p role="status" className="mb-4 rounded-md bg-dat-nen px-3 py-2 text-co-nho text-dat">Đã lưu sản phẩm.</p>}
      {ts.daXoa && <p role="status" className="mb-4 rounded-md bg-dat-nen px-3 py-2 text-co-nho text-dat">Đã xóa sản phẩm.</p>}
      <nav aria-label="Lọc theo loại" className="mb-3 flex flex-wrap gap-1">
        {[undefined, ...THU_TU_LOAI].map((l) => (
          <Link
            key={l ?? "tat-ca"}
            href={l ? `/quan-tri/san-pham?loai=${l}` : "/quan-tri/san-pham"}
            className={`rounded-full px-3 py-1 text-co-nho ${l === loai ? "bg-nhan text-white" : "bg-n-2 text-n-9 hover:bg-n-3"}`}
          >
            {l ? TEN_LOAI[l] : "Tất cả"}
          </Link>
        ))}
      </nav>
      <div className="tem relative overflow-x-auto">
        <table className="w-full min-w-[720px] text-co-than">
          <thead>
            <tr className="border-b border-n-4 text-left">
              <th className="nhan-cot px-4 py-2.5">Tên</th>
              <th className="nhan-cot px-4 py-2.5">Loại</th>
              <th className="nhan-cot px-4 py-2.5 text-right">Giá</th>
              <th className="nhan-cot px-4 py-2.5 text-right">Tồn kho</th>
              <th className="px-4 py-2.5">
                <span className="sr-only">Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-n-3">
            {ds.map((s) => (
              <tr key={s.id} className="hover:bg-n-1/50">
                <td className="px-4 py-2.5">
                  <Link href={`/quan-tri/san-pham/${s.id}`} className="text-n-10 hover:underline">
                    {s.ten}
                  </Link>
                  <span className="block text-co-phu text-n-7">{s.hang}</span>
                </td>
                <td className="px-4 py-2.5 text-n-9">{TEN_LOAI[s.loai]}</td>
                <td className="so px-4 py-2.5 text-right text-n-10">{dinhDangTien(s.gia)}</td>
                <td className={`so px-4 py-2.5 text-right ${s.tonKho === 0 ? "text-loi" : s.tonKho <= 5 ? "text-canh-bao" : "text-n-10"}`}>{s.tonKho}</td>
                <td className="px-4 py-2.5">
                  <div className="flex justify-end gap-1">
                    <Link href={`/quan-tri/san-pham/${s.id}`} className={lopNut("phu", "nho")}>
                      Sửa
                    </Link>
                    <NutXoa id={s.id} ten={s.ten} hanhDong={xoaSanPham} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
