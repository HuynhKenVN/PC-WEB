import Link from "next/link";
import { AlertTriangle, Check, Lightbulb, Star, X } from "lucide-react";
import type { KetQua, MucDo } from "@/lib/tuong-thich/types";
import { dinhDangTien } from "@/lib/thong-so";

// ───── Nút ─────

type KieuNut = "chinh" | "phu" | "nhat" | "nguy-hiem";
const LOP_NUT: Record<KieuNut, string> = {
  chinh: "bg-nhan text-white hover:bg-nhan-dam font-semibold",
  phu: "border border-n-5 bg-n-2 text-n-10 hover:border-n-6 hover:bg-n-3",
  nhat: "text-n-9 hover:bg-n-2 hover:text-n-10",
  "nguy-hiem": "border border-loi/40 text-loi hover:bg-loi-nen",
};
export function lopNut(kieu: KieuNut = "chinh", co: "vua" | "nho" = "vua") {
  return `inline-flex items-center justify-center gap-2 rounded-md whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 ${
    co === "vua" ? "h-10 px-4 text-co-than" : "h-8 px-3 text-co-nho"
  } ${LOP_NUT[kieu]}`;
}

// ───── Dấu trạng thái ─────

export const MAU_MUC_DO: Record<MucDo, { chu: string; nen: string; nhan: string }> = {
  loi: { chu: "text-loi", nen: "bg-loi-nen", nhan: "Lỗi" },
  "canh-bao": { chu: "text-canh-bao", nen: "bg-canh-bao-nen", nhan: "Cảnh báo" },
  dat: { chu: "text-dat", nen: "bg-dat-nen", nhan: "Đạt" },
  "goi-y": { chu: "text-nhan-sang", nen: "bg-nhan-nen", nhan: "Gợi ý" },
};

export function BieuTuongMucDo({ mucDo, className = "size-3.5" }: { mucDo: MucDo; className?: string }) {
  const I = mucDo === "loi" ? X : mucDo === "canh-bao" ? AlertTriangle : mucDo === "dat" ? Check : Lightbulb;
  return <I className={className} strokeWidth={2.5} aria-hidden />;
}

/** Con dấu QC. `dong` = chạy hiệu ứng đóng dấu khi xuất hiện. */
export function Dau({ mucDo, nhan, dong = false }: { mucDo: MucDo; nhan?: string; dong?: boolean }) {
  return (
    <span className={`dau ${MAU_MUC_DO[mucDo].chu} ${dong ? "animate-dong-dau" : ""}`}>
      <BieuTuongMucDo mucDo={mucDo} className="size-3" />
      {nhan ?? MAU_MUC_DO[mucDo].nhan}
    </span>
  );
}

// ───── Bảng kết quả tương thích ─────

export function BangKetQua({
  ketQua,
  tenTheoId,
  anDat = false,
  gon = false,
}: {
  ketQua: KetQua[];
  tenTheoId?: Map<number, string>;
  anDat?: boolean;
  gon?: boolean;
}) {
  const ds = anDat ? ketQua.filter((k) => k.mucDo !== "dat") : ketQua;
  if (ds.length === 0) return null;
  return (
    <ul className="divide-y divide-n-3">
      {ds.map((k, i) => (
        <li
          key={`${k.ma}-${k.linhKienLienQuan.join("-")}-${i}`}
          className={`grid grid-cols-[auto_1fr] gap-x-3 ${gon ? "py-2" : "py-3"} animate-hien`}
          style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
        >
          <span className={`mt-[3px] flex size-5 items-center justify-center rounded-[3px] ${MAU_MUC_DO[k.mucDo].nen} ${MAU_MUC_DO[k.mucDo].chu}`}>
            <BieuTuongMucDo mucDo={k.mucDo} className="size-3" />
          </span>
          <div className="min-w-0">
            <p className={`text-co-than ${k.mucDo === "dat" ? "text-n-8" : "text-n-10"}`}>{k.thongDiep}</p>
            {!gon && (
              <p className="mt-0.5 text-co-phu text-n-7">
                {k.nhom}
                {tenTheoId && k.linhKienLienQuan.length > 0 && k.mucDo !== "dat" && (
                  <> · {k.linhKienLienQuan.map((id) => tenTheoId.get(id)).filter(Boolean).join(" + ")}</>
                )}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

// ───── Giá, sao ─────

export function Gia({ gia, giaGoc, lon = false }: { gia: number; giaGoc?: number | null; lon?: boolean }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className={`so font-bold text-n-10 ${lon ? "text-co-tieu-de" : "text-co-noi"}`}>{dinhDangTien(gia)}</span>
      {giaGoc && giaGoc > gia && (
        <>
          <span className={`so text-n-7 line-through ${lon ? "text-co-doc" : "text-co-phu"}`}>{dinhDangTien(giaGoc)}</span>
          <span className={`so font-semibold text-dat ${lon ? "text-co-than" : "text-co-phu"}`}>−{Math.round((1 - gia / giaGoc) * 100)}%</span>
        </>
      )}
    </span>
  );
}

export function Sao({ diem, soDanhGia, co = "nho" }: { diem: number | null; soDanhGia?: number; co?: "nho" | "vua" }) {
  const kt = co === "nho" ? "size-3" : "size-4";
  return (
    <span className="inline-flex items-center gap-1" aria-label={diem ? `${diem.toFixed(1)} trên 5 sao` : "Chưa có đánh giá"}>
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`${kt} ${diem && i <= Math.round(diem) ? "fill-[#f2c94c] text-[#f2c94c]" : "text-n-5"}`} aria-hidden />
        ))}
      </span>
      {soDanhGia !== undefined && <span className="so text-co-phu text-n-8">({soDanhGia})</span>}
    </span>
  );
}

// ───── Khung trang ─────

export function KhungTrang({ children, hep = false }: { children: React.ReactNode; hep?: boolean }) {
  return <div className={`mx-auto px-4 sm:px-6 ${hep ? "max-w-3xl" : "max-w-[1280px]"}`}>{children}</div>;
}

export function TieuDeTrang({ children, phu }: { children: React.ReactNode; phu?: React.ReactNode }) {
  return (
    <div className="pb-6 pt-8 sm:pt-10">
      <h1 className="text-balance text-co-tieu-de font-bold leading-tight tracking-[-0.02em] text-n-10 sm:text-co-tieu-de-lon">{children}</h1>
      {phu && <div className="mt-2 max-w-2xl text-co-than text-n-8">{phu}</div>}
    </div>
  );
}

export function DuongDan({ ds }: { ds: [string, string?][] }) {
  return (
    <nav aria-label="Đường dẫn" className="pt-5 text-co-nho text-n-7">
      <ol className="flex flex-wrap items-center gap-1.5">
        {ds.map(([nhan, href], i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {href ? (
              <Link href={href} className="hover:text-n-10">
                {nhan}
              </Link>
            ) : (
              <span className="text-n-9">{nhan}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function TrangTrong({ tieuDe, moTa, hanhDong }: { tieuDe: string; moTa: string; hanhDong?: React.ReactNode }) {
  return (
    <div className="tem flex flex-col items-start gap-3 px-6 py-10 sm:items-center sm:text-center">
      <p className="text-co-muc font-semibold text-n-10">{tieuDe}</p>
      <p className="max-w-md text-co-than text-n-8">{moTa}</p>
      {hanhDong}
    </div>
  );
}

export function LoiTruong({ loi }: { loi?: string }) {
  if (!loi) return null;
  return <p className="mt-1.5 text-co-nho text-loi">{loi}</p>;
}

export const LOP_O_NHAP =
  "h-10 w-full rounded-md border border-n-4 bg-n-1 px-3 text-co-than text-n-10 placeholder:text-n-7 transition-colors hover:border-n-5 focus:border-nhan focus:outline-none aria-[invalid=true]:border-loi";
