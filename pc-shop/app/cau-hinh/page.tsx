import type { Metadata } from "next";
import Link from "next/link";
import { canDangNhap } from "@/lib/auth";
import { danhSachCauHinh } from "@/lib/cau-hinh";
import { ngayGio } from "@/lib/don-hang";
import { dinhDangTien } from "@/lib/thong-so";
import { Dau, DuongDan, KhungTrang, TieuDeTrang, TrangTrong, lopNut } from "@/components/ui";

export const metadata: Metadata = { title: "Cấu hình đã lưu" };

export default async function TrangCauHinh() {
  const u = await canDangNhap("/cau-hinh");
  const ds = danhSachCauHinh(u.id);
  return (
    <KhungTrang>
      <DuongDan ds={[["Trang chủ", "/"], ["Cấu hình đã lưu"]]} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <TieuDeTrang>Cấu hình đã lưu</TieuDeTrang>
        <Link href="/build-pc" className={`${lopNut("chinh")} mb-6`}>
          Dựng cấu hình mới
        </Link>
      </div>
      {ds.length === 0 ? (
        <TrangTrong tieuDe="Chưa có cấu hình nào" moTa="Dựng một cấu hình trong Build PC rồi bấm “Lưu cấu hình”." hanhDong={<Link href="/build-pc" className={lopNut("chinh")}>Mở Build PC</Link>} />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {ds.map((c) => (
            <li key={c.id}>
              <Link href={`/cau-hinh/${c.id}`} className="tem flex h-full flex-col p-4 transition-colors hover:border-n-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-co-noi font-semibold text-n-10">{c.ten}</h2>
                  {c.soLoi > 0 ? <Dau mucDo="loi" nhan={`${c.soLoi} lỗi`} /> : c.soCanhBao > 0 ? <Dau mucDo="canh-bao" nhan={`${c.soCanhBao} cảnh báo`} /> : <Dau mucDo="dat" nhan="Lắp được" />}
                </div>
                <p className="mt-1.5 line-clamp-2 text-co-nho text-n-8">{c.items.map((i) => i.sanPham.ten).join(" · ") || "Trống"}</p>
                <div className="mt-auto flex items-baseline justify-between pt-3">
                  <span className="so text-co-noi font-bold text-n-10">{dinhDangTien(c.tongTien)}</span>
                  <span className="so text-co-phu text-n-7">
                    {c.doPhanGiai} · sửa {ngayGio(c.suaLuc)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </KhungTrang>
  );
}
