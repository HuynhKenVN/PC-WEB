import Link from "next/link";

export function ChanTrang() {
  return (
    <footer className="mt-20 border-t border-n-4">
      <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-8 text-co-nho text-n-8 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-semibold tracking-[0.12em] text-n-9">APEX</p>
          <p className="mt-2 max-w-xs">Đồ án học tập chạy trên máy. Giá tham khảo, thanh toán chỉ là mô phỏng.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Link href="/build-pc" className="hover:text-n-10">Build PC</Link>
          <Link href="/so-sanh" className="hover:text-n-10">So sánh linh kiện</Link>
          <Link href="/cau-hinh" className="hover:text-n-10">Cấu hình đã lưu</Link>
        </div>
        <p className="max-w-xs text-pretty sm:justify-self-end sm:text-right">
          Điểm hiệu năng và nghẽn cổ chai là ước lượng từ điểm tương đối, không phải số đo FPS thực tế.
        </p>
      </div>
    </footer>
  );
}
