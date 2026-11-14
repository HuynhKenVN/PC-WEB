"use client";

import { useGuiForm } from "./gui-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { Banknote, Landmark } from "lucide-react";
import { useKho } from "./kho-trinh-duyet";
import { useGioDayDu } from "./gio-hang-client";
import { LOP_O_NHAP, LoiTruong, TrangTrong, lopNut } from "./ui";
import { datHang } from "@/lib/actions/don-hang";
import { dinhDangTien } from "@/lib/thong-so";

export function ThanhToanClient({ macDinh }: { macDinh: { hoTen: string; soDienThoai: string; diaChi: string } }) {
  const { gio, xoaHet } = useKho();
  const g = useGioDayDu();
  const router = useRouter();
  const [tt, hanhDong, dang] = useActionState(datHang, null);
  const gui = useGuiForm(hanhDong);
  const [cach, setCach] = useState<"cod" | "chuyen-khoan">("cod");

  useEffect(() => {
    if (tt?.donId) {
      xoaHet();
      router.push(`/don-hang/${tt.donId}?moi=1`);
    }
  }, [tt, xoaHet, router]);

  if (!g) return <div className="tem h-64 animate-pulse" aria-label="Đang tải" />;
  if (g.dong.length === 0 && !tt?.donId) {
    return <TrangTrong tieuDe="Giỏ hàng đang trống" moTa="Thêm sản phẩm vào giỏ trước khi đặt hàng." hanhDong={<Link href="/" className={lopNut("chinh")}>Về trang chủ</Link>} />;
  }
  const loi = tt && "truongLoi" in tt ? tt.truongLoi : undefined;

  return (
    <form onSubmit={gui} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <input type="hidden" name="gio" value={JSON.stringify(gio)} />
      <div className="flex flex-col gap-6">
        <fieldset className="tem p-5">
          <legend className="sr-only">Thông tin nhận hàng</legend>
          <h2 className="mb-4 text-co-noi font-semibold text-n-10">Thông tin nhận hàng</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="hoTen" className="mb-1.5 block text-co-nho text-n-9">Họ tên người nhận</label>
              <input id="hoTen" name="hoTen" defaultValue={macDinh.hoTen} autoComplete="name" aria-invalid={!!loi?.hoTen} className={LOP_O_NHAP} />
              <LoiTruong loi={loi?.hoTen} />
            </div>
            <div>
              <label htmlFor="soDienThoai" className="mb-1.5 block text-co-nho text-n-9">Số điện thoại</label>
              <input id="soDienThoai" name="soDienThoai" type="tel" inputMode="tel" defaultValue={macDinh.soDienThoai} autoComplete="tel" aria-invalid={!!loi?.soDienThoai} className={LOP_O_NHAP} />
              <LoiTruong loi={loi?.soDienThoai} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="diaChi" className="mb-1.5 block text-co-nho text-n-9">Địa chỉ giao hàng</label>
              <input id="diaChi" name="diaChi" defaultValue={macDinh.diaChi} autoComplete="street-address" placeholder="Số nhà, đường, phường, quận, tỉnh/thành" aria-invalid={!!loi?.diaChi} className={LOP_O_NHAP} />
              <LoiTruong loi={loi?.diaChi} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ghiChu" className="mb-1.5 block text-co-nho text-n-9">Ghi chú (không bắt buộc)</label>
              <input id="ghiChu" name="ghiChu" maxLength={500} placeholder="Ví dụ: giao giờ hành chính, lắp ráp sẵn" className={LOP_O_NHAP} />
            </div>
          </div>
        </fieldset>

        <fieldset className="tem p-5">
          <legend className="sr-only">Phương thức thanh toán</legend>
          <h2 className="mb-1 text-co-noi font-semibold text-n-10">Thanh toán</h2>
          <p className="mb-4 text-co-nho text-n-8">Mô phỏng: không có giao dịch tiền thật nào được thực hiện.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ["cod", Banknote, "Thanh toán khi nhận hàng", "Trả tiền mặt cho người giao."],
                ["chuyen-khoan", Landmark, "Chuyển khoản (giả lập)", "Hiện mã QR mẫu sau khi đặt."],
              ] as const
            ).map(([v, I, t, m]) => (
              <label
                key={v}
                className={`flex cursor-pointer gap-3 rounded-md border p-3 transition-colors ${cach === v ? "border-nhan bg-nhan-nen" : "border-n-4 hover:border-n-5"}`}
              >
                <input type="radio" name="thanhToan" value={v} checked={cach === v} onChange={() => setCach(v)} className="mt-1" />
                <span>
                  <span className="flex items-center gap-2 text-co-than font-medium text-n-10">
                    <I className="size-4 text-nhan-sang" aria-hidden /> {t}
                  </span>
                  <span className="mt-0.5 block text-co-phu text-n-8">{m}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <aside className="lg:sticky lg:top-36 lg:self-start">
        <div className="tem p-4">
          <h2 className="text-co-noi font-semibold text-n-10">Đơn hàng ({g.dong.length} sản phẩm)</h2>
          <ul className="mt-3 flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
            {g.dong.map(({ sanPham: sp, soLuong }) => (
              <li key={sp.id} className="flex justify-between gap-3 text-co-nho">
                <span className="min-w-0 text-n-9">
                  <span className="so text-n-7">{soLuong}×</span> {sp.ten}
                </span>
                <span className="so shrink-0 text-n-10">{dinhDangTien(sp.gia * soLuong)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-baseline justify-between border-t border-n-4 pt-3">
            <span className="font-semibold text-n-10">Tổng cộng</span>
            <span className="so text-co-gia font-bold text-n-10">{dinhDangTien(g.tong)}</span>
          </div>

          {g.dem.loi > 0 && (
            <label className="mt-3 flex cursor-pointer gap-2.5 rounded-md bg-loi-nen p-3 text-co-nho text-loi">
              <input type="checkbox" name="xacNhanLoi" className="mt-0.5" />
              <span>
                Giỏ có {g.dem.loi} lỗi tương thích (<Link href="/gio-hang" className="underline">xem chi tiết</Link>). Tôi hiểu và vẫn muốn đặt.
              </span>
            </label>
          )}
          {tt?.loi && <p role="alert" className="mt-3 text-co-nho text-loi">{tt.loi}</p>}
          <button disabled={dang} className={`${lopNut("chinh")} mt-4 w-full`}>
            {dang ? "Đang đặt hàng…" : "Đặt hàng"}
          </button>
        </div>
      </aside>
    </form>
  );
}
