import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { layNguoiDung } from "@/lib/auth";
import { KhoProvider } from "@/components/kho-trinh-duyet";
import { ThanhTren } from "@/components/thanh-tren";
import { ChanTrang } from "@/components/chan-trang";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: { default: "APEX · Linh kiện PC, kiểm tra tương thích", template: "%s · APEX" },
  description: "Cửa hàng linh kiện PC có kiểm tra tương thích cho từng cấu hình.",
};

export const viewport: Viewport = { themeColor: "#0b0d11", colorScheme: "dark" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const nguoiDung = await layNguoiDung();
  return (
    <html lang="vi" className={`${beVietnam.variable} ${jetbrains.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col text-co-doc leading-relaxed">
        <KhoProvider daDangNhap={!!nguoiDung}>
          <ThanhTren nguoiDung={nguoiDung ? { hoTen: nguoiDung.hoTen, laAdmin: nguoiDung.laAdmin } : null} />
          <main className="flex-1">{children}</main>
          <ChanTrang />
        </KhoProvider>
      </body>
    </html>
  );
}
