import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db, layNhieuSanPham, laySanPhamTheoSlug } from "@/lib/db";
import { layNguoiDung } from "@/lib/auth";
import { thongSo } from "@/lib/thong-so";
import { TEN_LOAI, xetUngVien, type LoaiLinhKien } from "@/lib/tuong-thich";
import { KhungHinh } from "@/components/the-san-pham";
import { FormDanhGia, KhoiMua } from "@/components/chi-tiet-client";
import { NutSoSanh } from "@/components/nut-gio";
import { BieuTuongMucDo, DuongDan, Gia, KhungTrang, MAU_MUC_DO, Sao } from "@/components/ui";

const LIEN_QUAN: Record<LoaiLinhKien, LoaiLinhKien[]> = {
  cpu: ["mainboard", "tan-nhiet"],
  mainboard: ["cpu", "ram", "case"],
  ram: ["mainboard"],
  vga: ["case", "nguon"],
  "o-cung": ["mainboard"],
  nguon: ["vga"],
  case: ["mainboard", "vga", "tan-nhiet"],
  "tan-nhiet": ["cpu", "case"],
};

export async function generateMetadata({ params }: PageProps<"/san-pham/[slug]">): Promise<Metadata> {
  const sp = laySanPhamTheoSlug((await params).slug);
  return { title: sp?.ten ?? "Không tìm thấy sản phẩm", description: sp?.moTa };
}

type DongDanhGia = { id: number; user_id: number; ho_ten: string; so_sao: number; noi_dung: string; tao_luc: string };

export default async function TrangSanPham({ params }: PageProps<"/san-pham/[slug]">) {
  const { slug } = await params;
  const sp = laySanPhamTheoSlug(slug);
  if (!sp) notFound();
  const nguoiDung = await layNguoiDung();

  const danhGia = db
    .prepare("SELECT r.*, u.ho_ten FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.product_id = ? ORDER BY r.tao_luc DESC")
    .all(sp.id) as DongDanhGia[];
  const cuaToi = nguoiDung ? danhGia.find((d) => d.user_id === nguoiDung.id) : undefined;
  const phanBo = [5, 4, 3, 2, 1].map((s) => ({ s, n: danhGia.filter((d) => d.so_sao === s).length }));

  const nhomLienQuan = LIEN_QUAN[sp.loai].map((loai) => {
    const ds = layNhieuSanPham({ loai }).map((khac) => ({ khac, xet: xetUngVien([{ sanPham: sp, soLuong: 1 }], khac) }));
    return { loai, hop: ds.filter((d) => d.xet.mucDo !== "loi"), khong: ds.filter((d) => d.xet.mucDo === "loi") };
  });

  return (
    <KhungTrang>
      <DuongDan ds={[["Trang chủ", "/"], [TEN_LOAI[sp.loai], `/danh-muc/${sp.loai}`], [sp.ten]]} />

      <section className="grid gap-6 pt-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10">
        <div className="tem p-3">
          <KhungHinh sp={sp} className="aspect-[4/3]" />
          <p className="mt-2 text-center text-co-phu text-n-7">Hình minh họa, không phải ảnh sản phẩm thật</p>
        </div>

        <div>
          <p className="text-co-nho text-n-8">
            {sp.hang} · {TEN_LOAI[sp.loai]}
          </p>
          <h1 className="mt-1 text-balance text-co-gia font-bold leading-tight tracking-[-0.015em] text-n-10 sm:text-co-tieu-de">{sp.ten}</h1>
          <a href="#danh-gia" className="mt-2 inline-flex items-center gap-2 text-co-nho text-n-8 hover:text-n-10">
            <Sao diem={sp.diemTb} co="vua" />
            {sp.soDanhGia ? `${sp.diemTb?.toFixed(1)} · ${sp.soDanhGia} đánh giá` : "Chưa có đánh giá"}
          </a>
          <div className="mt-5 border-y border-n-4 py-4">
            <Gia gia={sp.gia} giaGoc={sp.giaGoc} lon />
            <p className={`mt-1 text-co-nho ${sp.tonKho === 0 ? "text-loi" : sp.tonKho <= 5 ? "text-canh-bao" : "text-dat"}`}>
              {sp.tonKho === 0 ? "Hết hàng" : sp.tonKho <= 5 ? `Chỉ còn ${sp.tonKho} sản phẩm` : `Còn hàng (${sp.tonKho})`}
            </p>
          </div>
          <p className="mt-4 max-w-[62ch] text-co-doc text-n-9">{sp.moTa}</p>
          <div className="mt-5">
            <KhoiMua id={sp.id} loai={sp.loai} tonKho={sp.tonKho} />
          </div>
          <div className="mt-2">
            <NutSoSanh id={sp.id} co="vua" />
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10">
        <section aria-labelledby="ts">
          <h2 id="ts" className="mb-3 text-co-phan font-semibold text-n-10">
            Thông số kỹ thuật
          </h2>
          <div className="tem overflow-hidden">
            <table className="w-full text-co-than">
              <tbody>
                {thongSo(sp).map((d, i) => (
                  <tr key={d.khoa} className={i % 2 ? "bg-n-1/40" : ""}>
                    <th scope="row" className="w-[46%] border-b border-n-3 px-4 py-2.5 text-left font-normal text-n-8">
                      {d.nhan}
                    </th>
                    <td className="so border-b border-n-3 px-4 py-2.5 text-n-10">{d.giaTri}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(sp.loai === "cpu" || sp.loai === "vga") && (
            <p className="mt-2 text-co-phu text-n-7">Điểm hiệu năng là điểm tương đối dùng để ước lượng nghẽn cổ chai, không phải kết quả đo thực tế.</p>
          )}
        </section>

        <section aria-labelledby="tt">
          <h2 id="tt" className="mb-1 text-co-phan font-semibold text-n-10">
            Lắp cùng được với
          </h2>
          <p className="mb-3 text-co-nho text-n-8">Kiểm tra riêng với từng món, theo cùng bộ quy tắc của Build PC.</p>
          <div className="flex flex-col gap-3">
            {nhomLienQuan.map((n) => (
              <div key={n.loai} className="tem">
                <p className="flex items-baseline justify-between border-b border-n-4 px-4 py-2 text-co-than font-medium text-n-10">
                  {TEN_LOAI[n.loai]}
                  <span className="so text-co-phu font-normal text-n-8">
                    {n.hop.length}/{n.hop.length + n.khong.length} lắp được
                  </span>
                </p>
                <ul className="divide-y divide-n-3">
                  {[...n.hop, ...n.khong].map(({ khac, xet }) => (
                    <li key={khac.id} className="grid grid-cols-[auto_1fr] gap-x-3 px-4 py-2">
                      <span className={`mt-[3px] flex size-5 items-center justify-center rounded ${MAU_MUC_DO[xet.mucDo].nen} ${MAU_MUC_DO[xet.mucDo].chu}`}>
                        <BieuTuongMucDo mucDo={xet.mucDo} className="size-3" />
                      </span>
                      <div className="min-w-0">
                        <Link href={`/san-pham/${khac.slug}`} className={`text-co-than hover:underline ${xet.mucDo === "loi" ? "text-n-8" : "text-n-10"}`}>
                          {khac.ten}
                        </Link>
                        {xet.lyDo[0] && <p className={`mt-0.5 text-co-phu ${MAU_MUC_DO[xet.lyDo[0].mucDo].chu}`}>{xet.lyDo[0].thongDiep}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section id="danh-gia" aria-labelledby="dg" className="mt-12 scroll-mt-32">
        <h2 id="dg" className="mb-4 text-co-phan font-semibold text-n-10">
          Đánh giá
        </h2>
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="tem self-start p-4">
            <p className="so text-co-tieu-de-lon font-bold leading-none text-n-10">
              {sp.diemTb ? sp.diemTb.toFixed(1) : "–"}
              <span className="text-co-doc text-n-8">/5</span>
            </p>
            <div className="mt-2">
              <Sao diem={sp.diemTb} co="vua" />
            </div>
            <ul className="mt-3 flex flex-col gap-1">
              {phanBo.map(({ s, n }) => (
                <li key={s} className="flex items-center gap-2 text-co-phu text-n-8">
                  <span className="so w-3">{s}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-n-4">
                    <span className="block h-full rounded-full bg-[#f2c94c]" style={{ width: `${danhGia.length ? (n / danhGia.length) * 100 : 0}%` }} />
                  </span>
                  <span className="so w-4 text-right">{n}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <FormDanhGia
              productId={sp.id}
              slug={sp.slug}
              daDangNhap={!!nguoiDung}
              cu={cuaToi ? { soSao: cuaToi.so_sao, noiDung: cuaToi.noi_dung } : undefined}
            />
            {danhGia.length === 0 ? (
              <p className="text-co-than text-n-8">Chưa có đánh giá nào. Bạn có thể là người đầu tiên.</p>
            ) : (
              <ul className="divide-y divide-n-4">
                {danhGia.map((d) => (
                  <li key={d.id} className="py-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-co-than font-medium text-n-10">{d.ho_ten}</span>
                      <Sao diem={d.so_sao} />
                      <span className="so text-co-phu text-n-7">{new Date(d.tao_luc + "Z").toLocaleDateString("vi-VN")}</span>
                    </div>
                    <p className="mt-1.5 max-w-[70ch] text-co-than text-n-9">{d.noi_dung}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </KhungTrang>
  );
}
