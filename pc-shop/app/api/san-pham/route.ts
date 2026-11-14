import { layTatCaSanPham } from "@/lib/db";

// Danh mục nhỏ (~36 món) nên trả về toàn bộ cho giỏ hàng và Build PC kiểm tra ở trình duyệt.
export function GET() {
  return Response.json(layTatCaSanPham());
}
