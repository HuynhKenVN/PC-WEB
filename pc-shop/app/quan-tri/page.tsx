import type { Metadata } from "next";
import Link from "next/link";
import { db, layTatCaSanPham } from "@/lib/db";
import { danhSachDon, ngayGio, TEN_TRANG_THAI, type TrangThaiDon } from "@/lib/don-hang";
import { dinhDangTien } from "@/lib/thong-so";
import { NhanTrangThai } from "@/components/nhan-don";

export const metadata: Metadata = { title: "Quản trị" };

export default function TrangQuanTri() {
  const don = danhSachDon();
  const sp = layTatCaSanPham();
  const { n: soKhach } = db.prepare("SELECT COUNT(*) AS n FROM users WHERE la_admin = 0").get() as { n: number };
  const doanhThu = don.filter((d) => d.trangThai !== "da-huy").reduce((t, d) => t + d.tongTien, 0);
  const theoTT = (Object.keys(TEN_TRANG_THAI) as TrangThaiDon[]).map((t) => ({ t, n: don.filter((d) => d.trangThai === t).length }));
  const sapHet = sp.filter((s) => s.tonKho <= 5).sort((a, b) => a.tonKho - b.tonKho);

  return (
    <div>
      <h1 className="pb-5 text-co-gia font-bold tracking-[-0.015em] text-n-10">Tổng quan</h1>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Đơn hàng", String(don.length)],
          ["Giá trị đơn (trừ đơn hủy)", dinhDangTien(doanhThu)],
          ["Sản phẩm", String(sp.length)],
          ["Tài khoản khách", String(soKhach)],
        ].map(([n, v]) => (
          <div key={n} className="tem p-4">
            <dt className="text-co-nho text-n-8">{n}</dt>
            <dd className="so mt-1 text-co-phan font-bold text-n-10">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="tem">
          <div className="flex items-center justify-between border-b border-n-4 px-4 py-3">
            <h2 className="text-co-doc font-semibold text-n-10">Đơn mới nhất</h2>
            <div className="flex gap-2 text-co-phu text-n-8">
              {theoTT.map(({ t, n }) => (
                <span key={t}>
                  {TEN_TRANG_THAI[t]} <span className="so text-n-10">{n}</span>
                </span>
              ))}
            </div>
          </div>
          {don.length === 0 ? (
            <p className="px-4 py-6 text-co-than text-n-8">Chưa có đơn hàng.</p>
          ) : (
            <ul className="divide-y divide-n-3">
              {don.slice(0, 6).map((d) => (
                <li key={d.id} className="flex items-center gap-3 px-4 py-2.5 text-co-than">
                  <Link href={`/quan-tri/don-hang#don-${d.id}`} className="so font-medium text-n-10 hover:underline">
                    #{String(d.id).padStart(5, "0")}
                  </Link>
                  <NhanTrangThai trangThai={d.trangThai} />
                  <span className="min-w-0 flex-1 truncate text-n-8">{d.hoTen}</span>
                  <span className="so text-n-10">{dinhDangTien(d.tongTien)}</span>
                  <span className="so hidden text-co-phu text-n-7 sm:inline">{ngayGio(d.taoLuc)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="tem">
          <h2 className="border-b border-n-4 px-4 py-3 text-co-doc font-semibold text-n-10">Sắp hết hàng (≤ 5)</h2>
          {sapHet.length === 0 ? (
            <p className="px-4 py-6 text-co-than text-n-8">Không có sản phẩm nào sắp hết.</p>
          ) : (
            <ul className="divide-y divide-n-3">
              {sapHet.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-co-than">
                  <Link href={`/quan-tri/san-pham/${s.id}`} className="truncate text-n-10 hover:underline">
                    {s.ten}
                  </Link>
                  <span className={`so ${s.tonKho === 0 ? "text-loi" : "text-canh-bao"}`}>{s.tonKho}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
