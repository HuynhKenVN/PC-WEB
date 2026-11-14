import { type BoLinhKien, kq } from "./bo-linh-kien";
import type { KetQua } from "./types";

const NHOM = "Tản nhiệt";

export function quyTacTanNhiet(bo: BoLinhKien): KetQua[] {
  const ra: KetQua[] = [];

  for (const { sp: tan } of bo["tan-nhiet"]) {
    const t = tan.specs;

    for (const { sp: cpu } of bo.cpu) {
      const ids = [tan.id, cpu.id];
      if (!t.socket.includes(cpu.specs.socket)) {
        ra.push(
          kq(
            "loi",
            "tan-sai-socket",
            NHOM,
            `${tan.ten} không có ngàm cho socket ${cpu.specs.socket} của ${cpu.ten} (hỗ trợ: ${t.socket.join(", ")}). Chọn tản có ngàm ${cpu.specs.socket}.`,
            ids,
          ),
        );
        continue;
      }
      if (t.tdpToiDa < cpu.specs.tdp) {
        ra.push(
          kq(
            "canh-bao",
            "tan-yeu",
            NHOM,
            `${tan.ten} giải được khoảng ${t.tdpToiDa} W, ${cpu.ten} tỏa tới ${cpu.specs.tdp} W khi chạy nặng. CPU sẽ nóng và tự hạ xung. Nên chọn tản từ ${cpu.specs.tdp} W trở lên.`,
            ids,
          ),
        );
      } else {
        ra.push(kq("dat", "tan-du-suc", NHOM, `${tan.ten} đủ sức cho ${cpu.ten} (${t.tdpToiDa} W ≥ ${cpu.specs.tdp} W).`, ids));
      }
    }

    for (const { sp: vo } of bo.case) {
      const ids = [tan.id, vo.id];
      if (t.kieu === "khi" && t.cao) {
        if (t.cao > vo.specs.tanCaoToiDa) {
          ra.push(
            kq(
              "loi",
              "tan-qua-cao",
              NHOM,
              `${tan.ten} cao ${t.cao} mm, ${vo.ten} chỉ chứa tản cao tối đa ${vo.specs.tanCaoToiDa} mm. Nắp hông sẽ không đóng được. Chọn tản thấp hơn hoặc case rộng hơn.`,
              ids,
            ),
          );
        } else {
          ra.push(kq("dat", "tan-vua-case", NHOM, `${tan.ten} (${t.cao} mm) vừa ${vo.ten} (tối đa ${vo.specs.tanCaoToiDa} mm).`, ids));
        }
      }
      if (t.kieu === "nuoc" && t.radiator) {
        if (!vo.specs.radiatorHoTro.includes(t.radiator)) {
          const hoTro = vo.specs.radiatorHoTro.length ? vo.specs.radiatorHoTro.join(", ") + " mm" : "không có vị trí radiator lớn";
          ra.push(
            kq(
              "loi",
              "radiator-khong-vua",
              NHOM,
              `Radiator ${t.radiator} mm của ${tan.ten} không gắn được vào ${vo.ten} (hỗ trợ: ${hoTro}). Chọn AIO cỡ nhỏ hơn hoặc case lớn hơn.`,
              ids,
            ),
          );
        } else {
          ra.push(kq("dat", "radiator-vua", NHOM, `Radiator ${t.radiator} mm gắn được vào ${vo.ten}.`, ids));
        }
      }
    }
  }

  // CPU không kèm tản mà chưa chọn tản — chỉ có ý nghĩa với một bộ máy
  if (bo.cheDo === "cau-hinh" && bo["tan-nhiet"].length === 0) {
    for (const { sp: cpu } of bo.cpu) {
      if (!cpu.specs.kemTan) {
        ra.push(
          kq(
            "canh-bao",
            "chua-co-tan",
            NHOM,
            `${cpu.ten} bán không kèm tản nhiệt. Thêm một tản chịu được từ ${cpu.specs.tdp} W, nếu không máy sẽ tắt vì quá nhiệt.`,
            [cpu.id],
          ),
        );
      }
    }
  }
  return ra;
}
