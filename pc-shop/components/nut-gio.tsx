"use client";

import { useEffect, useState } from "react";
import { Check, GitCompareArrows, ShoppingCart } from "lucide-react";
import { useKho } from "./kho-trinh-duyet";
import { lopNut } from "./ui";

/** Nút thêm vào giỏ: đổi thành dấu tích ngắn sau khi bấm để xác nhận. */
export function NutThemGio({ id, het, co = "vua", day = false }: { id: number; het: boolean; co?: "vua" | "nho"; day?: boolean }) {
  const { them } = useKho();
  const [vuaThem, setVuaThem] = useState(false);
  useEffect(() => {
    if (!vuaThem) return;
    const t = setTimeout(() => setVuaThem(false), 1400);
    return () => clearTimeout(t);
  }, [vuaThem]);
  return (
    <button
      type="button"
      disabled={het}
      onClick={() => {
        them(id);
        setVuaThem(true);
      }}
      className={`${lopNut(vuaThem ? "phu" : "chinh", co)} ${day ? "min-w-0 flex-1" : ""}`}
    >
      {het ? (
        "Hết hàng"
      ) : vuaThem ? (
        <>
          <Check className="size-4 text-dat animate-dong-dau" aria-hidden /> Đã thêm
        </>
      ) : (
        <>
          <ShoppingCart className="size-4 shrink-0" aria-hidden /> <span className="sm:hidden">Thêm</span><span className="hidden sm:inline">Thêm vào giỏ</span>
        </>
      )}
    </button>
  );
}

export function NutSoSanh({ id, co = "nho", gon = false }: { id: number; co?: "vua" | "nho"; gon?: boolean }) {
  const { soSanh, batSoSanh } = useKho();
  const dang = soSanh.includes(id);
  return (
    <button type="button" onClick={() => batSoSanh(id)} aria-pressed={dang} className={`${lopNut(dang ? "phu" : "nhat", co)} ${dang ? "text-nhan-sang" : ""} ${gon ? "!px-2" : ""}`} title={gon ? "So sánh" : undefined}>
      <GitCompareArrows className="size-4" aria-hidden /> <span className={gon ? "sr-only" : ""}>{dang ? "Đang so sánh" : "So sánh"}</span>
    </button>
  );
}
