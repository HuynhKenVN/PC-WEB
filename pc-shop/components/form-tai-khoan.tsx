"use client";

import { useGuiForm } from "./gui-form";
import Link from "next/link";
import { useActionState } from "react";
import { capNhatThongTin, dangKy, dangNhap } from "@/lib/actions/tai-khoan";
import { LOP_O_NHAP, LoiTruong, lopNut } from "./ui";

function Truong({ nhan, ten, loi, ...props }: { nhan: string; ten: string; loi?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={ten} className="mb-1.5 block text-co-nho text-n-9">
        {nhan}
      </label>
      <input id={ten} name={ten} aria-invalid={!!loi} aria-describedby={loi ? `${ten}-loi` : undefined} className={LOP_O_NHAP} {...props} />
      <span id={`${ten}-loi`}>
        <LoiTruong loi={loi} />
      </span>
    </div>
  );
}

export function DangNhapForm({ tiep }: { tiep: string }) {
  const [tt, hanhDong, dang] = useActionState(dangNhap, null);
  const gui = useGuiForm(hanhDong);
  return (
    <form onSubmit={gui} className="flex flex-col gap-4">
      <input type="hidden" name="tiep" value={tiep} />
      <Truong nhan="Email" ten="email" type="email" autoComplete="email" required autoFocus />
      <Truong nhan="Mật khẩu" ten="matKhau" type="password" autoComplete="current-password" required />
      {tt?.loi && <p role="alert" className="text-co-nho text-loi">{tt.loi}</p>}
      <button disabled={dang} className={lopNut("chinh")}>
        {dang ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
      <p className="text-center text-co-nho text-n-8">
        Chưa có tài khoản?{" "}
        <Link href={`/dang-ky?tiep=${encodeURIComponent(tiep)}`} className="text-nhan-sang hover:underline">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}

export function DangKyForm({ tiep }: { tiep: string }) {
  const [tt, hanhDong, dang] = useActionState(dangKy, null);
  const gui = useGuiForm(hanhDong);
  return (
    <form onSubmit={gui} className="flex flex-col gap-4">
      <input type="hidden" name="tiep" value={tiep} />
      <Truong nhan="Họ tên" ten="hoTen" autoComplete="name" required autoFocus loi={tt?.truongLoi?.hoTen} />
      <Truong nhan="Email" ten="email" type="email" autoComplete="email" required loi={tt?.truongLoi?.email} />
      <Truong nhan="Mật khẩu (ít nhất 8 ký tự)" ten="matKhau" type="password" autoComplete="new-password" required minLength={8} loi={tt?.truongLoi?.matKhau} />
      {tt?.loi && <p role="alert" className="text-co-nho text-loi">{tt.loi}</p>}
      <button disabled={dang} className={lopNut("chinh")}>
        {dang ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
      </button>
      <p className="text-center text-co-nho text-n-8">
        Đã có tài khoản?{" "}
        <Link href={`/dang-nhap?tiep=${encodeURIComponent(tiep)}`} className="text-nhan-sang hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}

export function ThongTinForm({ hoTen, soDienThoai, diaChi }: { hoTen: string; soDienThoai: string; diaChi: string }) {
  const [tt, hanhDong, dang] = useActionState(capNhatThongTin, null);
  const gui = useGuiForm(hanhDong);
  return (
    <form onSubmit={gui} className="flex flex-col gap-4">
      <Truong nhan="Họ tên" ten="hoTen" defaultValue={hoTen} autoComplete="name" loi={tt?.truongLoi?.hoTen} />
      <Truong nhan="Số điện thoại" ten="soDienThoai" defaultValue={soDienThoai} type="tel" inputMode="tel" autoComplete="tel" loi={tt?.truongLoi?.soDienThoai} />
      <Truong nhan="Địa chỉ giao hàng mặc định" ten="diaChi" defaultValue={diaChi} autoComplete="street-address" />
      {tt?.ok && <p className="text-co-nho text-dat">{tt.ok}</p>}
      <button disabled={dang} className={`${lopNut("chinh")} self-start`}>
        {dang ? "Đang lưu…" : "Lưu thông tin"}
      </button>
    </form>
  );
}
