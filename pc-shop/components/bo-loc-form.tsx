"use client";

import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { SlidersHorizontal } from "lucide-react";

export interface NhomLoc {
  khoa: string;
  nhan: string;
  luaChon: { giaTri: string; dem: number }[];
  daChon: string[];
}

/** Form lọc dạng GET: đổi ô nào là tự áp dụng (giữ URL chia sẻ được, chạy được cả khi tắt JS). */
export function BoLocForm({
  hanhDong,
  nhom,
  giaTu,
  giaDen,
  conHang,
  giuLai,
}: {
  hanhDong: string;
  nhom: NhomLoc[];
  giaTu?: string;
  giaDen?: string;
  conHang: boolean;
  giuLai: Record<string, string>;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [dangTai, batDau] = useTransition();
  const ap = () => {
    const f = ref.current;
    if (!f) return;
    const q = new URLSearchParams();
    for (const [k, v] of new FormData(f)) if (String(v) !== "") q.append(k, String(v));
    batDau(() => router.replace(`${hanhDong}?${q.toString()}`, { scroll: false }));
  };
  const coLoc = nhom.some((n) => n.daChon.length) || giaTu || giaDen || conHang;

  const noiDung = (
    <form ref={ref} action={hanhDong} onChange={(e) => (e.target as unknown as HTMLInputElement).type !== "number" && ap()} onSubmit={(e) => (e.preventDefault(), ap())} className={`flex flex-col gap-5 transition-opacity ${dangTai ? "opacity-60" : ""}`}>
      {Object.entries(giuLai).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {nhom.map((n) => (
        <fieldset key={n.khoa}>
          <legend className="nhan-cot mb-2">{n.nhan}</legend>
          <div className="flex flex-col gap-0.5">
            {n.luaChon.map((lc) => (
              <label key={lc.giaTri} className="flex cursor-pointer items-center gap-2.5 rounded px-1.5 py-1 text-co-than text-n-9 hover:bg-n-3 hover:text-n-10">
                <input type="checkbox" name={n.khoa} value={lc.giaTri} defaultChecked={n.daChon.includes(lc.giaTri)} className="size-4 rounded" />
                <span className="flex-1">{lc.giaTri}</span>
                <span className="so text-co-nhan text-n-7">{lc.dem}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <fieldset>
        <legend className="nhan-cot mb-2">Khoảng giá (₫)</legend>
        <div className="flex items-center gap-2">
          <input name="giaTu" type="number" inputMode="numeric" min={0} step={100000} defaultValue={giaTu} onBlur={ap} placeholder="Từ" aria-label="Giá từ" className="so h-9 w-full min-w-0 rounded-md border border-n-4 bg-n-1 px-2.5 text-co-nho text-n-10 placeholder:text-n-7 focus:border-nhan focus:outline-none" />
          <span className="text-n-7">–</span>
          <input name="giaDen" type="number" inputMode="numeric" min={0} step={100000} defaultValue={giaDen} onBlur={ap} placeholder="Đến" aria-label="Giá đến" className="so h-9 w-full min-w-0 rounded-md border border-n-4 bg-n-1 px-2.5 text-co-nho text-n-10 placeholder:text-n-7 focus:border-nhan focus:outline-none" />
        </div>
      </fieldset>
      <label className="flex cursor-pointer items-center gap-2.5 px-1.5 text-co-than text-n-9">
        <input type="checkbox" name="conHang" value="1" defaultChecked={conHang} className="size-4" /> Chỉ hiện hàng còn
      </label>
      {coLoc && (
        <button type="button" onClick={() => batDau(() => router.replace(`${hanhDong}${giuLai.q ? `?q=${encodeURIComponent(giuLai.q)}` : ""}`, { scroll: false }))} className="self-start text-co-nho text-nhan-sang hover:underline">
          Xóa bộ lọc
        </button>
      )}
    </form>
  );

  return (
    <>
      <details className="tem group lg:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-co-than font-medium text-n-10">
          <SlidersHorizontal className="size-4" aria-hidden /> Bộ lọc
          {coLoc && <span className="size-1.5 rounded-full bg-nhan-sang" />}
        </summary>
        <div className="border-t border-n-4 p-4">{noiDung}</div>
      </details>
      <div className="tem hidden p-4 lg:block">{noiDung}</div>
    </>
  );
}

export function ChonSapXep({ hienTai, luaChon }: { hienTai: string; luaChon: [string, string][] }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-co-nho text-n-8">
      Sắp xếp
      <select
        value={hienTai}
        onChange={(e) => {
          const u = new URL(location.href);
          u.searchParams.set("sap", e.target.value);
          router.replace(u.pathname + u.search, { scroll: false });
        }}
        className="h-9 rounded-md border border-n-4 bg-n-1 px-2.5 text-co-nho text-n-10 focus:border-nhan focus:outline-none"
      >
        {luaChon.map(([v, n]) => (
          <option key={v} value={v}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}
