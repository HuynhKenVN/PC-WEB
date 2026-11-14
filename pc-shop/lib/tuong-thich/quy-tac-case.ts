import { type BoLinhKien, kq } from "./bo-linh-kien";
import type { KetQua } from "./types";

const NHOM = "Case";

export function quyTacCase(bo: BoLinhKien): KetQua[] {
  const ra: KetQua[] = [];
  for (const { sp: vo } of bo.case) {
    for (const { sp: vga } of bo.vga) {
      const ids = [vga.id, vo.id];
      if (vga.specs.dai > vo.specs.vgaDaiToiDa) {
        ra.push(
          kq(
            "loi",
            "vga-qua-dai",
            NHOM,
            `${vga.ten} dài ${vga.specs.dai} mm, ${vo.ten} chỉ chứa card dài tối đa ${vo.specs.vgaDaiToiDa} mm. Chọn card ngắn hơn hoặc case lớn hơn.`,
            ids,
          ),
        );
      } else {
        ra.push(kq("dat", "vga-vua-case", NHOM, `${vga.ten} (${vga.specs.dai} mm) vừa ${vo.ten} (tối đa ${vo.specs.vgaDaiToiDa} mm).`, ids));
      }
    }
    for (const { sp: main } of bo.mainboard) {
      const ids = [main.id, vo.id];
      if (!vo.specs.kichThuocMain.includes(main.specs.kichThuoc)) {
        ra.push(
          kq(
            "loi",
            "main-khong-vua-case",
            NHOM,
            `${main.ten} là main ${main.specs.kichThuoc}, ${vo.ten} chỉ nhận ${vo.specs.kichThuocMain.join("/")}. Đổi sang main ${vo.specs.kichThuocMain.join(" hoặc ")} hoặc case hỗ trợ ${main.specs.kichThuoc}.`,
            ids,
          ),
        );
      } else {
        ra.push(kq("dat", "main-vua-case", NHOM, `Main ${main.specs.kichThuoc} lắp vừa ${vo.ten}.`, ids));
      }
    }
  }
  return ra;
}
