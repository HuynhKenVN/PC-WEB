import { type BoLinhKien, kq } from "./bo-linh-kien";
import type { DoPhanGiai, KetQua } from "./types";

/**
 * Ngưỡng lệch cho phép giữa điểm CPU và điểm VGA.
 * - cpuYeu: cảnh báo khi điểm CPU < điểm VGA × ngưỡng (độ phân giải thấp thì CPU gánh nhiều hơn).
 * - vgaYeu: cảnh báo khi điểm VGA < điểm CPU × ngưỡng (độ phân giải cao thì VGA gánh nhiều hơn).
 * Đây là ước lượng từ điểm tương đối trong dữ liệu mẫu, không phải số đo FPS thật.
 */
export const NGUONG_NGHEN: Record<DoPhanGiai, { cpuYeu: number; vgaYeu: number }> = {
  "1080p": { cpuYeu: 0.75, vgaYeu: 0.45 },
  "1440p": { cpuYeu: 0.6, vgaYeu: 0.55 },
  "4K": { cpuYeu: 0.45, vgaYeu: 0.7 },
};

export function quyTacNghenCoChai(bo: BoLinhKien, doPhanGiai: DoPhanGiai): KetQua[] {
  const ra: KetQua[] = [];
  const n = NGUONG_NGHEN[doPhanGiai];
  for (const { sp: cpu } of bo.cpu) {
    for (const { sp: vga } of bo.vga) {
      const c = cpu.specs.diemHieuNang;
      const v = vga.specs.diemHieuNang;
      const ids = [cpu.id, vga.id];
      if (c < v * n.cpuYeu) {
        const phanTram = Math.round((1 - c / v) * 100);
        ra.push(
          kq(
            "canh-bao",
            "cpu-nghen",
            "Nghẽn cổ chai",
            `Ở ${doPhanGiai}, ${cpu.ten} yếu hơn ${vga.ten} khoảng ${phanTram}% theo điểm ước lượng: card sẽ không chạy hết sức, FPS bị CPU giới hạn. Nâng CPU, hoặc chơi ở độ phân giải cao hơn.`,
            ids,
          ),
        );
      } else if (v < c * n.vgaYeu) {
        const phanTram = Math.round((1 - v / c) * 100);
        ra.push(
          kq(
            "canh-bao",
            "vga-nghen",
            "Nghẽn cổ chai",
            `Ở ${doPhanGiai}, ${vga.ten} yếu hơn ${cpu.ten} khoảng ${phanTram}% theo điểm ước lượng: CPU thừa sức, chơi game bị card giới hạn. Nâng VGA hoặc hạ CPU để tiết kiệm.`,
            ids,
          ),
        );
      } else {
        ra.push(kq("dat", "can-bang", "Nghẽn cổ chai", `${cpu.ten} và ${vga.ten} khá cân bằng ở ${doPhanGiai} (ước lượng).`, ids));
      }
    }
  }
  return ra;
}
