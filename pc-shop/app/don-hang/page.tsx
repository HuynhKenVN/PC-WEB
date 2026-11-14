import type { Metadata } from "next";
import Link from "next/link";
import { canDangNhap } from "@/lib/auth";
import { danhSachDon, ngayGio } from "@/lib/don-hang";
import { dinhDangTien } from "@/lib/thong-so";
import { NhanTrangThai } from "@/components/nhan-don";
import { DuongDan, KhungTrang, TieuDeTrang, TrangTrong, lopNut } from "@/components/ui";

export const metadata: Metadata = { title: "Đơn hàng của tôi" };

export default async function TrangDonHang() {
  const u = await canDangNhap("/don-hang");
  const ds = danhSachDon({ userId: u.id });
  return (
    <KhungTrang>
      <DuongDan ds={[["Trang chủ", "/"], ["Đơn hàng"]]} />
      <TieuDeTrang>Đơn hàng của tôi</TieuDeTrang>
      {ds.length === 0 ? (
        <TrangTrong tieuDe="Bạn chưa có đơn hàng nào" moTa="Đơn hàng sẽ hiện ở đây sau khi bạn đặt." hanhDong={<Link href="/" className={lopNut("chinh")}>Mua sắm ngay</Link>} />
      ) : (
        <ul className="flex flex-col gap-3">
          {ds.map((d) => (
            <li key={d.id}>
              <Link href={`/don-hang/${d.id}`} className="tem flex flex-col gap-2 p-4 transition-colors hover:border-n-5 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-3 sm:w-56">
                  <span className="so text-co-doc font-semibold text-n-10">#{String(d.id).padStart(5, "0")}</span>
                  <NhanTrangThai trangThai={d.trangThai} />
                </div>
                <p className="min-w-0 flex-1 truncate text-co-than text-n-9">
                  {d.items.map((i) => (i.soLuong > 1 ? `${i.soLuong}× ${i.ten}` : i.ten)).join(", ")}
                </p>
                <div className="flex items-baseline justify-between gap-4 sm:flex-col sm:items-end sm:gap-0">
                  <span className="so text-co-doc font-semibold text-n-10">{dinhDangTien(d.tongTien)}</span>
                  <span className="so text-co-phu text-n-7">{ngayGio(d.taoLuc)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </KhungTrang>
  );
}
