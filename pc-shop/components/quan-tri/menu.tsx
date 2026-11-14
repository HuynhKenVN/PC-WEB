"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Receipt } from "lucide-react";

const MUC = [
  ["/quan-tri", "Tổng quan", LayoutDashboard],
  ["/quan-tri/san-pham", "Sản phẩm", Package],
  ["/quan-tri/don-hang", "Đơn hàng", Receipt],
] as const;

export function MenuQuanTri() {
  const p = usePathname();
  return (
    <nav aria-label="Quản trị" className="lg:w-52 lg:shrink-0">
      <p className="nhan-cot mb-2 hidden px-3 lg:block">Quản trị</p>
      <ul className="flex gap-1 overflow-x-auto lg:flex-col">
        {MUC.map(([href, nhan, I]) => {
          const dang = href === "/quan-tri" ? p === href : p.startsWith(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={dang ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-co-than transition-colors ${dang ? "bg-n-3 text-n-10" : "text-n-8 hover:bg-n-2 hover:text-n-10"}`}
              >
                <I className="size-4" aria-hidden /> {nhan}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
