"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useDanhMuc, useKho } from "./kho-trinh-duyet";
import { HinhLinhKien, bienCua } from "./hinh-linh-kien";
import { BangKetQua, BieuTuongMucDo, MAU_MUC_DO, TrangTrong, lopNut } from "./ui";
import { demMucDo, kiemTra, soLoaiLienQuan, TEN_LOAI, type KetQua } from "@/lib/tuong-thich";
import { dinhDangTien } from "@/lib/thong-so";
import type { SanPhamDayDu } from "@/lib/db";

export function useGioDayDu() {
  const { gio, daNap } = useKho();
  const danhMuc = useDanhMuc();
  return useMemo(() => {
    if (!daNap || !danhMuc) return null;
    const theoId = new Map(danhMuc.map((s) => [s.id, s]));
    const dong = gio.map((d) => ({ sanPham: theoId.get(d.id), soLuong: d.soLuong })).filter((d): d is { sanPham: SanPhamDayDu; soLuong: number } => !!d.sanPham);
    const tong = dong.reduce((t, d) => t + d.sanPham.gia * d.soLuong, 0);
    const ketQua = kiemTra(dong, { cheDo: "gio-hang" });
    return { dong, tong, ketQua, dem: demMucDo(ketQua), hienBang: soLoaiLienQuan(dong) >= 2 && ketQua.length > 0 };
  }, [gio, daNap, danhMuc]);
}

/** Mức nặng nhất của các kết quả có dính tới sản phẩm. */
function mucCua(id: number, ketQua: KetQua[]) {
  const lienQuan = ketQua.filter((k) => k.linhKienLienQuan.includes(id) && (k.mucDo === "loi" || k.mucDo === "canh-bao"));
  return lienQuan.find((k) => k.mucDo === "loi")?.mucDo ?? lienQuan[0]?.mucDo ?? null;
}

export function GioHangClient() {
  const { datSoLuong, xoa } = useKho();
  const g = useGioDayDu();
  if (!g) return <div className="tem h-64 animate-pulse" aria-label="Đang tải giỏ hàng" />;
  if (g.dong.length === 0) {
    return (
      <TrangTrong
        tieuDe="Giỏ hàng đang trống"
        moTa="Thêm linh kiện từ danh mục, hoặc dựng một cấu hình hoàn chỉnh rồi thêm cả bộ vào giỏ."
        hanhDong={
          <div className="flex gap-2">
            <Link href="/build-pc" className={lopNut("chinh")}>Build PC</Link>
            <Link href="/danh-muc/cpu" className={lopNut("phu")}>Xem linh kiện</Link>
          </div>
        }
      />
    );
  }
  const tenTheoId = new Map(g.dong.map((d) => [d.sanPham.id, d.sanPham.ten]));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-6">
        <ul className="tem divide-y divide-n-4">
          {g.dong.map(({ sanPham: sp, soLuong }) => {
            const muc = mucCua(sp.id, g.ketQua);
            return (
              <li key={sp.id} className="grid grid-cols-[72px_1fr] gap-3 p-3 sm:grid-cols-[88px_1fr_auto] sm:items-center sm:gap-4">
                <Link href={`/san-pham/${sp.slug}`} className="flex aspect-[4/3] items-center justify-center rounded-md bg-n-3">
                  <HinhLinhKien loai={sp.loai} bien={bienCua(sp)} className="h-[80%] w-[80%]" />
                </Link>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-co-phu text-n-8">
                    {TEN_LOAI[sp.loai]}
                    {muc && (
                      <span className={`dau ${MAU_MUC_DO[muc].chu} animate-dong-dau`}>
                        <BieuTuongMucDo mucDo={muc} className="size-3" />
                        {muc === "loi" ? "Không hợp" : "Lưu ý"}
                      </span>
                    )}
                  </p>
                  <Link href={`/san-pham/${sp.slug}`} className="mt-0.5 line-clamp-2 text-co-than font-medium leading-snug text-n-10 hover:underline">
                    {sp.ten}
                  </Link>
                  <p className="so mt-1 text-co-than text-n-9">{dinhDangTien(sp.gia)}</p>
                  {soLuong > sp.tonKho && <p className="mt-1 text-co-phu text-loi">Chỉ còn {sp.tonKho} sản phẩm</p>}
                </div>
                <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end">
                  <div className="flex h-9 items-center rounded-md border border-n-4 bg-n-1" role="group" aria-label={`Số lượng ${sp.ten}`}>
                    <button type="button" aria-label="Giảm" onClick={() => datSoLuong(sp.id, soLuong - 1)} className="flex h-full w-8 items-center justify-center text-n-9 hover:text-n-10">
                      <Minus className="size-3.5" />
                    </button>
                    <span className="so w-8 text-center text-co-than">{soLuong}</span>
                    <button type="button" aria-label="Tăng" disabled={soLuong >= Math.min(99, sp.tonKho)} onClick={() => datSoLuong(sp.id, soLuong + 1)} className="flex h-full w-8 items-center justify-center text-n-9 hover:text-n-10 disabled:opacity-40">
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="so text-co-doc font-semibold text-n-10">{dinhDangTien(sp.gia * soLuong)}</span>
                    <button type="button" onClick={() => xoa(sp.id)} aria-label={`Xóa ${sp.ten} khỏi giỏ`} className="rounded p-1.5 text-n-8 hover:bg-n-3 hover:text-loi">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {g.hienBang && (
          <section aria-labelledby="tt" className="tem">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-n-4 px-4 py-3">
              <h2 id="tt" className="text-co-noi font-semibold text-n-10">Kiểm tra tương thích</h2>
              <p className="flex gap-3 text-co-nho">
                <span className={g.dem.loi ? "text-loi" : "text-n-7"}>{g.dem.loi} lỗi</span>
                <span className={g.dem.canhBao ? "text-canh-bao" : "text-n-7"}>{g.dem.canhBao} cảnh báo</span>
                <span className="text-dat">{g.dem.dat} đạt</span>
              </p>
            </div>
            <div className="px-4">
              <BangKetQua ketQua={g.ketQua} tenTheoId={tenTheoId} />
            </div>
            <p className="border-t border-n-4 px-4 py-2.5 text-co-phu text-n-7">
              So theo từng cặp linh kiện trong giỏ. Giỏ có nhiều CPU hoặc nhiều VGA thì không tính công suất tổng. Muốn kiểm tra một bộ máy hoàn chỉnh, dùng{" "}
              <Link href="/build-pc" className="text-nhan-sang hover:underline">Build PC</Link>.
            </p>
          </section>
        )}
      </div>

      <aside className="lg:sticky lg:top-36 lg:self-start">
        <div className="tem p-4">
          <h2 className="text-co-noi font-semibold text-n-10">Tóm tắt đơn</h2>
          <dl className="mt-3 flex flex-col gap-2 text-co-than">
            <div className="flex justify-between">
              <dt className="text-n-8">Tạm tính ({g.dong.reduce((t, d) => t + d.soLuong, 0)} sản phẩm)</dt>
              <dd className="so text-n-10">{dinhDangTien(g.tong)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-n-8">Phí giao hàng</dt>
              <dd className="text-dat">Miễn phí</dd>
            </div>
            <div className="mt-1 flex items-baseline justify-between border-t border-n-4 pt-3">
              <dt className="font-semibold text-n-10">Tổng cộng</dt>
              <dd className="so text-co-gia font-bold text-n-10">{dinhDangTien(g.tong)}</dd>
            </div>
          </dl>
          {g.dem.loi > 0 && (
            <p className="mt-3 rounded-md bg-loi-nen px-3 py-2 text-co-nho text-loi">
              Giỏ có {g.dem.loi} lỗi tương thích. Bạn vẫn đặt được nếu mua cho nhiều máy khác nhau.
            </p>
          )}
          <Link href="/thanh-toan" className={`${lopNut("chinh")} mt-4 w-full`}>
            Tiến hành đặt hàng
          </Link>
          <Link href="/" className="mt-2 block text-center text-co-nho text-n-8 hover:text-n-10">
            Tiếp tục mua sắm
          </Link>
        </div>
      </aside>
    </div>
  );
}
