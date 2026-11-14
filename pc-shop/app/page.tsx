import Link from "next/link";
import { ArrowRight, ChevronRight, GitCompareArrows, ShieldCheck } from "lucide-react";
import { layTatCaSanPham } from "@/lib/db";
import { CAU_HINH_GOI_Y } from "@/lib/du-lieu-mau";
import { demMucDo, kiemTra, THU_TU_LOAI, TEN_LOAI, uocTinhCongSuat } from "@/lib/tuong-thich";
import { dinhDangTien } from "@/lib/thong-so";
import { HinhLinhKien } from "@/components/hinh-linh-kien";
import { TheSanPham } from "@/components/the-san-pham";
import { Dau, KhungTrang, lopNut } from "@/components/ui";

export default function TrangChu() {
  const tatCa = layTatCaSanPham();
  const theoSlug = new Map(tatCa.map((s) => [s.slug, s]));

  const goiY = CAU_HINH_GOI_Y.map((g, i) => {
    const items = g.slugs.map((s) => theoSlug.get(s)).filter((s) => !!s).map((s) => ({ sanPham: s!, soLuong: 1 }));
    const doPhanGiai = i === 0 ? "1080p" : "1440p";
    const dem = demMucDo(kiemTra(items, { doPhanGiai }));
    return { ...g, i, items, doPhanGiai, dem, cs: uocTinhCongSuat(items), tong: items.reduce((t, x) => t + x.sanPham.gia, 0) };
  });
  const chinh = goiY[1];

  // Ví dụ từ bộ kiểm tra: một cặp sai thật trong dữ liệu
  const viDu = ["amd-ryzen-5-7600", "msi-pro-b760m-a-wifi"].map((s) => theoSlug.get(s)).filter((s) => !!s);
  const loiViDu = viDu.length === 2 ? kiemTra(viDu.map((s) => ({ sanPham: s!, soLuong: 1 }))).find((k) => k.mucDo === "loi") : undefined;

  const demLoai = new Map(THU_TU_LOAI.map((l) => [l, tatCa.filter((s) => s.loai === l).length]));
  const giamGia = tatCa.filter((s) => s.giaGoc && s.giaGoc > s.gia && s.tonKho > 0).slice(0, 5);
  const hang = (["cpu", "vga", "mainboard"] as const).map((loai) => ({ loai, ds: tatCa.filter((s) => s.loai === loai).slice(0, 5) }));

  return (
    <KhungTrang>
      {/* Khối đầu trang: menu danh mục · banner chính · banner phụ */}
      <section className="grid gap-3 pt-4 lg:grid-cols-[220px_1fr_300px]">
        <nav aria-label="Danh mục sản phẩm" className="tem hidden py-1.5 lg:block">
          <ul>
            {THU_TU_LOAI.map((loai) => (
              <li key={loai}>
                <Link
                  href={`/danh-muc/${loai}`}
                  className="group flex items-center gap-3 px-3 py-[7px] text-co-than text-n-9 transition-colors hover:bg-n-3 hover:text-n-10"
                >
                  <HinhLinhKien loai={loai} className="h-6 w-8 shrink-0 text-n-7 group-hover:text-n-9" />
                  <span className="flex-1">{TEN_LOAI[loai]}</span>
                  <span className="so text-co-nhan text-n-7">{demLoai.get(loai)}</span>
                  <ChevronRight className="size-3.5 text-n-6 group-hover:text-n-9" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Banner chính: Build PC */}
        <div className="relative overflow-hidden rounded-[var(--radius-tem)] border border-[#24407a] bg-[linear-gradient(120deg,#142a5c_0%,#10204a_45%,#0e1730_100%)] p-6 sm:p-8">
          <div className="relative z-10 max-w-[30rem] xl:max-w-[58%]">
            <h1 className="text-balance text-co-tieu-de-lon font-bold leading-[1.12] tracking-[-0.02em] text-white sm:text-co-hien-thi">
              Build PC, biết chắc lắp được trước khi mua
            </h1>
            <p className="mt-3 max-w-[44ch] text-co-doc text-[#c4d3f5]">
              Chọn từng linh kiện, APEX so socket, chipset, RAM, nguồn, kích thước case và độ cân bằng CPU–VGA ngay khi bạn chọn.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/build-pc" className={lopNut("chinh")}>
                Bắt đầu Build PC <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href={`/build-pc?goi-y=${chinh.i}`} className={`${lopNut("phu")} !border-[#3a5694] !bg-[#16295a]/60 hover:!bg-[#1c3370]`}>
                Mở cấu hình {chinh.ten}
              </Link>
            </div>
          </div>
          <div aria-hidden className="pointer-events-none absolute -bottom-8 -right-4 hidden w-[36%] grid-cols-2 gap-2 opacity-70 xl:grid">
            {(["vga", "cpu", "ram", "mainboard"] as const).map((l) => (
              <HinhLinhKien key={l} loai={l} className="text-[#3d5a9c]" />
            ))}
          </div>
        </div>

        {/* Banner phụ */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <Link href={`/build-pc?goi-y=${chinh.i}`} className="tem group flex flex-col p-4 transition-colors hover:border-n-5">
            <span className="flex items-center justify-between gap-2">
              <span className="text-co-nho text-n-8">Cấu hình gợi ý</span>
              {chinh.dem.loi === 0 && <Dau mucDo="dat" nhan="Lắp được" />}
            </span>
            <span className="mt-1 text-co-noi font-semibold text-n-10">Chơi game {chinh.doPhanGiai}</span>
            <span className="mt-1 line-clamp-2 text-co-nho text-n-8">{chinh.items.slice(0, 4).map((x) => x.sanPham.ten.replace(/^(AMD|Intel|ASUS|MSI) /, "")).join(" · ")}</span>
            <span className="mt-auto flex items-baseline justify-between pt-3">
              <span className="so text-co-muc font-bold text-n-10">{dinhDangTien(chinh.tong)}</span>
              <span className="so text-co-phu text-n-8">~{chinh.cs.tong} W</span>
            </span>
          </Link>
          <Link href="/so-sanh" className="tem group flex items-start gap-3 p-4 transition-colors hover:border-n-5">
            <GitCompareArrows className="mt-0.5 size-5 shrink-0 text-nhan-sang" aria-hidden />
            <span>
              <span className="block text-co-doc font-semibold text-n-10">So sánh 2–3 linh kiện</span>
              <span className="mt-0.5 block text-co-nho text-n-8">Đặt thông số cạnh nhau, món tốt hơn được tô sáng.</span>
            </span>
          </Link>
        </div>
      </section>

      {/* Dải cam kết: chỉ nêu điều sản phẩm thật sự làm */}
      {loiViDu && (
        <section className="tem mt-3 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <span className="flex shrink-0 items-center gap-2 text-co-than font-semibold text-n-10">
            <ShieldCheck className="size-5 text-nhan-sang" aria-hidden /> Kiểm tra tương thích
          </span>
          <span className="hidden h-5 w-px bg-n-4 sm:block" aria-hidden />
          <span className="flex min-w-0 flex-1 items-start gap-2">
            <Dau mucDo="loi" nhan="Ví dụ" />
            <span className="text-co-nho text-n-9">{loiViDu.thongDiep}</span>
          </span>
        </section>
      )}

      <HangSanPham tieuDe="Đang giảm giá" href="/tim-kiem?giam=1" ds={giamGia} />
      {hang.map((h) => (
        <HangSanPham key={h.loai} tieuDe={TEN_LOAI[h.loai]} href={`/danh-muc/${h.loai}`} ds={h.ds} />
      ))}
    </KhungTrang>
  );
}

function HangSanPham({ tieuDe, href, ds }: { tieuDe: string; href: string; ds: ReturnType<typeof layTatCaSanPham> }) {
  if (ds.length === 0) return null;
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-baseline justify-between gap-4 border-b border-n-4 pb-2">
        <h2 className="text-co-phan font-semibold text-n-10">{tieuDe}</h2>
        <Link href={href} className="flex items-center gap-0.5 text-co-nho text-nhan-sang hover:underline">
          Xem tất cả <ChevronRight className="size-3.5" aria-hidden />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {ds.map((sp) => (
          <TheSanPham key={sp.id} sp={sp} />
        ))}
      </div>
    </section>
  );
}
