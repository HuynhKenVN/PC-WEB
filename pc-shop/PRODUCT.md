# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Hai nhóm ngang nhau: người lắp máy lần đầu (chưa rành socket, chipset, cần lời giải thích và cách sửa) và người đã rành phần cứng (muốn xem nhanh thông số, lọc, so sánh). Thông điệp ngắn trước, giải thích mở rộng khi cần.

## Product Purpose
APEX là website bán linh kiện PC chạy trên máy (localhost), đồ án học tập. Đủ chức năng cửa hàng cơ bản (danh mục, lọc, tìm kiếm, chi tiết, so sánh, đánh giá, giỏ, thanh toán mô phỏng, đơn hàng, quản trị). Thành công: người mua biết chắc bộ linh kiện của mình lắp được trước khi đặt.

## Positioning
Kiểm tra tương thích ở mọi nơi: Build PC, giỏ hàng và lúc đặt hàng dùng chung một bộ quy tắc (socket, chipset, BIOS, RAM, tản, case, nguồn, khe lưu trữ, xuất hình, nghẽn cổ chai), mỗi cảnh báo nói rõ sai ở đâu và cách sửa.

## Operating Context
Chạy trên máy bằng `npm run dev`, mở bằng trình duyệt. Dữ liệu SQLite cục bộ, 36 linh kiện mẫu, tài khoản thử trong `.env.example`.

## Capabilities and Constraints
- Next.js App Router + TypeScript + Tailwind v4, SQLite qua `node:sqlite`.
- Toàn bộ giao diện tiếng Việt có dấu.
- Ba mức trạng thái dùng nhất quán: lỗi (không lắp được), cảnh báo (lắp được nhưng có vấn đề), đạt; thêm gợi ý (thiếu linh kiện).
- Nghẽn cổ chai là ước lượng từ điểm tương đối, phải ghi rõ không phải số đo thật.
- Ngoài phạm vi: thanh toán thật, email, triển khai lên mạng.

## Brand Commitments
- Tên: APEX.
- Người dùng chọn: giao diện tối, kỹ thuật, gọn; số liệu thông số dùng font đơn cách.
- Người dùng chọn hướng "chuẩn của ngành" (14/11/2026): bố cục và thói quen của cửa hàng linh kiện Việt Nam quen thuộc; mức hoàn thiện tham chiếu GearVN, Nguyễn Công PC. Màu nhấn xanh dương (đỏ dành cho trạng thái lỗi).

## Evidence on Hand
Không có ảnh sản phẩm thật: dùng hình minh họa SVG tự vẽ theo loại linh kiện. Không có khách hàng, đánh giá, số liệu bán hàng thật; đánh giá mẫu chỉ là dữ liệu seed.

## Product Principles
- Đúng trước, đẹp sau: không bao giờ để người dùng tưởng một bộ máy lắp được khi nó không lắp được.
- Mỗi lỗi kèm cách sửa cụ thể.
- Thông số là nội dung chính, không phải chú thích.
- Gọn, quét nhanh được; chuyển động ít và có mục đích.
