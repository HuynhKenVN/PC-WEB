"use client";

import { lopNut } from "../ui";

/** Nút xóa có hỏi xác nhận trước khi gửi form. */
export function NutXoa({ id, ten, hanhDong }: { id: number; ten: string; hanhDong: (fd: FormData) => Promise<void> }) {
  return (
    <form
      action={hanhDong}
      onSubmit={(e) => {
        if (!confirm(`Xóa “${ten}”? Sản phẩm sẽ biến mất khỏi cửa hàng, giỏ hàng và các cấu hình đã lưu. Đơn hàng cũ vẫn giữ tên và giá.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className={lopNut("nguy-hiem", "nho")}>Xóa</button>
    </form>
  );
}
