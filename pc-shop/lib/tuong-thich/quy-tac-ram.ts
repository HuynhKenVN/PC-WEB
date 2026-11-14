import { type BoLinhKien, kq, motMon } from "./bo-linh-kien";
import type { KetQua } from "./types";

const NHOM = "RAM";

export function quyTacRam(bo: BoLinhKien): KetQua[] {
  const ra: KetQua[] = [];

  // Chuẩn DDR: so từng cặp RAM × main
  for (const { sp: ram } of bo.ram) {
    for (const { sp: main } of bo.mainboard) {
      if (ram.specs.chuan !== main.specs.chuanRam) {
        ra.push(
          kq(
            "loi",
            "sai-chuan-ram",
            NHOM,
            `${ram.ten} là ${ram.specs.chuan}, ${main.ten} chỉ nhận ${main.specs.chuanRam}. Hai chuẩn khác khấc, không cắm được. Đổi sang RAM ${main.specs.chuanRam}.`,
            [ram.id, main.id],
          ),
        );
      } else {
        ra.push(kq("dat", "chuan-ram-khop", NHOM, `${ram.ten} đúng chuẩn ${ram.specs.chuan} của ${main.ten}.`, [ram.id, main.id]));
      }
    }
    // CPU cũng phải hỗ trợ chuẩn RAM (Core Ultra 200S chỉ DDR5)
    for (const { sp: cpu } of bo.cpu) {
      if (!cpu.specs.chuanRam.includes(ram.specs.chuan)) {
        ra.push(
          kq(
            "loi",
            "cpu-khong-ho-tro-ram",
            NHOM,
            `${cpu.ten} chỉ hỗ trợ ${cpu.specs.chuanRam.join("/")}, không dùng được ${ram.specs.chuan}.`,
            [ram.id, cpu.id],
          ),
        );
      }
    }
  }

  // Các quy tắc tổng: cần đúng một main
  const main = motMon(bo, "mainboard");
  const ramHopChuan = main ? bo.ram.filter((r) => r.sp.specs.chuan === main.sp.specs.chuanRam) : [];
  if (main && ramHopChuan.length > 0) {
    const m = main.sp.specs;
    const ids = [main.sp.id, ...ramHopChuan.map((r) => r.sp.id)];
    const tongThanh = ramHopChuan.reduce((t, r) => t + r.sp.specs.soThanh * r.soLuong, 0);
    const tongGb = ramHopChuan.reduce((t, r) => t + r.sp.specs.soThanh * r.sp.specs.dungLuongMoiThanh * r.soLuong, 0);

    if (tongThanh > m.soKheRam) {
      ra.push(
        kq(
          "loi",
          "thua-thanh-ram",
          NHOM,
          `Tổng cộng ${tongThanh} thanh RAM nhưng ${main.sp.ten} chỉ có ${m.soKheRam} khe. Bớt kit RAM hoặc chọn kit ${m.soKheRam} thanh dung lượng lớn hơn.`,
          ids,
        ),
      );
    }
    if (tongGb > m.ramToiDa) {
      ra.push(
        kq(
          "loi",
          "vuot-dung-luong-ram",
          NHOM,
          `Tổng ${tongGb} GB RAM vượt mức tối đa ${m.ramToiDa} GB của ${main.sp.ten}. Giảm dung lượng xuống ${m.ramToiDa} GB trở xuống.`,
          ids,
        ),
      );
    }
    if (tongThanh <= m.soKheRam && tongGb <= m.ramToiDa) {
      ra.push(kq("dat", "ram-vua-khe", NHOM, `${tongThanh}/${m.soKheRam} khe RAM, ${tongGb} GB (tối đa ${m.ramToiDa} GB).`, ids));
    }

    // Bus: chạy theo mức thấp nhất giữa RAM, main và CPU
    const cpu = motMon(bo, "cpu");
    for (const { sp: ram } of ramHopChuan) {
      const gioiHan = Math.min(m.busRamToiDa, cpu ? cpu.sp.specs.busRamToiDa : Infinity);
      if (ram.specs.bus > gioiHan) {
        const thuPham = cpu && cpu.sp.specs.busRamToiDa < m.busRamToiDa ? cpu.sp.ten : main.sp.ten;
        ra.push(
          kq(
            "canh-bao",
            "bus-ram-cao",
            NHOM,
            `${ram.ten} bus ${ram.specs.bus} MT/s nhưng ${thuPham} chỉ chạy chính thức tới ${gioiHan} MT/s. RAM vẫn chạy, ở bus ${gioiHan}; bật XMP/EXPO có thể lên cao hơn nhưng không đảm bảo. Có thể chọn kit rẻ hơn ở bus ${gioiHan}.`,
            [ram.id, cpu && cpu.sp.specs.busRamToiDa < m.busRamToiDa ? cpu.sp.id : main.sp.id],
          ),
        );
      }
    }
  }
  return ra;
}
