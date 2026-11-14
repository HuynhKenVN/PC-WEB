import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { layNguoiDung } from "@/lib/auth";
import { layCauHinh } from "@/lib/cau-hinh";
import { ngayGio } from "@/lib/don-hang";
import { dinhDangTien } from "@/lib/thong-so";
import { demMucDo, kiemTra, THU_TU_LOAI, TEN_LOAI, uocTinhCongSuat } from "@/lib/tuong-thich";
import { BangDinhMuc } from "@/components/bang-dinh-muc";
import { HinhLinhKien, bienCua } from "@/components/hinh-linh-kien";
import { NutCauHinh } from "@/components/cau-hinh-client";
import { BangKetQua, DuongDan, KhungTrang } from "@/components/ui";

export async function generateMetadata({ params }: PageProps<"/cau-hinh/[id]">): Promise<Metadata> {
  const c = layCauHinh(Number((await params).id));
  return { title: c ? c.ten : "Không tìm thấy cấu hình" };
}

/** Trang xem / chia sẻ cấu hình: ai có liên kết cũng xem được; chỉ chủ sở hữu sửa và xóa. */
export default async function TrangXemCauHinh({ params }: PageProps<"/cau-hinh/[id]">) {
  const c = layCauHinh(Number((await params).id));
  if (!c) notFound();
  const u = await layNguoiDung();
  const laChu = u?.id === c.userId;

  // Kiểm tra lại theo giá và thông số hiện tại (có thể đã đổi từ lúc lưu)
  const ketQua = kiemTra(c.items, { doPhanGiai: c.doPhanGiai });
  const dem = demMucDo(ketQua);
  const cs = uocTinhCongSuat(c.items);
  const psu = c.items.find((i) => i.sanPham.loai === "nguon")?.sanPham;
  const sapXep = [...c.items].sort((a, b) => THU_TU_LOAI.indexOf(a.sanPham.loai) - THU_TU_LOAI.indexOf(b.sanPham.loai));

  return (
    <KhungTrang>
      <DuongDan ds={laChu ? [["Cấu hình đã lưu", "/cau-hinh"], [c.ten]] : [["Trang chủ", "/"], ["Cấu hình chia sẻ"]]} />
      <div className="pb-6 pt-8">
        <h1 className="text-balance text-co-tieu-de font-bold tracking-[-0.02em] text-n-10 sm:text-co-tieu-de-lon">{c.ten}</h1>
        <p className="mt-1 text-co-nho text-n-8">
          {laChu ? "Cấu hình của bạn" : `Chia sẻ bởi ${c.tacGia}`} · cập nhật {ngayGio(c.suaLuc)}
        </p>
        <div className="mt-4">
          <NutCauHinh id={c.id} items={c.items.map((i) => ({ id: i.sanPham.id, soLuong: i.soLuong }))} laChu={laChu} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <ul className="tem divide-y divide-n-4">
            {sapXep.map(({ sanPham: sp, soLuong }) => (
              <li key={sp.id} className="grid grid-cols-[64px_1fr_auto] items-center gap-3 p-3">
                <div className="flex aspect-[4/3] items-center justify-center rounded bg-n-3">
                  <HinhLinhKien loai={sp.loai} bien={bienCua(sp)} className="h-[80%] w-[80%]" />
                </div>
                <div className="min-w-0">
                  <p className="text-co-phu text-n-8">{TEN_LOAI[sp.loai]}</p>
                  <Link href={`/san-pham/${sp.slug}`} className="line-clamp-1 text-co-than text-n-10 hover:underline">
                    {soLuong > 1 && <span className="so text-n-8">{soLuong}× </span>}
                    {sp.ten}
                  </Link>
                </div>
                <span className="so text-co-than font-semibold text-n-10">{dinhDangTien(sp.gia * soLuong)}</span>
              </li>
            ))}
          </ul>
          <section className="tem">
            <h2 className="border-b border-n-4 px-4 py-2.5 text-co-doc font-semibold text-n-10">Kiểm tra tương thích</h2>
            <div className="px-4">
              <BangKetQua ketQua={ketQua} />
            </div>
          </section>
        </div>
        <aside className="lg:sticky lg:top-36 lg:self-start">
          <BangDinhMuc
            tieuDe="Bảng định mức cấu hình"
            tongTien={c.tongTien}
            congSuat={cs.tong}
            nguonDeNghi={cs.nguonDeNghi}
            congSuatNguon={psu?.loai === "nguon" ? psu.specs.congSuat : null}
            soLoi={dem.loi}
            soCanhBao={dem.canhBao}
            soMon={c.items.reduce((t, i) => t + i.soLuong, 0)}
            doPhanGiai={c.doPhanGiai}
          />
          <p className="mt-2 text-co-phu text-n-7">Giá và kết quả kiểm tra tính theo dữ liệu hiện tại của cửa hàng.</p>
        </aside>
      </div>
    </KhungTrang>
  );
}
