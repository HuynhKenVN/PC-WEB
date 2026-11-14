import type { LoaiLinhKien } from "@/lib/tuong-thich/types";

// Hình minh họa nét mảnh tự vẽ cho từng loại linh kiện (không dùng ảnh có bản quyền).
// Nét chính màu trung tính, một chi tiết màu nhấn; `bien` đổi nhẹ chi tiết để các món cùng loại không giống hệt nhau.

const NET = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const NHAN = { fill: "none", stroke: "var(--color-nhan-sang)", strokeWidth: 1.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Cpu({ bien }: { bien: number }) {
  return (
    <>
      <rect x="45" y="25" width="70" height="70" rx="4" {...NET} />
      <rect x="55" y="35" width="50" height="50" rx="3" {...NET} />
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i}>
          <line x1={52 + i * 9.3} y1="18" x2={52 + i * 9.3} y2="25" {...NET} />
          <line x1={52 + i * 9.3} y1="95" x2={52 + i * 9.3} y2="102" {...NET} />
          <line x1="38" y1={32 + i * 9.3} x2="45" y2={32 + i * 9.3} {...NET} />
          <line x1="115" y1={32 + i * 9.3} x2="122" y2={32 + i * 9.3} {...NET} />
        </g>
      ))}
      <path d="M60 40 l8 0 l-8 8 z" fill="var(--color-nhan-sang)" />
      <line x1="64" y1="72" x2={84 + bien * 4} y2="72" {...NHAN} />
      <line x1="64" y1="78" x2="78" y2="78" {...NET} />
    </>
  );
}

function Mainboard({ bien }: { bien: number }) {
  return (
    <>
      <rect x="30" y="12" width="100" height="96" rx="3" {...NET} />
      <rect x="44" y="24" width="30" height="30" rx="2" {...NHAN} />
      <rect x="51" y="31" width="16" height="16" rx="1" {...NET} />
      {[0, 1, 2, 3].slice(0, bien % 2 ? 2 : 4).map((i) => (
        <rect key={i} x={84 + i * 6} y="20" width="3" height="40" rx="1" {...NET} />
      ))}
      <rect x="40" y="66" width="80" height="5" rx="1" {...NET} />
      <rect x="40" y="82" width="80" height="5" rx="1" {...NET} />
      <rect x="44" y="94" width="34" height="6" rx="1" {...NET} />
      <circle cx="110" cy="97" r="5" {...NET} />
    </>
  );
}

function Ram({ bien }: { bien: number }) {
  return (
    <>
      <path d="M18 45 h124 v34 h-55 v-4 h-6 v4 h-63 z" {...NET} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={26 + i * 19} y="52" width="13" height="16" rx="1" {...NET} />
      ))}
      <line x1="18" y1="40" x2="142" y2="40" {...(bien % 2 ? NHAN : NET)} />
      {Array.from({ length: 20 }, (_, i) => (
        <line key={i} x1={24 + i * 6} y1="79" x2={24 + i * 6} y2="84" {...NET} strokeWidth={1} />
      ))}
    </>
  );
}

function Vga({ bien }: { bien: number }) {
  const quat = bien % 3 === 0 ? 3 : 2;
  const r = quat === 3 ? 14 : 18;
  const buoc = 120 / quat;
  return (
    <>
      <rect x="14" y="30" width="132" height="54" rx="5" {...NET} />
      {Array.from({ length: quat }, (_, i) => {
        const cx = 20 + buoc / 2 + i * buoc;
        return (
          <g key={i}>
            <circle cx={cx} cy="57" r={r} {...NET} />
            <circle cx={cx} cy="57" r="4" {...NHAN} />
            {[0, 72, 144, 216, 288].map((g) => (
              <path key={g} d={`M${cx} 57 q ${r * 0.5} ${-r * 0.2} ${r * 0.7} ${-r * 0.75}`} transform={`rotate(${g} ${cx} 57)`} {...NET} strokeWidth={1} />
            ))}
          </g>
        );
      })}
      <path d="M30 84 v8 h60 v-8" {...NET} />
      <line x1="146" y1="40" x2="146" y2="74" {...NHAN} />
    </>
  );
}

function OCung({ bien }: { bien: number }) {
  if (bien === 0) {
    // SATA 2.5"
    return (
      <>
        <rect x="40" y="18" width="80" height="84" rx="5" {...NET} />
        <rect x="52" y="34" width="56" height="30" rx="2" {...NET} />
        <line x1="58" y1="44" x2="96" y2="44" {...NHAN} />
        <line x1="58" y1="52" x2="84" y2="52" {...NET} />
        <rect x="60" y="94" width="18" height="5" {...NET} />
        <rect x="82" y="94" width="10" height="5" {...NET} />
      </>
    );
  }
  return (
    <>
      <path d="M14 50 h120 a6 6 0 0 1 0 20 h-120 z" {...NET} />
      <rect x="30" y="54" width="26" height="12" rx="1" {...NET} />
      <rect x="62" y="54" width="22" height="12" rx="1" {...NET} />
      <rect x="90" y="54" width="22" height="12" rx="1" {...NET} />
      <line x1="34" y1="60" x2="52" y2="60" {...NHAN} />
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1="14" y1={52 + i * 3.2} x2="9" y2={52 + i * 3.2} {...NET} strokeWidth={1} />
      ))}
      <circle cx="134" cy="60" r="2.5" {...NET} />
    </>
  );
}

function Nguon({ bien }: { bien: number }) {
  return (
    <>
      <rect x="28" y="22" width="104" height="76" rx="4" {...NET} />
      <circle cx="72" cy="60" r="28" {...NET} />
      {[-18, -9, 0, 9, 18].map((d) => (
        <line key={d} x1={72 - Math.sqrt(784 - d * d) * 0.9} y1={60 + d} x2={72 + Math.sqrt(784 - d * d) * 0.9} y2={60 + d} {...NET} strokeWidth={1} />
      ))}
      <circle cx="72" cy="60" r="6" {...NHAN} />
      <rect x="110" y="30" width="14" height="10" rx="1" {...NET} />
      <line x1="110" y1={52 + bien * 2} x2="124" y2={52 + bien * 2} {...NHAN} />
      <line x1="110" y1="80" x2="124" y2="80" {...NET} />
    </>
  );
}

function Case({ bien }: { bien: number }) {
  const cao = bien === 0 ? 70 : 96;
  const y = 108 - cao;
  return (
    <>
      <rect x="44" y={y} width="72" height={cao} rx="4" {...NET} />
      <rect x="52" y={y + 8} width="44" height={cao - 16} rx="2" {...NHAN} />
      <circle cx="106" cy={y + 12} r="3" {...NET} />
      {Array.from({ length: Math.floor((cao - 28) / 8) }, (_, i) => (
        <line key={i} x1="102" y1={y + 24 + i * 8} x2="110" y2={y + 24 + i * 8} {...NET} strokeWidth={1} />
      ))}
      <line x1="50" y1="110" x2="58" y2="110" {...NET} />
      <line x1="102" y1="110" x2="110" y2="110" {...NET} />
    </>
  );
}

function TanNhiet({ bien }: { bien: number }) {
  if (bien === 3) {
    // AIO: radiator + bơm
    return (
      <>
        <rect x="16" y="26" width="128" height="30" rx="3" {...NET} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={38 + i * 42} cy="41" r="11" {...NET} />
        ))}
        <path d="M50 56 C50 80 70 74 72 88" {...NET} />
        <path d="M110 56 C110 80 92 74 88 88" {...NET} />
        <rect x="64" y="86" width="32" height="22" rx="4" {...NHAN} />
      </>
    );
  }
  const n = bien === 2 ? 2 : 1;
  return (
    <>
      {Array.from({ length: n }, (_, k) => {
        const x = n === 2 ? 36 + k * 48 : 56;
        return (
          <g key={k}>
            <rect x={x} y="14" width="40" height="76" rx="2" {...NET} />
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1={x} y1={20 + i * 6} x2={x + 40} y2={20 + i * 6} {...NET} strokeWidth={1} />
            ))}
          </g>
        );
      })}
      <rect x={n === 2 ? 76 : 48} y="28" width={n === 2 ? 8 : 8} height="50" rx="2" {...NHAN} />
      <rect x="54" y="94" width="52" height="14" rx="2" {...NET} />
    </>
  );
}

const VE: Record<LoaiLinhKien, (p: { bien: number }) => React.ReactElement> = {
  cpu: Cpu,
  mainboard: Mainboard,
  ram: Ram,
  vga: Vga,
  "o-cung": OCung,
  nguon: Nguon,
  case: Case,
  "tan-nhiet": TanNhiet,
};

/** `bien`: biến thể nhỏ theo sản phẩm (0–3). */
export function HinhLinhKien({ loai, bien = 1, className = "" }: { loai: LoaiLinhKien; bien?: number; className?: string }) {
  const Ve = VE[loai];
  return (
    <svg viewBox="0 0 160 120" className={`text-n-7 ${className}`} role="img" aria-hidden="true">
      <Ve bien={bien} />
    </svg>
  );
}

/** Chọn biến thể ổn định từ sản phẩm. */
export function bienCua(sp: { loai: LoaiLinhKien; slug: string; specs: unknown }): number {
  if (sp.loai === "o-cung") return (sp.specs as { giaoTiep: string }).giaoTiep === "SATA" ? 0 : 1;
  if (sp.loai === "tan-nhiet") {
    const s = sp.specs as { kieu: string; tdpToiDa: number };
    if (s.kieu === "nuoc") return 3;
    return s.tdpToiDa >= 260 ? 2 : 1;
  }
  if (sp.loai === "case") return (sp.specs as { kichThuocMain: string[] }).kichThuocMain.includes("ATX") ? 1 : 0;
  let h = 0;
  for (const c of sp.slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 4;
}
