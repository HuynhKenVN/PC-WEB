"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useDanhMuc, useKho } from "./kho-trinh-duyet";
import { KhungHinh } from "./the-san-pham";
import { NutThemGio } from "./nut-gio";
import { Gia, TrangTrong, lopNut } from "./ui";
import { thongSo } from "@/lib/thong-so";
import { TEN_LOAI } from "@/lib/tuong-thich";

export function SoSanhClient() {
  const { soSanh, batSoSanh, xoaSoSanh, daNap } = useKho();
  const danhMuc = useDanhMuc();
  if (!daNap || !danhMuc) return <div className="tem h-64 animate-pulse" aria-label="Đang tải" />;

  const ds = soSanh.map((id) => danhMuc.find((s) => s.id === id)).filter((s) => !!s);
  if (ds.length === 0) {
    return (
      <TrangTrong
        tieuDe="Chưa chọn sản phẩm nào để so sánh"
        moTa="Bấm “So sánh” trên thẻ sản phẩm (tối đa 3 món cùng loại), rồi quay lại đây."
        hanhDong={<Link href="/danh-muc/cpu" className={lopNut("chinh")}>Chọn CPU để so sánh</Link>}
      />
    );
  }
  const loai = ds[0]!.loai;
  const cungLoai = ds.filter((s) => s!.loai === loai);
  const khacLoai = ds.filter((s) => s!.loai !== loai);
  const bang = cungLoai.map((s) => thongSo(s!));

  return (
    <div>
      {khacLoai.length > 0 && (
        <p className="tem mb-4 px-4 py-3 text-co-than text-canh-bao">
          Chỉ so sánh được các món cùng loại. Đang so {TEN_LOAI[loai]}; bỏ qua {khacLoai.map((s) => s!.ten).join(", ")}.{" "}
          <button className="underline" onClick={() => khacLoai.forEach((s) => batSoSanh(s!.id))}>
            Bỏ khỏi danh sách
          </button>
        </p>
      )}
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[560px] table-fixed border-separate border-spacing-0 text-co-than">
          <thead>
            <tr>
              <th className="w-[170px] p-0 align-bottom">
                <button onClick={xoaSoSanh} className="mb-3 text-left text-co-nho font-normal text-nhan-sang hover:underline">
                  Xóa tất cả
                </button>
              </th>
              {cungLoai.map((s) => (
                <th key={s!.id} className="px-2 pb-3 text-left align-top font-normal">
                  <div className="tem relative p-2.5">
                    <button onClick={() => batSoSanh(s!.id)} aria-label={`Bỏ ${s!.ten}`} className="absolute right-1.5 top-1.5 z-10 rounded p-1 text-n-8 hover:bg-n-4 hover:text-n-10">
                      <X className="size-4" />
                    </button>
                    <KhungHinh sp={s!} className="aspect-[4/3]" />
                    <Link href={`/san-pham/${s!.slug}`} className="mt-2 line-clamp-2 min-h-[2.6em] text-co-than font-medium leading-snug text-n-10 hover:underline">
                      {s!.ten}
                    </Link>
                    <div className="mt-1.5">
                      <Gia gia={s!.gia} giaGoc={s!.giaGoc} />
                    </div>
                    <div className="mt-2.5">
                      <NutThemGio id={s!.id} het={s!.tonKho === 0} co="nho" day />
                    </div>
                  </div>
                </th>
              ))}
              {Array.from({ length: 3 - cungLoai.length }, (_, i) => (
                <th key={`trong-${i}`} className="px-2 pb-3 align-top font-normal">
                  <Link href={`/danh-muc/${loai}`} className="flex h-full min-h-48 items-center justify-center rounded-[var(--radius-tem)] border border-dashed border-n-5 text-co-nho text-n-8 hover:border-n-6 hover:text-n-10">
                    + Thêm {TEN_LOAI[loai]}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bang[0].map((dong, r) => {
              const giaTri = bang.map((b) => b[r]);
              const so = giaTri.map((g) => g.so);
              const coSo = dong.huong && so.every((x) => typeof x === "number") && new Set(so).size > 1;
              const tot = coSo ? (dong.huong === 1 ? Math.max(...(so as number[])) : Math.min(...(so as number[]))) : null;
              const khac = new Set(giaTri.map((g) => g.giaTri)).size > 1;
              return (
                <tr key={dong.khoa}>
                  <th scope="row" className="border-t border-n-4 py-2.5 pr-3 text-left align-top text-co-nho font-normal text-n-8">
                    {dong.nhan}
                  </th>
                  {giaTri.map((g, c) => (
                    <td key={c} className={`so border-t border-n-4 px-4 py-2.5 align-top ${tot !== null && g.so === tot ? "font-semibold text-dat" : khac ? "text-n-10" : "text-n-8"}`}>
                      {g.giaTri}
                    </td>
                  ))}
                  {Array.from({ length: 3 - cungLoai.length }, (_, i) => (
                    <td key={i} className="border-t border-n-4" />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-co-phu text-n-7">Màu xanh lá: giá trị tốt hơn trong hàng. Chữ mờ: các món giống nhau ở dòng đó.</p>
    </div>
  );
}
