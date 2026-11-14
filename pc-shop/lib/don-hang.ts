import "server-only";
import { db } from "./db";
import type { LoaiLinhKien } from "./tuong-thich/types";

export type TrangThaiDon = "cho-xac-nhan" | "dang-giao" | "da-giao" | "da-huy";
export const TEN_TRANG_THAI: Record<TrangThaiDon, string> = {
  "cho-xac-nhan": "Chờ xác nhận",
  "dang-giao": "Đang giao",
  "da-giao": "Đã giao",
  "da-huy": "Đã hủy",
};

export interface Don {
  id: number;
  userId: number;
  email: string;
  trangThai: TrangThaiDon;
  thanhToan: "cod" | "chuyen-khoan";
  daThanhToan: boolean;
  hoTen: string;
  soDienThoai: string;
  diaChi: string;
  ghiChu: string;
  tongTien: number;
  soLoi: number;
  taoLuc: string;
  items: { productId: number | null; slug: string | null; ten: string; loai: LoaiLinhKien; gia: number; soLuong: number }[];
}

type DongDon = {
  id: number;
  user_id: number;
  email: string;
  trang_thai: TrangThaiDon;
  thanh_toan: "cod" | "chuyen-khoan";
  da_thanh_toan: number;
  ho_ten: string;
  so_dien_thoai: string;
  dia_chi: string;
  ghi_chu: string;
  tong_tien: number;
  so_loi: number;
  tao_luc: string;
};

function napItems(ids: number[]) {
  const ra = new Map<number, Don["items"]>();
  if (!ids.length) return ra;
  const rows = db
    .prepare(
      `SELECT oi.order_id, oi.product_id, p.slug, oi.ten, oi.loai, oi.gia, oi.so_luong
       FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id IN (${ids.map(() => "?").join(",")})`,
    )
    .all(...ids) as { order_id: number; product_id: number | null; slug: string | null; ten: string; loai: LoaiLinhKien; gia: number; so_luong: number }[];
  for (const r of rows) {
    if (!ra.has(r.order_id)) ra.set(r.order_id, []);
    ra.get(r.order_id)!.push({ productId: r.product_id, slug: r.slug, ten: r.ten, loai: r.loai, gia: r.gia, soLuong: r.so_luong });
  }
  return ra;
}

const chuyen = (d: DongDon, items: Don["items"]): Don => ({
  id: d.id,
  userId: d.user_id,
  email: d.email,
  trangThai: d.trang_thai,
  thanhToan: d.thanh_toan,
  daThanhToan: d.da_thanh_toan === 1,
  hoTen: d.ho_ten,
  soDienThoai: d.so_dien_thoai,
  diaChi: d.dia_chi,
  ghiChu: d.ghi_chu,
  tongTien: d.tong_tien,
  soLoi: d.so_loi,
  taoLuc: d.tao_luc,
  items,
});

const CHON = "SELECT o.*, u.email FROM orders o JOIN users u ON u.id = o.user_id";

export function danhSachDon(dk: { userId?: number; trangThai?: TrangThaiDon } = {}): Don[] {
  const where: string[] = [];
  const ts: (string | number)[] = [];
  if (dk.userId) {
    where.push("o.user_id = ?");
    ts.push(dk.userId);
  }
  if (dk.trangThai) {
    where.push("o.trang_thai = ?");
    ts.push(dk.trangThai);
  }
  const ds = db.prepare(`${CHON} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY o.id DESC`).all(...ts) as DongDon[];
  const items = napItems(ds.map((d) => d.id));
  return ds.map((d) => chuyen(d, items.get(d.id) ?? []));
}

export function layDon(id: number): Don | null {
  const d = db.prepare(`${CHON} WHERE o.id = ?`).get(id) as DongDon | undefined;
  return d ? chuyen(d, napItems([id]).get(id) ?? []) : null;
}

export const ngayGio = (s: string) =>
  new Date(s.replace(" ", "T") + "Z").toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });
