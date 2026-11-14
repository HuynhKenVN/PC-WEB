"use client";

import { useTransition } from "react";

/**
 * Gửi form qua hàm dispatch của useActionState mà không để React tự xóa các ô sau khi gửi
 * (React 19 reset form khi dùng prop `action`, làm mất dữ liệu người dùng khi máy chủ báo lỗi).
 */
export function useGuiForm(dispatch: (fd: FormData) => void) {
  const [, batDau] = useTransition();
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    batDau(() => dispatch(fd));
  };
}
