import type { Metadata } from "next";
import Link from "next/link";
import { canDangNhap } from "@/lib/auth";
import { danhSachDon } from "@/lib/don-hang";
import { danhSachCauHinh } from "@/lib/cau-hinh";
import { ThongTinForm } from "@/components/form-tai-khoan";
import { DuongDan, KhungTrang, TieuDeTrang } from "@/components/ui";

export const metadata: Metadata = { title: "Tài khoản" };

export default async function TrangTaiKhoan() {
  const u = await canDangNhap("/tai-khoan");
  const soDon = danhSachDon({ userId: u.id }).length;
  const soCauHinh = danhSachCauHinh(u.id).length;
  return (
    <KhungTrang>
      <DuongDan ds={[["Trang chủ", "/"], ["Tài khoản"]]} />
      <TieuDeTrang phu={u.email}>Xin chào, {u.hoTen}</TieuDeTrang>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="tem p-5">
          <h2 className="mb-4 text-co-noi font-semibold text-n-10">Thông tin cá nhân</h2>
          <div className="max-w-lg">
            <ThongTinForm hoTen={u.hoTen} soDienThoai={u.soDienThoai ?? ""} diaChi={u.diaChi ?? ""} />
          </div>
        </section>
        <nav className="flex flex-col gap-3" aria-label="Lối tắt tài khoản">
          {[
            ["/don-hang", "Đơn hàng", `${soDon} đơn`],
            ["/cau-hinh", "Cấu hình đã lưu", `${soCauHinh} cấu hình`],
            ...(u.laAdmin ? [["/quan-tri", "Trang quản trị", "Sản phẩm, đơn hàng"]] : []),
          ].map(([href, t, m]) => (
            <Link key={href} href={href} className="tem flex items-baseline justify-between p-4 transition-colors hover:border-n-5">
              <span className="text-co-doc font-medium text-n-10">{t}</span>
              <span className="so text-co-nho text-n-8">{m}</span>
            </Link>
          ))}
        </nav>
      </div>
    </KhungTrang>
  );
}
