import { type BoLinhKien, gomTheoLoai, kq, motMon } from "./bo-linh-kien";
import type { KetQua, LinhKienChon } from "./types";

const NHOM = "Nguồn";

/** Phần còn lại ngoài CPU và VGA: main, RAM, ổ, quạt, tản nước. */
const W_MAIN = 50;
const W_THANH_RAM = 5;
const W_O_CUNG = 7;
const W_QUAT = 15;
const W_BOM_AIO = 10;

/** Dự trữ tối thiểu nên có so với công suất ước tính. */
export const DU_TRU_TOI_THIEU = 0.3;

export interface UocTinhCongSuat {
  cpu: number;
  vga: number;
  conLai: number;
  tong: number;
  /** Công suất nguồn nên chọn (đã cộng dự trữ 30%), làm tròn lên 50 W. */
  nguonDeNghi: number;
}

function uocTinhTuBo(bo: BoLinhKien): UocTinhCongSuat {
  const cpu = Math.max(0, ...bo.cpu.map((d) => d.sp.specs.tdp));
  const vga = bo.vga.reduce((t, d) => t + d.sp.specs.tdp * d.soLuong, 0);
  let conLai = 0;
  if (bo.cpu.length || bo.mainboard.length) conLai += W_MAIN;
  conLai += bo.ram.reduce((t, d) => t + d.sp.specs.soThanh * d.soLuong * W_THANH_RAM, 0);
  conLai += bo["o-cung"].reduce((t, d) => t + d.soLuong * W_O_CUNG, 0);
  if (bo.cpu.length) conLai += W_QUAT;
  conLai += bo["tan-nhiet"].some((d) => d.sp.specs.kieu === "nuoc") ? W_BOM_AIO : 0;
  const tong = cpu + vga + conLai;
  return { cpu, vga, conLai, tong, nguonDeNghi: Math.ceil((tong * (1 + DU_TRU_TOI_THIEU)) / 50) * 50 };
}

/** Ước tính công suất của một danh sách linh kiện (dùng cho thanh tóm tắt). */
export function uocTinhCongSuat(ds: LinhKienChon[]): UocTinhCongSuat {
  return uocTinhTuBo(gomTheoLoai(ds));
}

export function quyTacNguon(bo: BoLinhKien): KetQua[] {
  const ra: KetQua[] = [];

  // Đầu cấp nguồn VGA: so từng cặp
  for (const { sp: psu } of bo.nguon) {
    for (const { sp: vga } of bo.vga) {
      const ids = [psu.id, vga.id];
      const p = psu.specs;
      const v = vga.specs;
      let thieu = false;
      if (v.dau8Pin > p.dau8Pin) {
        thieu = true;
        ra.push(
          kq(
            "loi",
            "thieu-dau-8pin",
            NHOM,
            `${vga.ten} cần ${v.dau8Pin} đầu 8-pin, ${psu.ten} chỉ có ${p.dau8Pin}. Chọn nguồn có từ ${v.dau8Pin} đầu 8-pin PCIe.`,
            ids,
          ),
        );
      }
      if (v.dau12VHPWR > p.dau12VHPWR) {
        thieu = true;
        if (p.dau8Pin >= v.capChuyen8Pin) {
          ra.push(
            kq(
              "canh-bao",
              "dung-cap-chuyen-12vhpwr",
              NHOM,
              `${psu.ten} không có đầu 12VHPWR cho ${vga.ten}. Dùng cáp chuyển ${v.capChuyen8Pin}×8-pin đi kèm card được, nhưng cáp cồng kềnh; nguồn chuẩn ATX 3.x sẽ gọn và an toàn hơn.`,
              ids,
            ),
          );
        } else {
          ra.push(
            kq(
              "loi",
              "thieu-dau-12vhpwr",
              NHOM,
              `${vga.ten} cần đầu 12VHPWR (hoặc ${v.capChuyen8Pin} đầu 8-pin qua cáp chuyển), ${psu.ten} không đủ. Chọn nguồn ATX 3.x có đầu 12V-2x6.`,
              ids,
            ),
          );
        }
      }
      if (!thieu) ra.push(kq("dat", "du-dau-vga", NHOM, `${psu.ten} đủ đầu cấp nguồn cho ${vga.ten}.`, ids));
    }
  }

  // Công suất: chỉ khi có đúng một nguồn và ít nhất CPU hoặc VGA
  const psu = motMon(bo, "nguon");
  if (psu && (bo.cpu.length || bo.vga.length)) {
    // Giỏ có nhiều CPU/VGA thì không rõ bộ nào đi với nhau
    if (bo.cheDo === "gio-hang" && (bo.cpu.length > 1 || bo.vga.length > 1)) return ra;
    const u = uocTinhTuBo(bo);
    const w = psu.sp.specs.congSuat;
    const ids = [psu.sp.id, ...bo.cpu.map((d) => d.sp.id), ...bo.vga.map((d) => d.sp.id)];
    if (u.tong > w) {
      ra.push(
        kq(
          "loi",
          "nguon-yeu",
          NHOM,
          `Ước tính cả máy dùng khoảng ${u.tong} W (CPU ${u.cpu} W + VGA ${u.vga} W + phần còn lại ${u.conLai} W), vượt ${w} W của ${psu.sp.ten}. Máy có thể sập nguồn khi chơi game. Nên dùng nguồn từ ${u.nguonDeNghi} W.`,
          ids,
        ),
      );
    } else if (w < u.tong * (1 + DU_TRU_TOI_THIEU)) {
      const du = Math.round(((w - u.tong) / u.tong) * 100);
      ra.push(
        kq(
          "canh-bao",
          "nguon-it-du",
          NHOM,
          `Ước tính ${u.tong} W, ${psu.sp.ten} ${w} W chỉ dư ${du}%. Chạy được nhưng nguồn sẽ ồn và nóng; nên dư từ 30% (khoảng ${u.nguonDeNghi} W).`,
          ids,
        ),
      );
    } else {
      ra.push(kq("dat", "nguon-du", NHOM, `Ước tính ${u.tong} W, ${psu.sp.ten} ${w} W còn dư ${Math.round(((w - u.tong) / u.tong) * 100)}%.`, ids));
    }
  }
  return ra;
}
