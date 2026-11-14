import type {
  KetQua,
  LinhKienChon,
  LoaiLinhKien,
  MucDo,
  SanPhamLoai,
  Socket,
  TuyChonKiemTra,
} from "./types";

export interface DongLoai<L extends LoaiLinhKien> {
  sp: SanPhamLoai<L>;
  soLuong: number;
}

export type BoLinhKien = {
  [L in LoaiLinhKien]: DongLoai<L>[];
} & { cheDo: "cau-hinh" | "gio-hang" };

/** Gom danh sách linh kiện theo loại; gộp các dòng trùng sản phẩm. */
export function gomTheoLoai(ds: LinhKienChon[], tuyChon: TuyChonKiemTra = {}): BoLinhKien {
  const bo = {
    cpu: [],
    mainboard: [],
    ram: [],
    vga: [],
    "o-cung": [],
    nguon: [],
    case: [],
    "tan-nhiet": [],
    cheDo: tuyChon.cheDo ?? "cau-hinh",
  } as unknown as BoLinhKien;

  for (const { sanPham, soLuong } of ds) {
    if (soLuong <= 0) continue;
    const mang = bo[sanPham.loai] as DongLoai<LoaiLinhKien>[];
    const trung = mang.find((d) => d.sp.id === sanPham.id);
    if (trung) trung.soLuong += soLuong;
    else mang.push({ sp: sanPham as SanPhamLoai<LoaiLinhKien>, soLuong });
  }
  return bo;
}

/** Trả về món duy nhất của một loại, hoặc null nếu không có / có nhiều hơn một món. */
export function motMon<L extends LoaiLinhKien>(bo: BoLinhKien, loai: L): DongLoai<L> | null {
  const ds = bo[loai] as unknown as DongLoai<L>[];
  return ds.length === 1 ? ds[0] : null;
}

export function kq(
  mucDo: MucDo,
  ma: string,
  nhom: string,
  thongDiep: string,
  linhKienLienQuan: number[],
): KetQua {
  return { mucDo, ma, nhom, thongDiep, linhKienLienQuan };
}

export const CHIPSET_THEO_SOCKET: Record<Socket, string> = {
  AM4: "B550, A520, X570",
  AM5: "A620, B650, X670, B850",
  LGA1700: "H610, B760, Z790",
  LGA1851: "B860, Z890",
};

export const TEN_DOI: Record<string, string> = {
  zen3: "Ryzen 5000 (Zen 3)",
  zen4: "Ryzen 7000 (Zen 4)",
  zen5: "Ryzen 9000 (Zen 5)",
  "intel-12": "Intel thế hệ 12",
  "intel-13": "Intel thế hệ 13",
  "intel-14": "Intel thế hệ 14",
  "core-ultra-200": "Core Ultra 200S",
};
