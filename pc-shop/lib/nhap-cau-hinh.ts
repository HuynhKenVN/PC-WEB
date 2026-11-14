// Nháp cấu hình Build PC lưu trong localStorage (chỉ dùng ở trình duyệt).
import type { DoPhanGiai, LoaiLinhKien } from "./tuong-thich/types";

export interface NhapCauHinh {
  ten: string;
  doPhanGiai: DoPhanGiai;
  items: { id: number; soLuong: number }[];
  /** Đang sửa cấu hình đã lưu nào (null = cấu hình mới). */
  suaId: number | null;
}

const KHOA = "apex.nhap-cau-hinh";
export const NHAP_TRONG: NhapCauHinh = { ten: "Cấu hình của tôi", doPhanGiai: "1080p", items: [], suaId: null };

export function docNhap(): NhapCauHinh {
  try {
    const s = localStorage.getItem(KHOA);
    if (!s) return NHAP_TRONG;
    const n = JSON.parse(s) as Partial<NhapCauHinh>;
    return { ...NHAP_TRONG, ...n, items: Array.isArray(n.items) ? n.items : [] };
  } catch {
    return NHAP_TRONG;
  }
}

export function ghiNhap(n: NhapCauHinh) {
  try {
    localStorage.setItem(KHOA, JSON.stringify(n));
  } catch {
    /* bỏ qua */
  }
}

/** Loại chỉ được chọn một món (ổ cứng được nhiều món). */
export const CHON_NHIEU: LoaiLinhKien[] = ["o-cung"];

/** Đặt một sản phẩm vào nháp: thay món cùng loại, trừ ổ cứng thì cộng thêm. */
export function datVaoNhap(n: NhapCauHinh, sp: { id: number; loai: LoaiLinhKien }, loaiCua: (id: number) => LoaiLinhKien | undefined): NhapCauHinh {
  if (CHON_NHIEU.includes(sp.loai)) {
    if (n.items.some((i) => i.id === sp.id)) return n;
    return { ...n, items: [...n.items, { id: sp.id, soLuong: 1 }] };
  }
  return { ...n, items: [...n.items.filter((i) => loaiCua(i.id) !== sp.loai), { id: sp.id, soLuong: 1 }] };
}
