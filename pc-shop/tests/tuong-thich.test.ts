import { describe, expect, it } from "vitest";
import { SAN_PHAM_MAU } from "../lib/du-lieu-mau";
import { kiemTra, uocTinhCongSuat, xetUngVien, type KetQua, type SanPham, type TuyChonKiemTra } from "../lib/tuong-thich";

// Dùng chính dữ liệu mẫu: đảm bảo mỗi quy tắc có ca đúng và ca sai minh họa được trên web.
const SP: Record<string, SanPham> = Object.fromEntries(
  SAN_PHAM_MAU.map((s, i) => [s.slug, { id: i + 1, slug: s.slug, ten: s.ten, hang: s.hang, gia: s.gia, loai: s.loai, specs: s.specs } as SanPham]),
);

function bo(...items: (string | [string, number])[]) {
  return items.map((it) => (Array.isArray(it) ? { sanPham: SP[it[0]], soLuong: it[1] } : { sanPham: SP[it], soLuong: 1 }));
}
function chay(items: (string | [string, number])[], tuyChon: TuyChonKiemTra = {}): KetQua[] {
  for (const it of items) {
    const slug = Array.isArray(it) ? it[0] : it;
    if (!SP[slug]) throw new Error("Không có slug " + slug);
  }
  return kiemTra(bo(...items), tuyChon);
}
const ma = (ds: KetQua[]) => ds.map((k) => k.ma);
const mucDoCua = (ds: KetQua[], m: string) => ds.find((k) => k.ma === m)?.mucDo;

describe("CPU ↔ Mainboard", () => {
  it("socket khác nhau là lỗi, thông điệp nêu cách sửa", () => {
    const r = chay(["amd-ryzen-5-7600", "msi-pro-b760m-a-wifi"]);
    expect(mucDoCua(r, "socket-khac")).toBe("loi");
    const tb = r.find((k) => k.ma === "socket-khac")!.thongDiep;
    expect(tb).toContain("AM5");
    expect(tb).toContain("LGA1700");
    expect(tb).toContain("B650");
  });
  it("cùng socket, chipset hỗ trợ là đạt", () => {
    const r = chay(["amd-ryzen-5-7600", "msi-pro-b650m-a-wifi"]);
    expect(ma(r)).toContain("socket-khop");
    expect(ma(r)).not.toContain("socket-khac");
  });
  it("Core Ultra không lắp main LGA1700", () => {
    expect(mucDoCua(chay(["intel-core-ultra-7-265k", "asus-rog-strix-z790-e-gaming-wifi-ii"]), "socket-khac")).toBe("loi");
  });
  it("CPU đời mới trên H610 cần cập nhật BIOS là cảnh báo", () => {
    expect(mucDoCua(chay(["intel-core-i5-13400f", "asus-prime-h610m-e-d4"]), "can-cap-nhat-bios")).toBe("canh-bao");
    expect(ma(chay(["intel-core-i3-12100f", "asus-prime-h610m-e-d4"]))).not.toContain("can-cap-nhat-bios");
  });
  it("chipset không hỗ trợ đời CPU là lỗi", () => {
    // Main giả định: cùng socket nhưng chỉ nhận Intel thế hệ 12
    const main = { ...SP["asus-prime-h610m-e-d4"], id: 999, specs: { ...SP["asus-prime-h610m-e-d4"].specs, doiCanCapNhatBios: [] } } as SanPham;
    const r = kiemTra([{ sanPham: SP["intel-core-i7-14700k"], soLuong: 1 }, { sanPham: main, soLuong: 1 }]);
    expect(mucDoCua(r, "chipset-khong-ho-tro")).toBe("loi");
  });
  it("CPU dòng K/X trên chipset không ép xung là cảnh báo", () => {
    expect(mucDoCua(chay(["amd-ryzen-7-7800x3d", "asrock-a620i-lightning-wifi"]), "khong-ep-xung")).toBe("canh-bao");
    expect(mucDoCua(chay(["intel-core-i7-14700k", "asus-prime-h610m-e-d4"]), "khong-ep-xung")).toBe("canh-bao");
    expect(ma(chay(["intel-core-i7-14700k", "asus-rog-strix-z790-e-gaming-wifi-ii"]))).not.toContain("khong-ep-xung");
  });
});

describe("RAM", () => {
  it("sai chuẩn DDR là lỗi", () => {
    expect(mucDoCua(chay(["kingston-fury-beast-16gb-ddr4-3200", "msi-pro-b760m-a-wifi"]), "sai-chuan-ram")).toBe("loi");
    expect(ma(chay(["kingston-fury-beast-16gb-ddr4-3200", "asus-prime-h610m-e-d4"]))).toContain("chuan-ram-khop");
  });
  it("CPU chỉ hỗ trợ DDR5 gặp RAM DDR4 là lỗi", () => {
    expect(mucDoCua(chay(["intel-core-ultra-7-265k", "kingston-fury-beast-16gb-ddr4-3200"]), "cpu-khong-ho-tro-ram")).toBe("loi");
  });
  it("nhiều thanh hơn số khe và vượt dung lượng tối đa là lỗi", () => {
    const r = chay(["asrock-a620i-lightning-wifi", "corsair-vengeance-128gb-ddr5-5600"]);
    expect(mucDoCua(r, "thua-thanh-ram")).toBe("loi");
    expect(mucDoCua(r, "vuot-dung-luong-ram")).toBe("loi");
    const ok = chay(["msi-pro-b650m-a-wifi", "corsair-vengeance-128gb-ddr5-5600"]);
    expect(ma(ok)).toContain("ram-vua-khe");
  });
  it("hai kit 2 thanh trên main 2 khe là lỗi (đếm theo số lượng)", () => {
    expect(mucDoCua(chay(["asrock-a620i-lightning-wifi", ["corsair-vengeance-32gb-ddr5-5600", 2]]), "thua-thanh-ram")).toBe("loi");
  });
  it("bus RAM cao hơn CPU/main hỗ trợ là cảnh báo", () => {
    const r = chay(["amd-ryzen-5-7600", "msi-pro-b650m-a-wifi", "gskill-trident-z5-rgb-32gb-ddr5-6400"]);
    expect(mucDoCua(r, "bus-ram-cao")).toBe("canh-bao");
    expect(r.find((k) => k.ma === "bus-ram-cao")!.thongDiep).toContain("5200");
    expect(ma(chay(["intel-core-ultra-7-265k", "asus-prime-z890-p-wifi", "gskill-trident-z5-rgb-32gb-ddr5-6400"]))).not.toContain("bus-ram-cao");
  });
});

describe("Tản nhiệt", () => {
  it("tản không có ngàm cho socket là lỗi", () => {
    expect(mucDoCua(chay(["intel-core-ultra-7-265k", "id-cooling-se-214-xt"]), "tan-sai-socket")).toBe("loi");
    expect(ma(chay(["intel-core-ultra-7-265k", "deepcool-ak400"]))).not.toContain("tan-sai-socket");
  });
  it("TDP tản thấp hơn CPU là cảnh báo", () => {
    expect(mucDoCua(chay(["intel-core-i7-14700k", "id-cooling-se-214-xt"]), "tan-yeu")).toBe("canh-bao");
    expect(ma(chay(["intel-core-i7-14700k", "nzxt-kraken-360"]))).toContain("tan-du-suc");
  });
  it("tản cao hơn khoảng hở case là lỗi", () => {
    expect(mucDoCua(chay(["noctua-nh-d15-g2", "nzxt-h5-flow"]), "tan-qua-cao")).toBe("loi");
    expect(ma(chay(["noctua-nh-d15-g2", "corsair-4000d-airflow"]))).toContain("tan-vua-case");
  });
  it("radiator AIO case không gắn được là lỗi", () => {
    expect(mucDoCua(chay(["nzxt-kraken-360", "cooler-master-nr200p"]), "radiator-khong-vua")).toBe("loi");
    expect(ma(chay(["nzxt-kraken-360", "nzxt-h5-flow"]))).toContain("radiator-vua");
  });
  it("CPU không kèm tản mà chưa chọn tản: cảnh báo trong cấu hình, im lặng trong giỏ", () => {
    expect(mucDoCua(chay(["amd-ryzen-7-7800x3d"]), "chua-co-tan")).toBe("canh-bao");
    expect(ma(chay(["amd-ryzen-5-7600"]))).not.toContain("chua-co-tan");
    expect(ma(chay(["amd-ryzen-7-7800x3d", "msi-pro-b650m-a-wifi"], { cheDo: "gio-hang" }))).not.toContain("chua-co-tan");
  });
});

describe("Case", () => {
  it("VGA dài hơn case là lỗi", () => {
    expect(mucDoCua(chay(["msi-rtx-4080-super-gaming-x-slim", "jonsbo-c6"]), "vga-qua-dai")).toBe("loi");
    expect(ma(chay(["msi-rtx-4060-ventus-2x-8g", "jonsbo-c6"]))).toContain("vga-vua-case");
  });
  it("main ATX trong case ITX là lỗi", () => {
    const r = chay(["asus-rog-strix-z790-e-gaming-wifi-ii", "cooler-master-nr200p"]);
    expect(mucDoCua(r, "main-khong-vua-case")).toBe("loi");
    expect(ma(chay(["asrock-a620i-lightning-wifi", "cooler-master-nr200p"]))).toContain("main-vua-case");
  });
});

describe("Nguồn", () => {
  it("ước tính công suất cộng CPU + VGA + phần còn lại", () => {
    const u = uocTinhCongSuat(bo("intel-core-i5-13400f", "msi-rtx-4060-ventus-2x-8g"));
    expect(u.cpu).toBe(148);
    expect(u.vga).toBe(115);
    expect(u.tong).toBe(148 + 115 + 50 + 15);
  });
  it("nguồn 450W với VGA cao cấp là lỗi", () => {
    const r = chay(["intel-core-i7-14700k", "msi-rtx-4080-super-gaming-x-slim", "xigmatek-x-power-iii-450"]);
    expect(mucDoCua(r, "nguon-yeu")).toBe("loi");
  });
  it("dư dưới 30% là cảnh báo, đủ dư là đạt", () => {
    const r = chay(["intel-core-i7-14700k", "msi-rtx-4080-super-gaming-x-slim", "msi-mag-a750gl-pcie5"]);
    expect(mucDoCua(r, "nguon-it-du")).toBe("canh-bao");
    expect(ma(chay(["intel-core-i5-13400f", "msi-rtx-4060-ventus-2x-8g", "corsair-cv650"]))).toContain("nguon-du");
  });
  it("thiếu đầu 8-pin là lỗi", () => {
    expect(mucDoCua(chay(["gigabyte-rx-7800-xt-gaming-oc-16g", "xigmatek-x-power-iii-450"]), "thieu-dau-8pin")).toBe("loi");
    expect(ma(chay(["gigabyte-rx-7800-xt-gaming-oc-16g", "corsair-cv650"]))).toContain("du-dau-vga");
  });
  it("thiếu 12VHPWR: đủ 8-pin cho cáp chuyển là cảnh báo, không đủ là lỗi", () => {
    expect(mucDoCua(chay(["asus-tuf-rtx-4070-super-12g", "corsair-cv650"]), "dung-cap-chuyen-12vhpwr")).toBe("canh-bao");
    expect(mucDoCua(chay(["msi-rtx-4080-super-gaming-x-slim", "corsair-cv650"]), "thieu-dau-12vhpwr")).toBe("loi");
    expect(ma(chay(["msi-rtx-4080-super-gaming-x-slim", "msi-mag-a750gl-pcie5"]))).toContain("du-dau-vga");
  });
});

describe("Lưu trữ", () => {
  it("nhiều SSD M.2 hơn khe M.2 là lỗi", () => {
    expect(mucDoCua(chay(["asus-prime-h610m-e-d4", "samsung-990-pro-1tb", "wd-blue-sn580-1tb"]), "thua-o-m2")).toBe("loi");
    expect(ma(chay(["msi-pro-b760m-a-wifi", "samsung-990-pro-1tb", "wd-blue-sn580-1tb"]))).toContain("o-cung-vua");
  });
  it("nhiều ổ SATA hơn cổng là lỗi", () => {
    expect(mucDoCua(chay(["asrock-a620i-lightning-wifi", ["samsung-870-evo-500gb", 3]]), "thua-o-sata")).toBe("loi");
    expect(ma(chay(["asrock-a620i-lightning-wifi", ["samsung-870-evo-500gb", 2]]))).not.toContain("thua-o-sata");
  });
});

describe("Xuất hình", () => {
  it("CPU dòng F không VGA là lỗi", () => {
    expect(mucDoCua(chay(["intel-core-i3-12100f", "asus-prime-h610m-e-d4"]), "khong-co-xuat-hinh")).toBe("loi");
    expect(ma(chay(["intel-core-i3-12100f", "asus-prime-h610m-e-d4", "msi-rtx-4060-ventus-2x-8g"]))).not.toContain("khong-co-xuat-hinh");
    expect(ma(chay(["amd-ryzen-5-7600", "msi-pro-b650m-a-wifi"]))).not.toContain("khong-co-xuat-hinh");
  });
});

describe("Nghẽn cổ chai", () => {
  it("i3-12100F + RTX 4080 Super: CPU nghẽn ở mọi độ phân giải", () => {
    for (const dpg of ["1080p", "1440p", "4K"] as const) {
      expect(mucDoCua(chay(["intel-core-i3-12100f", "msi-rtx-4080-super-gaming-x-slim"], { doPhanGiai: dpg }), "cpu-nghen")).toBe("canh-bao");
    }
  });
  it("CPU mạnh + VGA yếu: VGA nghẽn", () => {
    expect(mucDoCua(chay(["amd-ryzen-7-7800x3d", "asus-dual-rtx-3050-6gb"]), "vga-nghen")).toBe("canh-bao");
  });
  it("ngưỡng đổi theo độ phân giải", () => {
    // i5-13400F (50) + RX 7800 XT (68): nghẽn CPU ở 1080p, cân bằng ở 4K
    expect(ma(chay(["intel-core-i5-13400f", "gigabyte-rx-7800-xt-gaming-oc-16g"], { doPhanGiai: "1080p" }))).toContain("cpu-nghen");
    expect(ma(chay(["intel-core-i5-13400f", "gigabyte-rx-7800-xt-gaming-oc-16g"], { doPhanGiai: "4K" }))).toContain("can-bang");
  });
  it("cặp cân bằng là đạt", () => {
    expect(ma(chay(["intel-core-i5-13400f", "msi-rtx-4060-ventus-2x-8g"]))).toContain("can-bang");
  });
});

describe("Thiếu linh kiện và chế độ giỏ hàng", () => {
  it("cấu hình thiếu phần bắt buộc thì gợi ý", () => {
    const r = chay(["amd-ryzen-5-7600"]);
    expect(mucDoCua(r, "thieu-linh-kien")).toBe("goi-y");
    expect(r.find((k) => k.ma === "thieu-linh-kien")!.thongDiep).toContain("Mainboard");
  });
  it("cấu hình gợi ý 1440p đầy đủ không có lỗi", () => {
    const r = chay([
      "amd-ryzen-7-7800x3d", "msi-pro-b650m-a-wifi", "corsair-vengeance-32gb-ddr5-5600", "asus-tuf-rtx-4070-super-12g",
      "samsung-990-pro-1tb", "msi-mag-a750gl-pcie5", "corsair-4000d-airflow", "deepcool-ak400",
    ], { doPhanGiai: "1440p" });
    expect(r.filter((k) => k.mucDo === "loi")).toEqual([]);
    expect(ma(r)).not.toContain("thieu-linh-kien");
  });
  it("giỏ có hai CPU: so từng cặp với main, không gợi ý thiếu", () => {
    const r = chay(["amd-ryzen-5-7600", "intel-core-i5-13400f", "msi-pro-b650m-a-wifi"], { cheDo: "gio-hang" });
    expect(r.filter((k) => k.ma === "socket-khac")).toHaveLength(1); // chỉ i5 sai
    expect(ma(r)).toContain("socket-khop"); // 7600 đúng
    expect(ma(r)).not.toContain("thieu-linh-kien");
  });
  it("giỏ nhiều CPU thì không kết luận công suất", () => {
    const r = chay(["intel-core-i7-14700k", "amd-ryzen-7-7800x3d", "msi-rtx-4080-super-gaming-x-slim", "xigmatek-x-power-iii-450"], { cheDo: "gio-hang" });
    expect(ma(r)).not.toContain("nguon-yeu");
  });
  it("kết quả xếp lỗi trước cảnh báo trước đạt", () => {
    const r = chay(["amd-ryzen-7-7800x3d", "asrock-a620i-lightning-wifi", "msi-pro-b760m-a-wifi"]);
    const thuTu = r.map((k) => k.mucDo);
    expect(thuTu.indexOf("loi")).toBeLessThan(thuTu.indexOf("canh-bao"));
    expect(thuTu.lastIndexOf("canh-bao")).toBeLessThan(thuTu.indexOf("dat"));
  });
});

describe("xetUngVien (ngăn chọn linh kiện)", () => {
  it("đánh dấu main sai socket là lỗi, main đúng là đạt", () => {
    const daChon = bo("amd-ryzen-5-7600");
    expect(xetUngVien(daChon, SP["msi-pro-b760m-a-wifi"]).mucDo).toBe("loi");
    expect(xetUngVien(daChon, SP["msi-pro-b650m-a-wifi"]).mucDo).toBe("dat");
  });
  it("thay thế món cùng loại thay vì cộng thêm", () => {
    const daChon = bo("amd-ryzen-5-7600", "msi-pro-b760m-a-wifi");
    expect(xetUngVien(daChon, SP["msi-pro-b650m-a-wifi"]).mucDo).toBe("dat");
  });
  it("không coi thiếu tản là lỗi của CPU", () => {
    expect(xetUngVien([], SP["amd-ryzen-7-7800x3d"]).mucDo).toBe("dat");
  });
  it("không coi chưa có VGA là lỗi của CPU dòng F", () => {
    expect(xetUngVien(bo("msi-pro-b760m-a-wifi"), SP["intel-core-i3-12100f"]).mucDo).toBe("dat");
  });
});
