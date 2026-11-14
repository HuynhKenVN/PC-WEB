"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { SanPhamDayDu } from "@/lib/db";
import { TEN_LOAI, xetUngVien, type DoPhanGiai, type LinhKienChon, type LoaiLinhKien } from "@/lib/tuong-thich";
import { thongSoNoiBat, dinhDangTien } from "@/lib/thong-so";
import { HinhLinhKien, bienCua } from "../hinh-linh-kien";
import { BieuTuongMucDo, MAU_MUC_DO, lopNut } from "../ui";

/** Ngăn trượt chọn linh kiện: đánh dấu trước món nào hợp / không hợp với phần đã chọn. */
export function NganChon({
  loai,
  danhMuc,
  daChon,
  doPhanGiai,
  dangChonId,
  onChon,
  onDong,
}: {
  loai: LoaiLinhKien;
  danhMuc: SanPhamDayDu[];
  daChon: LinhKienChon[];
  doPhanGiai: DoPhanGiai;
  dangChonId?: number;
  onChon: (sp: SanPhamDayDu) => void;
  onDong: () => void;
}) {
  const [chiHop, setChiHop] = useState(false);
  const [tuKhoa, setTuKhoa] = useState("");
  const [sap, setSap] = useState<"hop" | "gia-tang" | "gia-giam">("hop");
  const ref = useRef<HTMLDivElement>(null);
  const oTim = useRef<HTMLInputElement>(null);

  // Ổ cứng được chọn nhiều món nên không thay thế món cùng loại khi xét
  const thayThe = loai !== "o-cung";
  const ds = useMemo(() => {
    const THU_TU = { dat: 0, "canh-bao": 1, loi: 2 } as const;
    let r = danhMuc
      .filter((s) => s.loai === loai)
      .map((sp) => ({ sp, xet: xetUngVien(daChon, sp, { doPhanGiai }, thayThe) }));
    if (chiHop) r = r.filter((x) => x.xet.mucDo !== "loi");
    const q = tuKhoa.trim().toLowerCase();
    if (q) r = r.filter((x) => `${x.sp.ten} ${x.sp.hang}`.toLowerCase().includes(q));
    if (sap === "hop") r.sort((a, b) => THU_TU[a.xet.mucDo] - THU_TU[b.xet.mucDo] || a.sp.gia - b.sp.gia);
    else r.sort((a, b) => (sap === "gia-tang" ? a.sp.gia - b.sp.gia : b.sp.gia - a.sp.gia));
    return r;
  }, [danhMuc, loai, daChon, doPhanGiai, chiHop, tuKhoa, sap, thayThe]);
  const soKhongHop = useMemo(
    () => danhMuc.filter((s) => s.loai === loai && xetUngVien(daChon, s, { doPhanGiai }, thayThe).mucDo === "loi").length,
    [danhMuc, loai, daChon, doPhanGiai, thayThe],
  );

  useEffect(() => {
    const truoc = document.activeElement as HTMLElement | null;
    oTim.current?.focus();
    const phim = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDong();
      if (e.key === "Tab" && ref.current) {
        // Giữ tiêu điểm trong ngăn
        const f = ref.current.querySelectorAll<HTMLElement>("button, input, select, a[href]");
        if (!f.length) return;
        const dau = f[0];
        const cuoi = f[f.length - 1];
        if (e.shiftKey && document.activeElement === dau) {
          e.preventDefault();
          cuoi.focus();
        } else if (!e.shiftKey && document.activeElement === cuoi) {
          e.preventDefault();
          dau.focus();
        }
      }
    };
    document.addEventListener("keydown", phim);
    const cu = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", phim);
      document.body.style.overflow = cu;
      truoc?.focus();
    };
  }, [onDong]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="ngan-tieu-de">
      <button type="button" aria-label="Đóng" onClick={onDong} className="absolute inset-0 cursor-default bg-black/60 animate-[hien_200ms_ease-out_both]" tabIndex={-1} />
      <div ref={ref} className="absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col border-l border-n-4 bg-n-1 shadow-[-24px_0_48px_-24px_rgb(0_0_0/0.8)] animate-truot-vao">
        <div className="flex items-center justify-between gap-3 border-b border-n-4 px-5 py-4">
          <div>
            <h2 id="ngan-tieu-de" className="text-co-muc font-semibold text-n-10">Chọn {TEN_LOAI[loai]}</h2>
            <p className="text-co-nho text-n-8">
              {daChon.length ? `Đã so với ${daChon.length} món bạn chọn` : "Chưa chọn món nào, mọi món đều lắp được"}
              {soKhongHop > 0 && <span className="text-loi"> · {soKhongHop} món không hợp</span>}
            </p>
          </div>
          <button type="button" onClick={onDong} aria-label="Đóng ngăn chọn" className="rounded-md p-2 text-n-8 hover:bg-n-3 hover:text-n-10">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-n-4 px-5 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-n-7" aria-hidden />
            <input
              ref={oTim}
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              placeholder={`Tìm trong ${TEN_LOAI[loai]}`}
              aria-label={`Tìm trong ${TEN_LOAI[loai]}`}
              className="h-9 w-full rounded-md border border-n-4 bg-n-0 pl-9 pr-3 text-co-than text-n-10 placeholder:text-n-7 focus:border-nhan focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-co-nho text-n-9">
              <input type="checkbox" checked={chiHop} onChange={(e) => setChiHop(e.target.checked)} className="size-4" />
              Chỉ hiện linh kiện tương thích
            </label>
            <select
              value={sap}
              onChange={(e) => setSap(e.target.value as typeof sap)}
              aria-label="Sắp xếp"
              className="h-8 rounded-md border border-n-4 bg-n-0 px-2 text-co-nho text-n-10 focus:border-nhan focus:outline-none"
            >
              <option value="hop">Hợp nhất trước</option>
              <option value="gia-tang">Giá thấp → cao</option>
              <option value="gia-giam">Giá cao → thấp</option>
            </select>
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto overscroll-contain px-3 py-2">
          {ds.length === 0 && <li className="px-2 py-10 text-center text-co-than text-n-8">Không có món nào khớp. Bỏ tick “Chỉ hiện linh kiện tương thích” hoặc đổi từ khóa.</li>}
          {ds.map(({ sp, xet }) => {
            const dangChon = sp.id === dangChonId;
            const het = sp.tonKho === 0;
            return (
              <li key={sp.id}>
                <div className={`grid grid-cols-[64px_1fr_auto] items-start gap-3 rounded-md p-2 ${dangChon ? "bg-nhan-nen" : "hover:bg-n-2"} ${xet.mucDo === "loi" ? "opacity-75" : ""}`}>
                  <div className="flex aspect-[4/3] items-center justify-center rounded bg-n-3">
                    <HinhLinhKien loai={sp.loai} bien={bienCua(sp)} className="h-[80%] w-[80%]" />
                  </div>
                  <div className="min-w-0">
                    <Link href={`/san-pham/${sp.slug}`} target="_blank" className="line-clamp-2 text-co-than font-medium leading-snug text-n-10 hover:underline">
                      {sp.ten}
                    </Link>
                    <p className="so mt-0.5 truncate text-co-nhan text-n-8">{thongSoNoiBat(sp).join(" · ")}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2">
                      <span className={`dau ${MAU_MUC_DO[xet.mucDo].chu}`}>
                        <BieuTuongMucDo mucDo={xet.mucDo} className="size-3" />
                        {xet.mucDo === "loi" ? "Không lắp được" : xet.mucDo === "canh-bao" ? "Lắp được, có lưu ý" : "Tương thích"}
                      </span>
                      {het && <span className="text-co-phu text-n-7">Hết hàng</span>}
                    </p>
                    {xet.lyDo[0] && <p className={`mt-1 text-co-phu leading-snug ${MAU_MUC_DO[xet.lyDo[0].mucDo].chu}`}>{xet.lyDo[0].thongDiep}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="so text-co-than font-semibold text-n-10">{dinhDangTien(sp.gia)}</span>
                    <button
                      type="button"
                      onClick={() => onChon(sp)}
                      disabled={dangChon}
                      className={lopNut(xet.mucDo === "loi" ? "phu" : "chinh", "nho")}
                    >
                      {dangChon ? "Đang chọn" : "Chọn"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
