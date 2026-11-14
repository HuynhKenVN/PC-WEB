"use client";

import { useGuiForm } from "./gui-form";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, Star, Wrench } from "lucide-react";
import { useDanhMuc, useKho } from "./kho-trinh-duyet";
import { datVaoNhap, docNhap, ghiNhap } from "@/lib/nhap-cau-hinh";
import { guiDanhGia } from "@/lib/actions/danh-gia";
import type { LoaiLinhKien } from "@/lib/tuong-thich/types";
import { LoiTruong, lopNut } from "./ui";

export function KhoiMua({ id, loai, tonKho }: { id: number; loai: LoaiLinhKien; tonKho: number }) {
  const { them } = useKho();
  const danhMuc = useDanhMuc();
  const router = useRouter();
  const [soLuong, setSoLuong] = useState(1);
  const [vuaThem, setVuaThem] = useState(false);
  const het = tonKho === 0;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex h-10 items-center rounded-md border border-n-4 bg-n-1" role="group" aria-label="Số lượng">
          <button type="button" aria-label="Giảm" disabled={soLuong <= 1} onClick={() => setSoLuong((s) => s - 1)} className="flex h-full w-9 items-center justify-center text-n-9 hover:text-n-10 disabled:opacity-40">
            <Minus className="size-4" />
          </button>
          <span className="so w-8 text-center text-co-than" aria-live="polite">{soLuong}</span>
          <button type="button" aria-label="Tăng" disabled={soLuong >= Math.min(tonKho, 99)} onClick={() => setSoLuong((s) => s + 1)} className="flex h-full w-9 items-center justify-center text-n-9 hover:text-n-10 disabled:opacity-40">
            <Plus className="size-4" />
          </button>
        </div>
        <button
          type="button"
          disabled={het}
          onClick={() => {
            them(id, soLuong);
            setVuaThem(true);
            setTimeout(() => setVuaThem(false), 1600);
          }}
          className={`${lopNut("chinh")} min-w-44 flex-1 sm:flex-none`}
        >
          {het ? "Hết hàng" : vuaThem ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
        </button>
        <button
          type="button"
          disabled={!danhMuc}
          onClick={() => {
            const loaiCua = (x: number) => danhMuc?.find((s) => s.id === x)?.loai;
            ghiNhap(datVaoNhap(docNhap(), { id, loai }, loaiCua));
            router.push("/build-pc");
          }}
          className={lopNut("phu")}
        >
          <Wrench className="size-4" aria-hidden /> Đưa vào Build PC
        </button>
      </div>
      {vuaThem && (
        <p className="animate-hien text-co-nho text-dat">
          Đã thêm {soLuong} sản phẩm. <Link href="/gio-hang" className="underline">Xem giỏ hàng</Link>
        </p>
      )}
    </div>
  );
}

export function FormDanhGia({ productId, slug, daDangNhap, cu }: { productId: number; slug: string; daDangNhap: boolean; cu?: { soSao: number; noiDung: string } }) {
  const [trangThai, hanhDong, dangGui] = useActionState(guiDanhGia, null);
  const gui = useGuiForm(hanhDong);
  const [sao, setSao] = useState(cu?.soSao ?? 0);
  const [hover, setHover] = useState(0);
  if (!daDangNhap) {
    return (
      <p className="tem px-4 py-3 text-co-than text-n-8">
        <Link href={`/dang-nhap?tiep=/san-pham/${slug}`} className="text-nhan-sang hover:underline">Đăng nhập</Link> để viết đánh giá.
      </p>
    );
  }
  return (
    <form onSubmit={gui} className="tem flex flex-col gap-3 p-4">
      <p className="text-co-doc font-semibold text-n-10">{cu ? "Sửa đánh giá của bạn" : "Viết đánh giá"}</p>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="soSao" value={sao} />
      <div>
        <div className="flex gap-0.5" role="radiogroup" aria-label="Số sao" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={sao === i}
              aria-label={`${i} sao`}
              onClick={() => setSao(i)}
              onMouseEnter={() => setHover(i)}
              className="p-0.5 transition-transform active:scale-90"
            >
              <Star className={`size-6 ${(hover || sao) >= i ? "fill-[#f2c94c] text-[#f2c94c]" : "text-n-5"}`} />
            </button>
          ))}
        </div>
        <LoiTruong loi={trangThai?.truongLoi?.soSao} />
      </div>
      <div>
        <label htmlFor="noiDung" className="sr-only">Nội dung đánh giá</label>
        <textarea
          id="noiDung"
          name="noiDung"
          rows={3}
          defaultValue={cu?.noiDung}
          maxLength={1000}
          placeholder="Bạn dùng linh kiện này cho máy nào? Nhiệt độ, độ ồn, hiệu năng ra sao?"
          aria-invalid={!!trangThai?.truongLoi?.noiDung}
          className="w-full rounded-md border border-n-4 bg-n-1 px-3 py-2 text-co-than text-n-10 placeholder:text-n-7 focus:border-nhan focus:outline-none aria-[invalid=true]:border-loi"
        />
        <LoiTruong loi={trangThai?.truongLoi?.noiDung} />
      </div>
      {trangThai?.loi && <p className="text-co-nho text-loi">{trangThai.loi}</p>}
      {trangThai?.ok && <p className="text-co-nho text-dat">{trangThai.ok}</p>}
      <button disabled={dangGui} className={`${lopNut("chinh")} self-start`}>
        {dangGui ? "Đang gửi…" : "Gửi đánh giá"}
      </button>
    </form>
  );
}
