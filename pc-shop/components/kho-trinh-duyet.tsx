"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { SanPhamDayDu } from "@/lib/db";

// Trạng thái phía trình duyệt: giỏ hàng (localStorage, đồng bộ máy chủ khi đăng nhập),
// danh sách so sánh, danh mục sản phẩm tải một lần.

export type DongGio = { id: number; soLuong: number };

const KHOA_GIO = "apex.gio";
const KHOA_SO_SANH = "apex.so-sanh";

function doc<T>(khoa: string, macDinh: T): T {
  try {
    const s = localStorage.getItem(khoa);
    return s ? (JSON.parse(s) as T) : macDinh;
  } catch {
    return macDinh;
  }
}
function ghi(khoa: string, giaTri: unknown) {
  try {
    localStorage.setItem(khoa, JSON.stringify(giaTri));
  } catch {
    /* chế độ riêng tư: bỏ qua */
  }
}

interface KhoGio {
  gio: DongGio[];
  daNap: boolean;
  soMon: number;
  them: (id: number, soLuong?: number) => void;
  themNhieu: (ds: DongGio[]) => void;
  datSoLuong: (id: number, soLuong: number) => void;
  xoa: (id: number) => void;
  xoaHet: () => void;
  /** Tăng mỗi lần thêm vào giỏ — để biểu tượng giỏ nảy lên. */
  nhipThem: number;
  soSanh: number[];
  batSoSanh: (id: number) => void;
  xoaSoSanh: () => void;
}

const Ctx = createContext<KhoGio | null>(null);

function gop(a: DongGio[], b: DongGio[]): DongGio[] {
  const m = new Map<number, number>();
  for (const d of [...a, ...b]) m.set(d.id, Math.max(m.get(d.id) ?? 0, d.soLuong));
  return [...m].map(([id, soLuong]) => ({ id, soLuong }));
}

export function KhoProvider({ daDangNhap, children }: { daDangNhap: boolean; children: React.ReactNode }) {
  const [gio, setGio] = useState<DongGio[]>([]);
  const [soSanh, setSoSanh] = useState<number[]>([]);
  const [daNap, setDaNap] = useState(false);
  const [nhipThem, setNhipThem] = useState(0);
  const dongBo = useRef(false);

  // Nạp từ localStorage, rồi gộp với giỏ trên máy chủ nếu đã đăng nhập
  useEffect(() => {
    const local = doc<DongGio[]>(KHOA_GIO, []);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đọc localStorage chỉ có được sau khi mount
    setGio(local);
    setSoSanh(doc<number[]>(KHOA_SO_SANH, []));
    if (!daDangNhap) {
      dongBo.current = false;
      setDaNap(true);
      return;
    }
    let huy = false;
    fetch("/api/gio-hang")
      .then((r) => (r.ok ? r.json() : []))
      .then((server: DongGio[]) => {
        if (huy) return;
        const gopLai = gop(server, local);
        setGio(gopLai);
        dongBo.current = true;
        setDaNap(true);
      })
      .catch(() => setDaNap(true));
    return () => {
      huy = true;
    };
  }, [daDangNhap]);

  // Ghi localStorage và đẩy lên máy chủ (gộp nhiều thay đổi liên tiếp)
  useEffect(() => {
    if (!daNap) return;
    ghi(KHOA_GIO, gio);
    if (!dongBo.current) return;
    const t = setTimeout(() => {
      fetch("/api/gio-hang", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(gio) }).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [gio, daNap]);

  useEffect(() => {
    if (daNap) ghi(KHOA_SO_SANH, soSanh);
  }, [soSanh, daNap]);

  const them = useCallback((id: number, soLuong = 1) => {
    setGio((g) => {
      const co = g.find((d) => d.id === id);
      return co ? g.map((d) => (d.id === id ? { ...d, soLuong: Math.min(99, d.soLuong + soLuong) } : d)) : [...g, { id, soLuong }];
    });
    setNhipThem((n) => n + 1);
  }, []);
  const themNhieu = useCallback((ds: DongGio[]) => {
    setGio((g) => {
      const m = new Map(g.map((d) => [d.id, d.soLuong]));
      for (const d of ds) m.set(d.id, Math.min(99, (m.get(d.id) ?? 0) + d.soLuong));
      return [...m].map(([id, soLuong]) => ({ id, soLuong }));
    });
    setNhipThem((n) => n + 1);
  }, []);
  const datSoLuong = useCallback((id: number, soLuong: number) => {
    setGio((g) => (soLuong <= 0 ? g.filter((d) => d.id !== id) : g.map((d) => (d.id === id ? { ...d, soLuong: Math.min(99, soLuong) } : d))));
  }, []);
  const xoa = useCallback((id: number) => setGio((g) => g.filter((d) => d.id !== id)), []);
  const xoaHet = useCallback(() => setGio([]), []);
  const batSoSanh = useCallback(
    (id: number) => setSoSanh((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id].slice(-3))),
    [],
  );
  const xoaSoSanh = useCallback(() => setSoSanh([]), []);

  const giaTri = useMemo<KhoGio>(
    () => ({
      gio,
      daNap,
      soMon: gio.reduce((t, d) => t + d.soLuong, 0),
      them,
      themNhieu,
      datSoLuong,
      xoa,
      xoaHet,
      nhipThem,
      soSanh,
      batSoSanh,
      xoaSoSanh,
    }),
    [gio, daNap, them, themNhieu, datSoLuong, xoa, xoaHet, nhipThem, soSanh, batSoSanh, xoaSoSanh],
  );
  return <Ctx.Provider value={giaTri}>{children}</Ctx.Provider>;
}

export function useKho(): KhoGio {
  const k = useContext(Ctx);
  if (!k) throw new Error("useKho phải nằm trong KhoProvider");
  return k;
}

// ───── Danh mục sản phẩm, tải một lần cho cả phiên ─────

let boNho: SanPhamDayDu[] | null = null;
let dangTai: Promise<void> | null = null;
const nguoiNghe = new Set<() => void>();

function taiDanhMuc() {
  if (!dangTai) {
    dangTai = fetch("/api/san-pham")
      .then((r) => r.json())
      .then((ds: SanPhamDayDu[]) => {
        boNho = ds;
        nguoiNghe.forEach((f) => f());
      })
      .catch(() => {
        dangTai = null;
      });
  }
}

/** Trả về null khi đang tải. */
export function useDanhMuc(): SanPhamDayDu[] | null {
  return useSyncExternalStore(
    (f) => {
      nguoiNghe.add(f);
      taiDanhMuc();
      return () => nguoiNghe.delete(f);
    },
    () => boNho,
    () => null,
  );
}
