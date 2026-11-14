import { type BoLinhKien, gomTheoLoai, kq } from "./bo-linh-kien";
import { quyTacNguon } from "./cong-suat";
import { quyTacNghenCoChai } from "./nghen-co-chai";
import { quyTacCase } from "./quy-tac-case";
import { quyTacCpuMain } from "./quy-tac-cpu-main";
import { quyTacLuuTru, quyTacXuatHinh } from "./quy-tac-luu-tru";
import { quyTacRam } from "./quy-tac-ram";
import { quyTacTanNhiet } from "./quy-tac-tan-nhiet";
import type { KetQua, LinhKienChon, LoaiLinhKien, MucDo, SanPham, TuyChonKiemTra } from "./types";

export * from "./types";
export { uocTinhCongSuat, DU_TRU_TOI_THIEU } from "./cong-suat";
export { NGUONG_NGHEN } from "./nghen-co-chai";

export const TEN_LOAI: Record<LoaiLinhKien, string> = {
  cpu: "CPU",
  mainboard: "Mainboard",
  ram: "RAM",
  vga: "Card đồ họa",
  "o-cung": "Ổ cứng",
  nguon: "Nguồn",
  case: "Case",
  "tan-nhiet": "Tản nhiệt",
};

export const THU_TU_LOAI: LoaiLinhKien[] = ["cpu", "mainboard", "ram", "vga", "o-cung", "nguon", "case", "tan-nhiet"];

function quyTacThieu(bo: BoLinhKien): KetQua[] {
  if (bo.cheDo !== "cau-hinh") return [];
  const batBuoc: LoaiLinhKien[] = ["cpu", "mainboard", "ram", "o-cung", "nguon", "case"];
  const thieu = batBuoc.filter((l) => bo[l].length === 0);
  if (thieu.length === 0) return [];
  return [
    kq(
      "goi-y",
      "thieu-linh-kien",
      "Thiếu linh kiện",
      `Còn thiếu ${thieu.map((l) => TEN_LOAI[l]).join(", ")} để máy chạy được.`,
      [],
    ),
  ];
}

const THU_TU_MUC_DO: Record<MucDo, number> = { loi: 0, "canh-bao": 1, "goi-y": 2, dat: 3 };

/**
 * Kiểm tra tương thích một danh sách linh kiện.
 * Trả về kết quả đã sắp: lỗi → cảnh báo → gợi ý → đạt.
 */
export function kiemTra(ds: LinhKienChon[], tuyChon: TuyChonKiemTra = {}): KetQua[] {
  const bo = gomTheoLoai(ds, tuyChon);
  const ra = [
    ...quyTacCpuMain(bo),
    ...quyTacRam(bo),
    ...quyTacTanNhiet(bo),
    ...quyTacCase(bo),
    ...quyTacNguon(bo),
    ...quyTacLuuTru(bo),
    ...quyTacXuatHinh(bo),
    ...quyTacNghenCoChai(bo, tuyChon.doPhanGiai ?? "1080p"),
    ...quyTacThieu(bo),
  ];
  return ra.sort((a, b) => THU_TU_MUC_DO[a.mucDo] - THU_TU_MUC_DO[b.mucDo]);
}

export function demMucDo(ds: KetQua[]) {
  return {
    loi: ds.filter((k) => k.mucDo === "loi").length,
    canhBao: ds.filter((k) => k.mucDo === "canh-bao").length,
    dat: ds.filter((k) => k.mucDo === "dat").length,
  };
}

/** Các loại tham gia kiểm tra chéo; giỏ chỉ hiện bảng khi có ít nhất hai loại. */
export function soLoaiLienQuan(ds: LinhKienChon[]): number {
  return new Set(ds.map((d) => d.sanPham.loai)).size;
}

/**
 * Xét một ứng viên so với phần đã chọn (dùng cho ngăn chọn linh kiện ở Build PC):
 * ứng viên thay vào chỗ của loại đó, rồi lấy các lỗi/cảnh báo có dính tới ứng viên.
 */
export function xetUngVien(
  daChon: LinhKienChon[],
  ungVien: SanPham,
  tuyChon: TuyChonKiemTra = {},
  thayThe = true,
): { mucDo: "loi" | "canh-bao" | "dat"; lyDo: KetQua[] } {
  const conLai = thayThe ? daChon.filter((d) => d.sanPham.loai !== ungVien.loai) : daChon;
  const ketQua = kiemTra([...conLai, { sanPham: ungVien, soLuong: 1 }], { ...tuyChon, cheDo: "cau-hinh" }).filter(
    (k) =>
      k.linhKienLienQuan.includes(ungVien.id) &&
      (k.mucDo === "loi" || k.mucDo === "canh-bao") &&
      // Thiếu tản / thiếu card đồ họa là chuyện còn thiếu món, không phải món này lắp không được
      k.ma !== "chua-co-tan" &&
      k.ma !== "khong-co-xuat-hinh",
  );
  const mucDo = ketQua.some((k) => k.mucDo === "loi") ? "loi" : ketQua.length ? "canh-bao" : "dat";
  return { mucDo, lyDo: ketQua };
}
