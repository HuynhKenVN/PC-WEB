import type { SanPham } from "./tuong-thich/types";

export const dinhDangTien = (n: number) => n.toLocaleString("vi-VN") + "₫";

export interface DongThongSo {
  khoa: string;
  nhan: string;
  giaTri: string;
  /** Giá trị số để so sánh (trang So sánh tô món tốt hơn); hướng: cao hơn tốt hơn = 1, thấp hơn tốt hơn = -1. */
  so?: number;
  huong?: 1 | -1;
}

const coKhong = (b: boolean) => (b ? "Có" : "Không");

/** Bảng thông số hiển thị cho từng loại linh kiện. `noiBat` = vài dòng chính cho thẻ sản phẩm. */
export function thongSo(sp: SanPham): DongThongSo[] {
  switch (sp.loai) {
    case "cpu": {
      const s = sp.specs;
      return [
        { khoa: "socket", nhan: "Socket", giaTri: s.socket },
        { khoa: "nhan", nhan: "Nhân / luồng", giaTri: `${s.nhan} / ${s.luong}`, so: s.luong, huong: 1 },
        { khoa: "xung", nhan: "Xung cơ bản / tối đa", giaTri: `${s.xungCoBan} / ${s.xungToiDa} GHz`, so: s.xungToiDa, huong: 1 },
        { khoa: "tdp", nhan: "Công suất khi tải nặng", giaTri: `${s.tdp} W`, so: s.tdp, huong: -1 },
        { khoa: "ram", nhan: "RAM hỗ trợ", giaTri: `${s.chuanRam.join(", ")} · tới ${s.busRamToiDa} MT/s` },
        { khoa: "igpu", nhan: "Đồ họa tích hợp", giaTri: coKhong(s.doHoaTichHop) },
        { khoa: "tan", nhan: "Kèm tản nhiệt", giaTri: coKhong(s.kemTan) },
        { khoa: "oc", nhan: "Mở khóa ép xung", giaTri: coKhong(s.epXung) },
        { khoa: "diem", nhan: "Điểm hiệu năng (ước lượng)", giaTri: `${s.diemHieuNang}/100`, so: s.diemHieuNang, huong: 1 },
      ];
    }
    case "mainboard": {
      const s = sp.specs;
      return [
        { khoa: "socket", nhan: "Socket", giaTri: s.socket },
        { khoa: "chipset", nhan: "Chipset", giaTri: s.chipset },
        { khoa: "kichThuoc", nhan: "Kích thước", giaTri: s.kichThuoc },
        { khoa: "ram", nhan: "RAM", giaTri: `${s.chuanRam} · ${s.soKheRam} khe · tối đa ${s.ramToiDa} GB`, so: s.ramToiDa, huong: 1 },
        { khoa: "bus", nhan: "Bus RAM tối đa", giaTri: `${s.busRamToiDa} MT/s`, so: s.busRamToiDa, huong: 1 },
        { khoa: "m2", nhan: "Khe M.2", giaTri: String(s.soKheM2), so: s.soKheM2, huong: 1 },
        { khoa: "sata", nhan: "Cổng SATA", giaTri: String(s.soCongSata), so: s.soCongSata, huong: 1 },
        { khoa: "oc", nhan: "Ép xung CPU", giaTri: coKhong(s.epXungCpu) },
      ];
    }
    case "ram": {
      const s = sp.specs;
      return [
        { khoa: "chuan", nhan: "Chuẩn", giaTri: s.chuan },
        { khoa: "dungLuong", nhan: "Dung lượng", giaTri: `${s.soThanh * s.dungLuongMoiThanh} GB (${s.soThanh}×${s.dungLuongMoiThanh} GB)`, so: s.soThanh * s.dungLuongMoiThanh, huong: 1 },
        { khoa: "bus", nhan: "Bus", giaTri: `${s.bus} MT/s`, so: s.bus, huong: 1 },
        { khoa: "cl", nhan: "Độ trễ CAS", giaTri: `CL${s.cl}`, so: s.cl, huong: -1 },
      ];
    }
    case "vga": {
      const s = sp.specs;
      const dau = [s.dau8Pin ? `${s.dau8Pin}× 8-pin` : "", s.dau12VHPWR ? `${s.dau12VHPWR}× 12VHPWR` : ""].filter(Boolean).join(" + ") || "Không cần";
      return [
        { khoa: "chip", nhan: "GPU", giaTri: s.chip },
        { khoa: "vram", nhan: "VRAM", giaTri: `${s.vram} GB`, so: s.vram, huong: 1 },
        { khoa: "dai", nhan: "Chiều dài", giaTri: `${s.dai} mm`, so: s.dai, huong: -1 },
        { khoa: "tdp", nhan: "Công suất", giaTri: `${s.tdp} W`, so: s.tdp, huong: -1 },
        { khoa: "dau", nhan: "Nguồn phụ", giaTri: dau },
        { khoa: "diem", nhan: "Điểm hiệu năng (ước lượng)", giaTri: `${s.diemHieuNang}/100`, so: s.diemHieuNang, huong: 1 },
      ];
    }
    case "o-cung": {
      const s = sp.specs;
      return [
        { khoa: "giaoTiep", nhan: "Giao tiếp", giaTri: s.giaoTiep === "M.2" ? "M.2 NVMe" : "SATA 2.5\"" },
        { khoa: "dungLuong", nhan: "Dung lượng", giaTri: s.dungLuong >= 1000 ? `${s.dungLuong / 1000} TB` : `${s.dungLuong} GB`, so: s.dungLuong, huong: 1 },
        { khoa: "doc", nhan: "Đọc tuần tự", giaTri: `${s.docTuanTu.toLocaleString("vi-VN")} MB/s`, so: s.docTuanTu, huong: 1 },
      ];
    }
    case "nguon": {
      const s = sp.specs;
      return [
        { khoa: "congSuat", nhan: "Công suất", giaTri: `${s.congSuat} W`, so: s.congSuat, huong: 1 },
        { khoa: "80plus", nhan: "Chứng nhận 80 Plus", giaTri: s.chuan80Plus },
        { khoa: "8pin", nhan: "Đầu 8-pin PCIe", giaTri: String(s.dau8Pin), so: s.dau8Pin, huong: 1 },
        { khoa: "12v", nhan: "Đầu 12VHPWR", giaTri: String(s.dau12VHPWR), so: s.dau12VHPWR, huong: 1 },
      ];
    }
    case "case": {
      const s = sp.specs;
      return [
        { khoa: "main", nhan: "Mainboard hỗ trợ", giaTri: s.kichThuocMain.join(", ") },
        { khoa: "vga", nhan: "VGA dài tối đa", giaTri: `${s.vgaDaiToiDa} mm`, so: s.vgaDaiToiDa, huong: 1 },
        { khoa: "tan", nhan: "Tản khí cao tối đa", giaTri: `${s.tanCaoToiDa} mm`, so: s.tanCaoToiDa, huong: 1 },
        { khoa: "rad", nhan: "Radiator", giaTri: s.radiatorHoTro.map((r) => `${r}`).join(", ") + " mm" },
      ];
    }
    case "tan-nhiet": {
      const s = sp.specs;
      return [
        { khoa: "kieu", nhan: "Kiểu", giaTri: s.kieu === "khi" ? "Tản khí" : "Tản nước AIO" },
        { khoa: "socket", nhan: "Socket", giaTri: s.socket.join(", ") },
        { khoa: "tdp", nhan: "Giải nhiệt tối đa", giaTri: `${s.tdpToiDa} W`, so: s.tdpToiDa, huong: 1 },
        s.kieu === "khi"
          ? { khoa: "cao", nhan: "Chiều cao", giaTri: `${s.cao} mm`, so: s.cao, huong: -1 }
          : { khoa: "rad", nhan: "Radiator", giaTri: `${s.radiator} mm` },
      ];
    }
  }
}

/** Ba thông số chính in trên thẻ sản phẩm. */
export function thongSoNoiBat(sp: SanPham): string[] {
  switch (sp.loai) {
    case "cpu":
      return [sp.specs.socket, `${sp.specs.nhan}C/${sp.specs.luong}T`, `${sp.specs.xungToiDa} GHz`];
    case "mainboard":
      return [sp.specs.socket, sp.specs.chipset, sp.specs.kichThuoc, sp.specs.chuanRam];
    case "ram":
      return [sp.specs.chuan, `${sp.specs.soThanh * sp.specs.dungLuongMoiThanh} GB`, `${sp.specs.bus}`];
    case "vga":
      return [`${sp.specs.vram} GB`, `${sp.specs.dai} mm`, `${sp.specs.tdp} W`];
    case "o-cung":
      return [sp.specs.giaoTiep, sp.specs.dungLuong >= 1000 ? `${sp.specs.dungLuong / 1000} TB` : `${sp.specs.dungLuong} GB`];
    case "nguon":
      return [`${sp.specs.congSuat} W`, sp.specs.chuan80Plus === "Không" ? "Không 80+" : `80+ ${sp.specs.chuan80Plus}`];
    case "case":
      return [sp.specs.kichThuocMain[0], `VGA ≤ ${sp.specs.vgaDaiToiDa}`];
    case "tan-nhiet":
      return [sp.specs.kieu === "khi" ? `Khí ${sp.specs.cao} mm` : `AIO ${sp.specs.radiator}`, `${sp.specs.tdpToiDa} W`];
  }
}
