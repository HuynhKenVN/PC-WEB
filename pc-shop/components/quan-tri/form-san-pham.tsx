"use client";

import { useGuiForm } from "../gui-form";
import Link from "next/link";
import { useActionState, useState } from "react";
import { luuSanPham } from "@/lib/actions/quan-tri";
import { THU_TU_LOAI, TEN_LOAI, type LoaiLinhKien } from "@/lib/tuong-thich";
import { LOP_O_NHAP, LoiTruong, lopNut } from "../ui";

export interface GiaTriSanPham {
  id: number | null;
  ten: string;
  hang: string;
  loai: LoaiLinhKien;
  gia: number | "";
  giaGoc: number | "";
  tonKho: number | "";
  moTa: string;
  specs: string;
}

export function FormSanPham({ dau, mauSpecs }: { dau: GiaTriSanPham; mauSpecs: Record<LoaiLinhKien, string> }) {
  const [tt, hanhDong, dang] = useActionState(luuSanPham, null);
  const gui = useGuiForm(hanhDong);
  const [loai, setLoai] = useState(dau.loai);
  const [specs, setSpecs] = useState(dau.specs);
  const loi = tt?.truongLoi ?? {};

  const o = (ten: keyof GiaTriSanPham, nhan: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={ten} className="mb-1.5 block text-co-nho text-n-9">
        {nhan}
      </label>
      <input id={ten} name={ten} defaultValue={dau[ten] as string | number} aria-invalid={!!loi[ten]} className={LOP_O_NHAP} {...props} />
      <LoiTruong loi={loi[ten]} />
    </div>
  );

  return (
    <form onSubmit={gui} className="tem flex flex-col gap-4 p-5">
      {dau.id && <input type="hidden" name="id" value={dau.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">{o("ten", "Tên sản phẩm", { required: true })}</div>
        {o("hang", "Hãng", { required: true })}
        <div>
          <label htmlFor="loai" className="mb-1.5 block text-co-nho text-n-9">
            Loại linh kiện
          </label>
          <select
            id="loai"
            name="loai"
            value={loai}
            onChange={(e) => {
              const moi = e.target.value as LoaiLinhKien;
              // Đổi loại khi thêm mới: nạp mẫu thông số của loại đó
              if (!dau.id || confirm("Đổi loại sẽ thay thông số bằng mẫu của loại mới. Tiếp tục?")) {
                setLoai(moi);
                setSpecs(mauSpecs[moi]);
              }
            }}
            className={LOP_O_NHAP}
          >
            {THU_TU_LOAI.map((l) => (
              <option key={l} value={l}>
                {TEN_LOAI[l]}
              </option>
            ))}
          </select>
          <LoiTruong loi={loi.loai} />
        </div>
        {o("gia", "Giá bán (₫)", { type: "number", min: 0, step: 1000, inputMode: "numeric", required: true })}
        {o("giaGoc", "Giá gốc (₫, để trống nếu không giảm)", { type: "number", min: 0, step: 1000, inputMode: "numeric" })}
        {o("tonKho", "Tồn kho", { type: "number", min: 0, step: 1, inputMode: "numeric", required: true })}
      </div>
      <div>
        <label htmlFor="moTa" className="mb-1.5 block text-co-nho text-n-9">
          Mô tả ngắn
        </label>
        <textarea id="moTa" name="moTa" rows={2} defaultValue={dau.moTa} className="w-full rounded-md border border-n-4 bg-n-1 px-3 py-2 text-co-than text-n-10 focus:border-nhan focus:outline-none" />
      </div>
      <div>
        <label htmlFor="specs" className="mb-1.5 block text-co-nho text-n-9">
          Thông số (JSON) — bộ kiểm tra tương thích đọc trực tiếp các trường này
        </label>
        <textarea
          id="specs"
          name="specs"
          rows={14}
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
          spellCheck={false}
          aria-invalid={!!loi.specs}
          className="so w-full rounded-md border border-n-4 bg-n-0 px-3 py-2 text-co-phu leading-relaxed text-n-10 focus:border-nhan focus:outline-none aria-[invalid=true]:border-loi"
        />
        <LoiTruong loi={loi.specs} />
      </div>
      {tt?.loi && <p role="alert" className="text-co-nho text-loi">{tt.loi}</p>}
      <div className="flex gap-2">
        <button disabled={dang} className={lopNut("chinh")}>
          {dang ? "Đang lưu…" : dau.id ? "Lưu thay đổi" : "Thêm sản phẩm"}
        </button>
        <Link href="/quan-tri/san-pham" className={lopNut("nhat")}>
          Hủy
        </Link>
      </div>
    </form>
  );
}
