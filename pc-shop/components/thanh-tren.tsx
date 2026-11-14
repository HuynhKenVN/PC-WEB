"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Cpu, LogOut, Search, ShoppingCart, User, Wrench } from "lucide-react";
import { useKho } from "./kho-trinh-duyet";
import { dangXuat } from "@/lib/actions/tai-khoan";
import { THU_TU_LOAI, TEN_LOAI } from "@/lib/tuong-thich";

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 28 22" className="h-[22px] w-7" aria-hidden="true">
        <rect x="0.75" y="0.75" width="26.5" height="20.5" rx="3" fill="none" stroke="var(--color-n-6)" strokeWidth="1.5" />
        <path d="M7 16 L14 5 L21 16" fill="none" stroke="var(--color-nhan-sang)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        <line x1="10.5" y1="12.5" x2="17.5" y2="12.5" stroke="var(--color-nhan-sang)" strokeWidth="1.6" />
      </svg>
      <span className="text-co-muc font-bold tracking-[0.12em] text-n-10">APEX</span>
    </span>
  );
}

function OTimKiem() {
  const sp = useSearchParams();
  const pathname = usePathname();
  const q = pathname === "/tim-kiem" ? (sp.get("q") ?? "") : "";
  return (
    <form action="/tim-kiem" role="search" className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-n-7" aria-hidden />
      <input
        key={q}
        name="q"
        defaultValue={q}
        placeholder="Tìm linh kiện: 7800X3D, B650, 850W…"
        aria-label="Tìm linh kiện"
        className="h-10 w-full rounded-md border border-n-4 bg-n-1 pl-9 pr-3 text-co-than text-n-10 placeholder:text-n-7 transition-colors hover:border-n-5 focus:border-nhan focus:outline-none"
      />
    </form>
  );
}

function MenuTaiKhoan({ nguoiDung }: { nguoiDung: { hoTen: string; laAdmin: boolean } }) {
  const [mo, setMo] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đóng menu khi chuyển trang
    setMo(false);
  }, [pathname]);
  useEffect(() => {
    if (!mo) return;
    const dong = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setMo(false);
    };
    document.addEventListener("mousedown", dong);
    document.addEventListener("keydown", dong);
    return () => {
      document.removeEventListener("mousedown", dong);
      document.removeEventListener("keydown", dong);
    };
  }, [mo]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setMo((m) => !m)}
        aria-expanded={mo}
        aria-haspopup="menu"
        aria-label={`Tài khoản: ${nguoiDung.hoTen}`}
        className="flex h-10 items-center gap-2 rounded-md px-2.5 text-co-than text-n-9 transition-colors hover:bg-n-2 hover:text-n-10 active:scale-[0.97]"
      >
        <User className="size-[18px]" aria-hidden />
        <span className="hidden max-w-32 truncate sm:inline">{nguoiDung.hoTen}</span>
      </button>
      {mo && (
        <div role="menu" className="tem absolute right-0 top-[calc(100%+6px)] z-50 w-56 origin-top-right animate-hien p-1.5 shadow-[0_12px_32px_-8px_rgb(0_0_0/0.6)]">
          <p className="truncate px-2.5 pb-2 pt-1 text-co-nho text-n-8">{nguoiDung.hoTen}</p>
          {[
            ["/tai-khoan", "Tài khoản"],
            ["/don-hang", "Đơn hàng của tôi"],
            ["/cau-hinh", "Cấu hình đã lưu"],
            ...(nguoiDung.laAdmin ? [["/quan-tri", "Trang quản trị"]] : []),
          ].map(([href, nhan]) => (
            <Link key={href} href={href} role="menuitem" className="block rounded px-2.5 py-1.5 text-co-than text-n-9 hover:bg-n-3 hover:text-n-10">
              {nhan}
            </Link>
          ))}
          <form action={dangXuat} className="mt-1 border-t border-n-4 pt-1">
            <button role="menuitem" className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-co-than text-n-9 hover:bg-n-3 hover:text-n-10">
              <LogOut className="size-4" aria-hidden /> Đăng xuất
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function NutGio() {
  const { soMon, nhipThem } = useKho();
  return (
    <Link
      href="/gio-hang"
      aria-label={`Giỏ hàng, ${soMon} sản phẩm`}
      className="relative flex h-10 items-center gap-2 rounded-md px-2.5 text-co-than text-n-9 transition-colors hover:bg-n-2 hover:text-n-10 active:scale-[0.97]"
    >
      <ShoppingCart className="size-[18px]" aria-hidden />
      <span className="hidden sm:inline">Giỏ hàng</span>
      {soMon > 0 && (
        <span key={nhipThem} className="so absolute -right-0.5 top-0.5 flex h-[18px] min-w-[18px] animate-nay items-center justify-center rounded-full bg-nhan px-1 text-co-nhan font-bold text-white sm:static sm:animate-nay">
          {soMon}
        </span>
      )}
    </Link>
  );
}

export function ThanhTren({ nguoiDung }: { nguoiDung: { hoTen: string; laAdmin: boolean } | null }) {
  const pathname = usePathname();
  const tiep = pathname.startsWith("/dang-") ? "/" : pathname;
  return (
    <header className="sticky top-0 z-40 border-b border-n-4 bg-n-0/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 sm:gap-5 sm:px-6">
        <Link href="/" aria-label="APEX, trang chủ" className="shrink-0">
          <Logo />
        </Link>
        <div className="hidden flex-1 md:block md:max-w-md">
          <Suspense>
            <OTimKiem />
          </Suspense>
        </div>
        <nav className="ml-auto flex items-center gap-1" aria-label="Tài khoản và giỏ hàng">
          <Link
            href="/build-pc"
            className={`flex h-10 items-center gap-2 rounded-md px-3 text-co-than font-semibold transition-[background-color,transform] active:scale-[0.97] ${
              pathname.startsWith("/build-pc") ? "bg-nhan-dam text-white" : "bg-nhan text-white hover:bg-nhan-dam"
            }`}
          >
            <Wrench className="size-4" aria-hidden /> Build PC
          </Link>
          <NutGio />
          {nguoiDung ? (
            <MenuTaiKhoan nguoiDung={nguoiDung} />
          ) : (
            <Link
              href={`/dang-nhap?tiep=${encodeURIComponent(tiep)}`}
              aria-label="Đăng nhập"
              className="flex h-10 items-center gap-2 rounded-md px-2.5 text-co-than text-n-9 transition-colors hover:bg-n-2 hover:text-n-10"
            >
              <User className="size-[18px]" aria-hidden />
              <span className="hidden sm:inline">Đăng nhập</span>
            </Link>
          )}
        </nav>
      </div>
      <div className="mx-auto max-w-[1280px] px-4 pb-3 md:hidden">
        <Suspense>
          <OTimKiem />
        </Suspense>
      </div>
      <nav aria-label="Danh mục" className="border-t border-n-3">
        <ul className="mx-auto flex max-w-[1280px] gap-1 overflow-x-auto px-4 sm:px-6 [scrollbar-width:none]">
          {THU_TU_LOAI.map((loai) => {
            const dang = pathname === `/danh-muc/${loai}`;
            return (
              <li key={loai} className="shrink-0">
                <Link
                  href={`/danh-muc/${loai}`}
                  aria-current={dang ? "page" : undefined}
                  className={`relative flex h-10 items-center px-3 text-co-nho transition-colors ${
                    dang ? "text-n-10 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-nhan" : "text-n-8 hover:text-n-10"
                  }`}
                >
                  {TEN_LOAI[loai]}
                </Link>
              </li>
            );
          })}
          <li className="ml-auto hidden shrink-0 lg:block">
            <Link href="/so-sanh" className="flex h-10 items-center gap-1.5 px-3 text-co-nho text-n-8 hover:text-n-10">
              <Cpu className="size-4" aria-hidden /> So sánh
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
