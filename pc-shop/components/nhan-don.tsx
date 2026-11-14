import type { TrangThaiDon } from "@/lib/don-hang";
import { TEN_TRANG_THAI } from "@/lib/don-hang";

const MAU: Record<TrangThaiDon, string> = {
  "cho-xac-nhan": "text-canh-bao",
  "dang-giao": "text-nhan-sang",
  "da-giao": "text-dat",
  "da-huy": "text-n-8",
};

export function NhanTrangThai({ trangThai }: { trangThai: TrangThaiDon }) {
  return <span className={`dau ${MAU[trangThai]}`}>{TEN_TRANG_THAI[trangThai]}</span>;
}

/** Mã QR mẫu (không mã hóa gì thật): lưới ô vuông giả, tạo ổn định từ mã đơn. */
export function QrMau({ hat }: { hat: number }) {
  const n = 25;
  let x = hat * 2654435761;
  const ngauNhien = () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
  const oDinhVi = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const o: [number, number][] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!oDinhVi(r, c) && ngauNhien() > 0.52) o.push([r, c]);
  const dinhVi = (r: number, c: number) => (
    <g key={`${r}-${c}`}>
      <rect x={c} y={r} width="7" height="7" fill="#0b0d11" />
      <rect x={c + 1} y={r + 1} width="5" height="5" fill="#fff" />
      <rect x={c + 2} y={r + 2} width="3" height="3" fill="#0b0d11" />
    </g>
  );
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} className="size-44 rounded-md bg-white" role="img" aria-label="Mã QR mẫu, không quét được">
      {o.map(([r, c]) => (
        <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0b0d11" />
      ))}
      {dinhVi(0, 0)}
      {dinhVi(0, n - 7)}
      {dinhVi(n - 7, 0)}
    </svg>
  );
}
