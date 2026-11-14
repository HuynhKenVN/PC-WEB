"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Link2, ShoppingCart, Trash2 } from "lucide-react";
import { useKho } from "./kho-trinh-duyet";
import { lopNut } from "./ui";

export function NutCauHinh({ id, items, laChu }: { id: number; items: { id: number; soLuong: number }[]; laChu: boolean }) {
  const { themNhieu } = useKho();
  const router = useRouter();
  const [daThem, setDaThem] = useState(false);
  const [daChep, setDaChep] = useState(false);
  const [dangXoa, setDangXoa] = useState(false);
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => {
          themNhieu(items);
          setDaThem(true);
        }}
        className={lopNut("chinh")}
      >
        {daThem ? <Check className="size-4" aria-hidden /> : <ShoppingCart className="size-4" aria-hidden />}
        {daThem ? "Đã thêm vào giỏ" : "Thêm cả bộ vào giỏ"}
      </button>
      {laChu && (
        <button type="button" onClick={() => router.push(`/build-pc?sua=${id}`)} className={lopNut("phu")}>
          Sửa trong Build PC
        </button>
      )}
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(location.origin + `/cau-hinh/${id}`);
            setDaChep(true);
            setTimeout(() => setDaChep(false), 1600);
          } catch {
            /* trình duyệt chặn clipboard */
          }
        }}
        className={lopNut("nhat")}
      >
        {daChep ? <Check className="size-4 text-dat" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
        {daChep ? "Đã chép liên kết" : "Chép liên kết chia sẻ"}
      </button>
      {laChu && (
        <button
          type="button"
          disabled={dangXoa}
          onClick={async () => {
            if (!confirm("Xóa cấu hình này? Không hoàn tác được.")) return;
            setDangXoa(true);
            const r = await fetch(`/api/cau-hinh/${id}`, { method: "DELETE" });
            if (r.ok) {
              router.push("/cau-hinh");
              router.refresh();
            } else setDangXoa(false);
          }}
          className={lopNut("nguy-hiem")}
        >
          <Trash2 className="size-4" aria-hidden /> {dangXoa ? "Đang xóa…" : "Xóa"}
        </button>
      )}
    </div>
  );
}
