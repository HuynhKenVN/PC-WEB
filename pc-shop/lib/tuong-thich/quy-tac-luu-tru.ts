import { type BoLinhKien, kq, motMon } from "./bo-linh-kien";
import type { KetQua } from "./types";

export function quyTacLuuTru(bo: BoLinhKien): KetQua[] {
  const ra: KetQua[] = [];
  const main = motMon(bo, "mainboard");
  if (!main || bo["o-cung"].length === 0) return ra;

  const m2 = bo["o-cung"].filter((d) => d.sp.specs.giaoTiep === "M.2");
  const sata = bo["o-cung"].filter((d) => d.sp.specs.giaoTiep === "SATA");
  const soM2 = m2.reduce((t, d) => t + d.soLuong, 0);
  const soSata = sata.reduce((t, d) => t + d.soLuong, 0);
  const m = main.sp.specs;

  if (soM2 > m.soKheM2) {
    ra.push(
      kq(
        "loi",
        "thua-o-m2",
        "Lưu trữ",
        `${soM2} ổ SSD M.2 nhưng ${main.sp.ten} chỉ có ${m.soKheM2} khe M.2. Bớt ổ M.2, đổi một ổ sang SSD SATA, hoặc chọn main nhiều khe M.2 hơn.`,
        [main.sp.id, ...m2.map((d) => d.sp.id)],
      ),
    );
  }
  if (soSata > m.soCongSata) {
    ra.push(
      kq(
        "loi",
        "thua-o-sata",
        "Lưu trữ",
        `${soSata} ổ SATA nhưng ${main.sp.ten} chỉ có ${m.soCongSata} cổng SATA. Bớt ổ SATA hoặc chọn main nhiều cổng hơn.`,
        [main.sp.id, ...sata.map((d) => d.sp.id)],
      ),
    );
  }
  if (soM2 <= m.soKheM2 && soSata <= m.soCongSata) {
    ra.push(
      kq(
        "dat",
        "o-cung-vua",
        "Lưu trữ",
        `Dùng ${soM2}/${m.soKheM2} khe M.2 và ${soSata}/${m.soCongSata} cổng SATA.`,
        [main.sp.id, ...bo["o-cung"].map((d) => d.sp.id)],
      ),
    );
  }
  return ra;
}

export function quyTacXuatHinh(bo: BoLinhKien): KetQua[] {
  if (bo.vga.length > 0) return [];
  // Trong giỏ chỉ cảnh báo khi giỏ đã có những phần khác của một bộ máy
  if (bo.cheDo === "gio-hang" && bo.mainboard.length === 0) return [];
  return bo.cpu
    .filter((d) => !d.sp.specs.doHoaTichHop)
    .map((d) =>
      kq(
        "loi",
        "khong-co-xuat-hinh",
        "Xuất hình",
        `${d.sp.ten} không có đồ họa tích hợp (dòng F/KF) và cấu hình chưa có card đồ họa, màn hình sẽ không lên hình. Thêm một VGA hoặc đổi sang CPU có đồ họa tích hợp.`,
        [d.sp.id],
      ),
    );
}
