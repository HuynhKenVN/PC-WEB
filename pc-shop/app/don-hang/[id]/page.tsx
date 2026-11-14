import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { canDangNhap } from "@/lib/auth";
import { layDon, ngayGio, TEN_TRANG_THAI, type TrangThaiDon } from "@/lib/don-hang";
import { huyDon, xacNhanChuyenKhoan } from "@/lib/actions/don-hang";
import { dinhDangTien } from "@/lib/thong-so";
import { TEN_LOAI } from "@/lib/tuong-thich";
import { NhanTrangThai, QrMau } from "@/components/nhan-don";
import { DuongDan, KhungTrang, lopNut } from "@/components/ui";

export async function generateMetadata({ params }: PageProps<"/don-hang/[id]">): Promise<Metadata> {
  return { title: `Đơn #${(await params).id.padStart(5, "0")}` };
}

const BUOC: TrangThaiDon[] = ["cho-xac-nhan", "dang-giao", "da-giao"];

export default async function TrangChiTietDon({ params, searchParams }: PageProps<"/don-hang/[id]">) {
  const { id } = await params;
  const u = await canDangNhap(`/don-hang/${id}`);
  const don = layDon(Number(id));
  if (!don || (don.userId !== u.id && !u.laAdmin)) notFound();
  const moi = (await searchParams).moi === "1";
  const ma = `#${String(don.id).padStart(5, "0")}`;
  const buocHienTai = BUOC.indexOf(don.trangThai);

  return (
    <KhungTrang>
      <DuongDan ds={[["Đơn hàng", "/don-hang"], [ma]]} />
      {moi && (
        <div className="tem mt-5 flex items-start gap-3 border-dat/40 bg-dat-nen p-4 animate-hien">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-dat text-n-0">
            <Check className="size-4" strokeWidth={3} aria-hidden />
          </span>
          <div>
            <p className="text-co-doc font-semibold text-n-10">Đặt hàng thành công</p>
            <p className="text-co-nho text-n-9">Mã đơn {ma}. Bạn có thể theo dõi trạng thái ngay trên trang này.</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pb-6 pt-8">
        <h1 className="so text-co-tieu-de font-bold text-n-10">Đơn {ma}</h1>
        <NhanTrangThai trangThai={don.trangThai} />
        <span className="so text-co-nho text-n-7">{ngayGio(don.taoLuc)}</span>
      </div>

      {don.trangThai !== "da-huy" && (
        <ol className="tem mb-6 grid grid-cols-3 p-4" aria-label="Tiến trình đơn hàng">
          {BUOC.map((b, i) => {
            const xong = i <= buocHienTai;
            return (
              <li key={b} className="relative flex flex-col items-center gap-1.5 text-center">
                {i > 0 && <span className={`absolute right-1/2 top-3 h-0.5 w-full -translate-y-1/2 ${i <= buocHienTai ? "bg-dat" : "bg-n-4"}`} aria-hidden />}
                <span className={`relative z-10 flex size-6 items-center justify-center rounded-full text-co-phu font-bold ${xong ? "bg-dat text-n-0" : "border border-n-5 bg-n-2 text-n-8"}`}>
                  {xong ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span className={`text-co-nho ${xong ? "text-n-10" : "text-n-8"}`}>{TEN_TRANG_THAI[b]}</span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="tem">
          <h2 className="border-b border-n-4 px-4 py-3 text-co-noi font-semibold text-n-10">Sản phẩm</h2>
          <ul className="divide-y divide-n-3">
            {don.items.map((i, k) => (
              <li key={k} className="flex items-baseline justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-co-phu text-n-8">{TEN_LOAI[i.loai]}</p>
                  {i.slug ? (
                    <Link href={`/san-pham/${i.slug}`} className="text-co-than text-n-10 hover:underline">{i.ten}</Link>
                  ) : (
                    <span className="text-co-than text-n-10">{i.ten}</span>
                  )}
                  <p className="so text-co-nho text-n-8">
                    {i.soLuong} × {dinhDangTien(i.gia)}
                  </p>
                </div>
                <span className="so shrink-0 text-co-than text-n-10">{dinhDangTien(i.gia * i.soLuong)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between border-t border-n-4 px-4 py-3">
            <span className="font-semibold text-n-10">Tổng cộng</span>
            <span className="so text-co-phan font-bold text-n-10">{dinhDangTien(don.tongTien)}</span>
          </div>
          {don.soLoi > 0 && (
            <p className="border-t border-n-4 px-4 py-2.5 text-co-nho text-canh-bao">Lúc đặt, giỏ có {don.soLoi} lỗi tương thích và bạn đã xác nhận vẫn đặt.</p>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          <section className="tem p-4 text-co-than">
            <h2 className="mb-2 text-co-doc font-semibold text-n-10">Giao tới</h2>
            <p className="text-n-10">{don.hoTen}</p>
            <p className="so text-n-9">{don.soDienThoai}</p>
            <p className="text-n-9">{don.diaChi}</p>
            {don.ghiChu && <p className="mt-2 text-n-8">Ghi chú: {don.ghiChu}</p>}
          </section>

          <section className="tem p-4 text-co-than">
            <h2 className="mb-2 text-co-doc font-semibold text-n-10">Thanh toán</h2>
            <p className="text-n-9">{don.thanhToan === "cod" ? "Thanh toán khi nhận hàng" : "Chuyển khoản (giả lập)"}</p>
            <p className={`mt-1 ${don.daThanhToan ? "text-dat" : "text-canh-bao"}`}>{don.daThanhToan ? "Đã thanh toán" : "Chưa thanh toán"}</p>
            {don.thanhToan === "chuyen-khoan" && !don.daThanhToan && don.trangThai !== "da-huy" && don.userId === u.id && (
              <div className="mt-4 flex flex-col items-start gap-3 border-t border-n-4 pt-4">
                <QrMau hat={don.id} />
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-co-nho">
                  <dt className="text-n-8">Ngân hàng</dt>
                  <dd className="text-n-10">Ngân hàng mô phỏng</dd>
                  <dt className="text-n-8">Số tiền</dt>
                  <dd className="so text-n-10">{dinhDangTien(don.tongTien)}</dd>
                  <dt className="text-n-8">Nội dung</dt>
                  <dd className="so text-n-10">APEX {String(don.id).padStart(5, "0")}</dd>
                </dl>
                <p className="text-co-phu text-n-7">Mã QR mẫu, không quét được. Bấm nút dưới để giả lập đã chuyển khoản.</p>
                <form action={xacNhanChuyenKhoan}>
                  <input type="hidden" name="donId" value={don.id} />
                  <button className={lopNut("chinh", "nho")}>Tôi đã chuyển khoản</button>
                </form>
              </div>
            )}
          </section>

          {don.trangThai === "cho-xac-nhan" && don.userId === u.id && (
            <form action={huyDon}>
              <input type="hidden" name="donId" value={don.id} />
              <button className={`${lopNut("nguy-hiem")} w-full`}>Hủy đơn</button>
            </form>
          )}
        </aside>
      </div>
    </KhungTrang>
  );
}
