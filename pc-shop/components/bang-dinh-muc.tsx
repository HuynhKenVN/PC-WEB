import { dinhDangTien } from "@/lib/thong-so";

/**
 * Bảng định mức: tóm tắt cả bộ máy theo kiểu nhãn định mức dán trên vỏ nguồn —
 * các ô kẻ mảnh, nhãn chữ hoa nhỏ, giá trị đơn cách.
 */
export function BangDinhMuc({
  tieuDe,
  tongTien,
  congSuat,
  nguonDeNghi,
  congSuatNguon,
  soLoi,
  soCanhBao,
  soMon,
  doPhanGiai,
}: {
  tieuDe: string;
  tongTien: number;
  congSuat: number;
  nguonDeNghi: number;
  congSuatNguon?: number | null;
  soLoi: number;
  soCanhBao: number;
  soMon: number;
  doPhanGiai?: string;
}) {
  const tiLe = congSuatNguon ? Math.min(1, congSuat / congSuatNguon) : null;
  return (
    <div className="tem overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-n-4 bg-n-3 px-3 py-1.5">
        <span className="nhan-cot truncate !text-n-9">{tieuDe}</span>
        <span className="so shrink-0 text-co-nhan text-n-8">
          {soMon} món{doPhanGiai ? ` · ${doPhanGiai}` : ""}
        </span>
      </div>
      <dl className="grid grid-cols-2 [&>div]:border-n-4">
        <div className="col-span-2 border-b px-3 py-2.5">
          <dt className="nhan-cot">Tổng tiền</dt>
          <dd className="so mt-0.5 text-co-gia font-bold leading-tight text-n-10">{dinhDangTien(tongTien)}</dd>
        </div>
        <div className="border-b border-r px-3 py-2.5">
          <dt className="nhan-cot">Công suất ước tính</dt>
          <dd className="so mt-0.5 text-co-muc font-semibold text-n-10">
            {congSuat}
            <span className="text-co-nho text-n-8"> W</span>
          </dd>
        </div>
        <div className="border-b px-3 py-2.5">
          <dt className="nhan-cot">Nguồn nên dùng</dt>
          <dd className="so mt-0.5 text-co-muc font-semibold text-n-10">
            ≥ {nguonDeNghi}
            <span className="text-co-nho text-n-8"> W</span>
          </dd>
        </div>
        {tiLe !== null && (
          <div className="col-span-2 border-b px-3 py-2.5">
            <dt className="nhan-cot flex justify-between">
              <span>Tải nguồn</span>
              <span className="so normal-case tracking-normal">
                {congSuat} / {congSuatNguon} W
              </span>
            </dt>
            <dd className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-n-4">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ease-[var(--ease-ra)] ${tiLe >= 1 ? "bg-loi" : tiLe > 1 / 1.3 ? "bg-canh-bao" : "bg-dat"}`}
                style={{ width: `${Math.round(tiLe * 100)}%` }}
              />
            </dd>
          </div>
        )}
        <div className="border-r px-3 py-2.5">
          <dt className="nhan-cot">Lỗi</dt>
          <dd className={`so mt-0.5 text-co-muc font-bold ${soLoi ? "text-loi" : "text-n-7"}`}>{soLoi}</dd>
        </div>
        <div className="px-3 py-2.5">
          <dt className="nhan-cot">Cảnh báo</dt>
          <dd className={`so mt-0.5 text-co-muc font-bold ${soCanhBao ? "text-canh-bao" : "text-n-7"}`}>{soCanhBao}</dd>
        </div>
      </dl>
    </div>
  );
}
