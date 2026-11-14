import Link from "next/link";
import type { SanPhamDayDu } from "@/lib/db";
import { thongSoNoiBat } from "@/lib/thong-so";
import { HinhLinhKien, bienCua } from "./hinh-linh-kien";
import { NutSoSanh, NutThemGio } from "./nut-gio";
import { Gia, Sao } from "./ui";

export function KhungHinh({ sp, className = "" }: { sp: SanPhamDayDu; className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-md bg-n-3 ${className}`}>
      <HinhLinhKien loai={sp.loai} bien={bienCua(sp)} className="h-[78%] w-[78%] text-n-7 transition-[color,transform] duration-300 ease-[var(--ease-ra)] group-hover:scale-[1.04] group-hover:text-n-8" />
      {sp.giaGoc && sp.giaGoc > sp.gia && (
        <span className="so absolute left-2 top-2 rounded bg-nhan px-1.5 py-0.5 text-co-nhan font-bold text-white">
          −{Math.round((1 - sp.gia / sp.giaGoc) * 100)}%
        </span>
      )}
      {sp.tonKho === 0 && (
        <span className="absolute inset-0 flex items-center justify-center rounded-md bg-n-0/60 text-co-nho font-semibold text-n-9">Hết hàng</span>
      )}
    </div>
  );
}

/** Thẻ sản phẩm kiểu cửa hàng quen thuộc: hình, tên, thông số chính, giá, nút giỏ. */
export function TheSanPham({ sp }: { sp: SanPhamDayDu }) {
  return (
    <article className="tem group flex flex-col p-2.5 transition-[border-color,box-shadow] duration-200 hover:border-n-5 hover:shadow-[0_8px_24px_-12px_rgb(0_0_0/0.7)]">
      <Link href={`/san-pham/${sp.slug}`} className="flex flex-1 flex-col">
        <KhungHinh sp={sp} className="aspect-[4/3]" />
        <h3 className="mt-3 line-clamp-2 min-h-[2.6em] px-0.5 text-co-than font-medium leading-snug text-n-10 group-hover:text-white">{sp.ten}</h3>
        <ul className="mt-2 flex flex-wrap gap-1 px-0.5">
          {thongSoNoiBat(sp).map((t) => (
            <li key={t} className="so rounded bg-n-3 px-1.5 py-px text-co-nhan text-n-9">
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-auto px-0.5 pt-3">
          <Gia gia={sp.gia} giaGoc={sp.giaGoc} />
          <div className="mt-1 flex items-center justify-between">
            <Sao diem={sp.diemTb} soDanhGia={sp.soDanhGia} />
            {sp.tonKho > 0 && sp.tonKho <= 5 && <span className="text-co-nhan text-canh-bao">Còn {sp.tonKho}</span>}
          </div>
        </div>
      </Link>
      <div className="mt-3 flex items-center gap-1">
        <NutThemGio id={sp.id} het={sp.tonKho === 0} co="nho" day />
        <NutSoSanh id={sp.id} gon />
      </div>
    </article>
  );
}
