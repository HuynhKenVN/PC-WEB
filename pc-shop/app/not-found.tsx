import Link from "next/link";
import { KhungTrang, TrangTrong, lopNut } from "@/components/ui";

export default function KhongTimThay() {
  return (
    <KhungTrang hep>
      <div className="py-16">
        <TrangTrong
          tieuDe="Không tìm thấy trang"
          moTa="Đường dẫn có thể đã đổi, hoặc sản phẩm / đơn hàng / cấu hình này không còn."
          hanhDong={<Link href="/" className={lopNut("chinh")}>Về trang chủ</Link>}
        />
      </div>
    </KhungTrang>
  );
}
