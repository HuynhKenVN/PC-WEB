// Kiểu dữ liệu dùng chung cho sản phẩm và bộ kiểm tra tương thích.
// Mọi hàm trong lib/tuong-thich/ là hàm thuần: chạy được ở trình duyệt lẫn máy chủ.

export type LoaiLinhKien =
  | "cpu"
  | "mainboard"
  | "ram"
  | "vga"
  | "o-cung"
  | "nguon"
  | "case"
  | "tan-nhiet";

export type Socket = "AM4" | "AM5" | "LGA1700" | "LGA1851";
export type ChuanRam = "DDR4" | "DDR5";
export type KichThuocMain = "ATX" | "mATX" | "ITX";
export type DoPhanGiai = "1080p" | "1440p" | "4K";

/** Đời CPU, dùng để so với danh sách chipset hỗ trợ. */
export type DoiCpu =
  | "zen3"
  | "zen4"
  | "zen5"
  | "intel-12"
  | "intel-13"
  | "intel-14"
  | "core-ultra-200";

export interface SpecsCpu {
  socket: Socket;
  doi: DoiCpu;
  nhan: number;
  luong: number;
  xungCoBan: number; // GHz
  xungToiDa: number; // GHz
  /** Dòng K (Intel) / X (AMD): mở khóa ép xung. */
  epXung: boolean;
  /** Công suất khi chạy nặng (W), dùng cho tản nhiệt và ước tính nguồn. */
  tdp: number;
  doHoaTichHop: boolean;
  kemTan: boolean;
  chuanRam: ChuanRam[];
  busRamToiDa: number; // MT/s
  /** Điểm hiệu năng tương đối (0–100) để ước lượng nghẽn cổ chai. */
  diemHieuNang: number;
}

export interface SpecsMainboard {
  socket: Socket;
  chipset: string;
  kichThuoc: KichThuocMain;
  chuanRam: ChuanRam;
  soKheRam: number;
  ramToiDa: number; // GB
  busRamToiDa: number;
  soKheM2: number;
  soCongSata: number;
  /** Chipset cho phép ép xung CPU. */
  epXungCpu: boolean;
  doiHoTro: DoiCpu[];
  /** Đời CPU lắp được nhưng phải cập nhật BIOS trước. */
  doiCanCapNhatBios: DoiCpu[];
}

export interface SpecsRam {
  chuan: ChuanRam;
  soThanh: number;
  dungLuongMoiThanh: number; // GB
  bus: number;
  cl: number;
}

export interface SpecsVga {
  chip: string;
  vram: number; // GB
  dai: number; // mm
  tdp: number;
  /** Số đầu 8-pin PCIe card cần. */
  dau8Pin: number;
  /** Số đầu 12VHPWR / 12V-2x6 card cần. */
  dau12VHPWR: number;
  /** Cáp chuyển đi kèm card: cần bao nhiêu đầu 8-pin từ nguồn để thay một đầu 12VHPWR. */
  capChuyen8Pin: number;
  diemHieuNang: number;
}

export interface SpecsOCung {
  giaoTiep: "M.2" | "SATA";
  dungLuong: number; // GB
  docTuanTu: number; // MB/s
}

export interface SpecsNguon {
  congSuat: number;
  chuan80Plus: string;
  dau8Pin: number;
  dau12VHPWR: number;
}

export interface SpecsCase {
  kichThuocMain: KichThuocMain[];
  vgaDaiToiDa: number; // mm
  tanCaoToiDa: number; // mm
  radiatorHoTro: number[]; // mm: 120, 240, 280, 360
}

export interface SpecsTanNhiet {
  kieu: "khi" | "nuoc";
  socket: Socket[];
  tdpToiDa: number;
  cao?: number; // mm, chỉ với tản khí
  radiator?: number; // mm, chỉ với tản nước AIO
}

export interface SpecsTheoLoai {
  cpu: SpecsCpu;
  mainboard: SpecsMainboard;
  ram: SpecsRam;
  vga: SpecsVga;
  "o-cung": SpecsOCung;
  nguon: SpecsNguon;
  case: SpecsCase;
  "tan-nhiet": SpecsTanNhiet;
}

export interface SanPhamCoBan {
  id: number;
  slug: string;
  ten: string;
  hang: string;
  gia: number;
}

export type SanPham = {
  [L in LoaiLinhKien]: SanPhamCoBan & { loai: L; specs: SpecsTheoLoai[L] };
}[LoaiLinhKien];

export type SanPhamLoai<L extends LoaiLinhKien> = Extract<SanPham, { loai: L }>;

/** Một dòng trong giỏ hoặc cấu hình. */
export interface LinhKienChon {
  sanPham: SanPham;
  soLuong: number;
}

export type MucDo = "loi" | "canh-bao" | "dat" | "goi-y";

export interface KetQua {
  mucDo: MucDo;
  /** Mã ổn định, ví dụ "socket-khac" — dùng cho test và khử trùng lặp. */
  ma: string;
  nhom: string;
  thongDiep: string;
  linhKienLienQuan: number[];
}

export interface TuyChonKiemTra {
  doPhanGiai?: DoPhanGiai;
  /**
   * "cau-hinh": một bộ máy hoàn chỉnh (mỗi loại một món, trừ RAM/ổ cứng) — có gợi ý thiếu linh kiện.
   * "gio-hang": giỏ có thể chứa nhiều CPU/main — chỉ so theo cặp, quy tắc tổng chỉ chạy khi rõ ràng.
   */
  cheDo?: "cau-hinh" | "gio-hang";
}
