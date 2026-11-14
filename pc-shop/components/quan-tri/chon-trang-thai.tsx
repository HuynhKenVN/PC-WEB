"use client";

import { useRef, useTransition } from "react";
import { doiTrangThaiDon } from "@/lib/actions/quan-tri";

const TT = [
  ["cho-xac-nhan", "Chờ xác nhận"],
  ["dang-giao", "Đang giao"],
  ["da-giao", "Đã giao"],
  ["da-huy", "Đã hủy"],
] as const;

/** Đổi trạng thái đơn ngay khi chọn (không cần nút lưu). */
export function ChonTrangThai({ id, hienTai }: { id: number; hienTai: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const [dang, batDau] = useTransition();
  return (
    <form ref={ref} action={doiTrangThaiDon} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <label htmlFor={`tt-${id}`} className="text-co-nho text-n-8">
        Trạng thái
      </label>
      <select
        id={`tt-${id}`}
        name="trangThai"
        defaultValue={hienTai}
        disabled={dang}
        onChange={(e) => {
          if (e.target.value === "da-huy" && !confirm("Hủy đơn này? Tồn kho sẽ được hoàn lại.")) {
            e.target.value = hienTai;
            return;
          }
          const fd = new FormData(ref.current!);
          batDau(() => doiTrangThaiDon(fd));
        }}
        className="h-9 rounded-md border border-n-4 bg-n-1 px-2.5 text-co-nho text-n-10 focus:border-nhan focus:outline-none disabled:opacity-60"
      >
        {TT.map(([v, n]) => (
          <option key={v} value={v}>
            {n}
          </option>
        ))}
      </select>
      <noscript>
        <button className="text-co-nho underline">Lưu</button>
      </noscript>
    </form>
  );
}
