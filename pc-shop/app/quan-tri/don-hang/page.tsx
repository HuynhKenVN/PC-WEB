import type { Metadata } from "next";
import Link from "next/link";
import { danhSachDon, ngayGio, TEN_TRANG_THAI, type TrangThaiDon } from "@/lib/don-hang";
import { dinhDangTien } from "@/lib/thong-so";
import { NhanTrangThai } from "@/components/nhan-don";
import { ChonTrangThai } from "@/components/quan-tri/chon-trang-thai";

export const metadata: Metadata = { title: "Đơn hàng · Quản trị" };

export default async function TrangQuanTriDon({ searchParams }: PageProps<"/quan-tri/don-hang">) {
  const ts = await searchParams;
  const loc = (Object.keys(TEN_TRANG_THAI) as TrangThaiDon[]).find((t) => t === ts.tt);
  const ds = danhSachDon({ trangThai: loc });
  return (
    <div>
      <h1 className="pb-5 text-co-gia font-bold tracking-[-0.015em] text-n-10">Đơn hàng</h1>
      <nav aria-label="Lọc theo trạng thái" className="mb-3 flex flex-wrap gap-1">
        {[undefined, ...(Object.keys(TEN_TRANG_THAI) as TrangThaiDon[])].map((t) => (
          <Link
            key={t ?? "tat-ca"}
            href={t ? `/quan-tri/don-hang?tt=${t}` : "/quan-tri/don-hang"}
            className={`rounded-full px-3 py-1 text-co-nho ${t === loc ? "bg-nhan text-white" : "bg-n-2 text-n-9 hover:bg-n-3"}`}
          >
            {t ? TEN_TRANG_THAI[t] : "Tất cả"}
          </Link>
        ))}
      </nav>
      {ds.length === 0 ? (
        <p className="tem px-4 py-8 text-center text-co-than text-n-8">Không có đơn nào.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {ds.map((d) => (
            <li key={d.id} id={`don-${d.id}`} className="tem scroll-mt-36 p-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link href={`/don-hang/${d.id}`} className="so text-co-doc font-semibold text-n-10 hover:underline">
                  #{String(d.id).padStart(5, "0")}
                </Link>
                <NhanTrangThai trangThai={d.trangThai} />
                <span className="text-co-nho text-n-8">
                  {d.thanhToan === "cod" ? "COD" : "Chuyển khoản"} · <span className={d.daThanhToan ? "text-dat" : "text-canh-bao"}>{d.daThanhToan ? "đã thanh toán" : "chưa thanh toán"}</span>
                </span>
                {d.soLoi > 0 && <span className="text-co-nho text-canh-bao">{d.soLoi} lỗi tương thích (khách đã xác nhận)</span>}
                <span className="so ml-auto text-co-phu text-n-7">{ngayGio(d.taoLuc)}</span>
              </div>
              <div className="mt-3 grid gap-3 text-co-nho md:grid-cols-[1fr_1fr_auto] md:items-end">
                <div>
                  <p className="text-n-10">{d.hoTen} · <span className="so">{d.soDienThoai}</span></p>
                  <p className="text-n-8">{d.diaChi}</p>
                  <p className="text-n-7">{d.email}</p>
                </div>
                <p className="text-n-9">
                  {d.items.map((i) => (i.soLuong > 1 ? `${i.soLuong}× ${i.ten}` : i.ten)).join(", ")}
                  <span className="so mt-1 block font-semibold text-n-10">{dinhDangTien(d.tongTien)}</span>
                </p>
                <ChonTrangThai id={d.id} hienTai={d.trangThai} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
