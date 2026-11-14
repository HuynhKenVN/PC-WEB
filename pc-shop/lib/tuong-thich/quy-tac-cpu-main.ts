import { type BoLinhKien, CHIPSET_THEO_SOCKET, TEN_DOI, kq } from "./bo-linh-kien";
import type { KetQua } from "./types";

const NHOM = "CPU ↔ Mainboard";

/** Socket, chipset hỗ trợ đời CPU, BIOS, ép xung. So từng cặp CPU × main. */
export function quyTacCpuMain(bo: BoLinhKien): KetQua[] {
  const ra: KetQua[] = [];
  for (const { sp: cpu } of bo.cpu) {
    for (const { sp: main } of bo.mainboard) {
      const ids = [cpu.id, main.id];
      const c = cpu.specs;
      const m = main.specs;

      if (c.socket !== m.socket) {
        ra.push(
          kq(
            "loi",
            "socket-khac",
            NHOM,
            `${cpu.ten} dùng socket ${c.socket}, ${main.ten} dùng ${m.socket}. Đổi sang main socket ${c.socket} (chipset ${CHIPSET_THEO_SOCKET[c.socket]}) hoặc CPU socket ${m.socket}.`,
            ids,
          ),
        );
        continue; // khác socket thì các kiểm tra chipset không còn ý nghĩa
      }

      if (m.doiCanCapNhatBios.includes(c.doi)) {
        ra.push(
          kq(
            "canh-bao",
            "can-cap-nhat-bios",
            NHOM,
            `${main.ten} (${m.chipset}) chỉ nhận ${TEN_DOI[c.doi]} sau khi cập nhật BIOS. Cập nhật bằng tính năng BIOS Flashback hoặc nhờ cửa hàng nạp sẵn trước khi lắp.`,
            ids,
          ),
        );
      } else if (!m.doiHoTro.includes(c.doi)) {
        ra.push(
          kq(
            "loi",
            "chipset-khong-ho-tro",
            NHOM,
            `Chipset ${m.chipset} của ${main.ten} không hỗ trợ ${TEN_DOI[c.doi]}. Chọn main đời mới hơn cùng socket ${m.socket}.`,
            ids,
          ),
        );
        continue;
      } else {
        ra.push(
          kq("dat", "socket-khop", NHOM, `${cpu.ten} lắp vừa ${main.ten} (socket ${c.socket}, chipset ${m.chipset}).`, ids),
        );
      }

      if (c.epXung && !m.epXungCpu) {
        ra.push(
          kq(
            "canh-bao",
            "khong-ep-xung",
            NHOM,
            `${cpu.ten} là bản mở khóa ép xung nhưng chipset ${m.chipset} không cho ép xung CPU. Máy vẫn chạy bình thường; muốn ép xung thì đổi sang main ${c.socket === "AM5" ? "B650/X670" : c.socket === "LGA1851" ? "Z890" : "Z790"}.`,
            ids,
          ),
        );
      }
    }
  }
  return ra;
}
