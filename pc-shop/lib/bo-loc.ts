import type { SanPhamDayDu } from "./db";
import type { LoaiLinhKien } from "./tuong-thich/types";

// Bộ lọc thông số theo từng loại: mỗi bộ lọc lấy ra một hoặc nhiều giá trị chuỗi từ sản phẩm.
export interface DinhNghiaLoc {
  khoa: string;
  nhan: string;
  lay: (sp: SanPhamDayDu) => string[];
}

const s = (sp: SanPhamDayDu) => sp.specs as unknown as Record<string, unknown>;
const mot = (k: string) => (sp: SanPhamDayDu) => [String(s(sp)[k])];
const coKhong = (k: string) => (sp: SanPhamDayDu) => [s(sp)[k] ? "Có" : "Không"];

export const BO_LOC: Record<LoaiLinhKien, DinhNghiaLoc[]> = {
  cpu: [
    { khoa: "socket", nhan: "Socket", lay: mot("socket") },
    { khoa: "igpu", nhan: "Đồ họa tích hợp", lay: coKhong("doHoaTichHop") },
    { khoa: "tan", nhan: "Kèm tản", lay: coKhong("kemTan") },
  ],
  mainboard: [
    { khoa: "socket", nhan: "Socket", lay: mot("socket") },
    { khoa: "chipset", nhan: "Chipset", lay: mot("chipset") },
    { khoa: "kt", nhan: "Kích thước", lay: mot("kichThuoc") },
    { khoa: "ram", nhan: "Chuẩn RAM", lay: mot("chuanRam") },
  ],
  ram: [
    { khoa: "chuan", nhan: "Chuẩn", lay: mot("chuan") },
    { khoa: "gb", nhan: "Dung lượng", lay: (sp) => [`${(s(sp).soThanh as number) * (s(sp).dungLuongMoiThanh as number)} GB`] },
  ],
  vga: [
    { khoa: "hang-chip", nhan: "Hãng chip", lay: (sp) => [String(s(sp).chip).startsWith("Radeon") ? "AMD Radeon" : "NVIDIA GeForce"] },
    { khoa: "vram", nhan: "VRAM", lay: (sp) => [`${s(sp).vram} GB`] },
  ],
  "o-cung": [{ khoa: "giao-tiep", nhan: "Giao tiếp", lay: mot("giaoTiep") }],
  nguon: [
    { khoa: "w", nhan: "Công suất", lay: (sp) => [`${s(sp).congSuat} W`] },
    { khoa: "80", nhan: "80 Plus", lay: mot("chuan80Plus") },
  ],
  case: [{ khoa: "main", nhan: "Mainboard hỗ trợ", lay: (sp) => s(sp).kichThuocMain as string[] }],
  "tan-nhiet": [{ khoa: "kieu", nhan: "Kiểu", lay: (sp) => [s(sp).kieu === "khi" ? "Tản khí" : "Tản nước AIO"] }],
};

export type SapXep = "pho-bien" | "gia-tang" | "gia-giam" | "danh-gia";
export const NHAN_SAP_XEP: Record<SapXep, string> = {
  "pho-bien": "Mặc định",
  "gia-tang": "Giá thấp → cao",
  "gia-giam": "Giá cao → thấp",
  "danh-gia": "Đánh giá cao",
};

export type ThamSo = Record<string, string | string[] | undefined>;
export const mang = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

/** Áp dụng lọc chung (hãng, giá, còn hàng) + lọc thông số + sắp xếp. */
export function locVaSap(ds: SanPhamDayDu[], ts: ThamSo, boLoc: DinhNghiaLoc[] = []) {
  const hang = mang(ts.hang);
  const giaTu = Number(ts.giaTu) || 0;
  const giaDen = Number(ts.giaDen) || Infinity;
  const conHang = ts.conHang === "1";
  const giam = ts.giam === "1";
  let ra = ds.filter(
    (sp) =>
      (hang.length === 0 || hang.includes(sp.hang)) &&
      sp.gia >= giaTu &&
      sp.gia <= giaDen &&
      (!conHang || sp.tonKho > 0) &&
      (!giam || (sp.giaGoc ?? 0) > sp.gia),
  );
  for (const bl of boLoc) {
    const chon = mang(ts[bl.khoa]);
    if (chon.length) ra = ra.filter((sp) => bl.lay(sp).some((v) => chon.includes(v)));
  }
  const sap = (ts.sap as SapXep) ?? "pho-bien";
  if (sap === "gia-tang") ra = [...ra].sort((a, b) => a.gia - b.gia);
  else if (sap === "gia-giam") ra = [...ra].sort((a, b) => b.gia - a.gia);
  else if (sap === "danh-gia") ra = [...ra].sort((a, b) => (b.diemTb ?? 0) - (a.diemTb ?? 0) || b.soDanhGia - a.soDanhGia);
  return ra;
}
