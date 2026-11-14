import "server-only";
import { db, laySanPhamTheoIds, type SanPhamDayDu } from "./db";
import { demMucDo, kiemTra, type DoPhanGiai } from "./tuong-thich";

export interface CauHinh {
  id: number;
  userId: number;
  tacGia: string;
  ten: string;
  doPhanGiai: DoPhanGiai;
  soLoi: number;
  soCanhBao: number;
  taoLuc: string;
  suaLuc: string;
  items: { sanPham: SanPhamDayDu; soLuong: number }[];
  tongTien: number;
}

type DongBuild = {
  id: number;
  user_id: number;
  ho_ten: string;
  ten: string;
  do_phan_giai: DoPhanGiai;
  so_loi: number;
  so_canh_bao: number;
  tao_luc: string;
  sua_luc: string;
};

function napItems(buildIds: number[]) {
  if (!buildIds.length) return new Map<number, { sanPham: SanPhamDayDu; soLuong: number }[]>();
  const rows = db
    .prepare(`SELECT build_id, product_id, so_luong FROM build_items WHERE build_id IN (${buildIds.map(() => "?").join(",")})`)
    .all(...buildIds) as { build_id: number; product_id: number; so_luong: number }[];
  const sps = new Map(laySanPhamTheoIds([...new Set(rows.map((r) => r.product_id))]).map((s) => [s.id, s]));
  const ra = new Map<number, { sanPham: SanPhamDayDu; soLuong: number }[]>();
  for (const r of rows) {
    const sp = sps.get(r.product_id);
    if (!sp) continue;
    if (!ra.has(r.build_id)) ra.set(r.build_id, []);
    ra.get(r.build_id)!.push({ sanPham: sp, soLuong: r.so_luong });
  }
  return ra;
}

function chuyen(d: DongBuild, items: { sanPham: SanPhamDayDu; soLuong: number }[]): CauHinh {
  return {
    id: d.id,
    userId: d.user_id,
    tacGia: d.ho_ten,
    ten: d.ten,
    doPhanGiai: d.do_phan_giai,
    soLoi: d.so_loi,
    soCanhBao: d.so_canh_bao,
    taoLuc: d.tao_luc,
    suaLuc: d.sua_luc,
    items,
    tongTien: items.reduce((t, i) => t + i.sanPham.gia * i.soLuong, 0),
  };
}

const CHON = "SELECT b.*, u.ho_ten FROM builds b JOIN users u ON u.id = b.user_id";

export function layCauHinh(id: number): CauHinh | null {
  const d = db.prepare(`${CHON} WHERE b.id = ?`).get(id) as DongBuild | undefined;
  if (!d) return null;
  return chuyen(d, napItems([id]).get(id) ?? []);
}

export function danhSachCauHinh(userId: number): CauHinh[] {
  const ds = db.prepare(`${CHON} WHERE b.user_id = ? ORDER BY b.sua_luc DESC, b.id DESC`).all(userId) as DongBuild[];
  const items = napItems(ds.map((d) => d.id));
  return ds.map((d) => chuyen(d, items.get(d.id) ?? []));
}

export interface DuLieuLuu {
  ten: string;
  doPhanGiai: DoPhanGiai;
  items: { id: number; soLuong: number }[];
}

/** Đọc và làm sạch dữ liệu cấu hình gửi lên. Trả về chuỗi lỗi nếu không hợp lệ. */
export function docDuLieuLuu(body: unknown): DuLieuLuu | string {
  if (!body || typeof body !== "object") return "Dữ liệu không hợp lệ.";
  const b = body as Record<string, unknown>;
  const ten = typeof b.ten === "string" ? b.ten.trim().slice(0, 80) : "";
  if (ten.length < 1) return "Đặt tên cho cấu hình.";
  const doPhanGiai = (["1080p", "1440p", "4K"] as const).find((x) => x === b.doPhanGiai) ?? "1080p";
  if (!Array.isArray(b.items)) return "Cấu hình chưa có linh kiện.";
  const items = (b.items as unknown[])
    .map((i) => i as { id?: unknown; soLuong?: unknown })
    .filter((i) => Number.isInteger(i.id) && Number.isInteger(i.soLuong) && (i.soLuong as number) > 0 && (i.soLuong as number) <= 8)
    .map((i) => ({ id: i.id as number, soLuong: i.soLuong as number }));
  if (items.length === 0) return "Cấu hình chưa có linh kiện.";
  return { ten, doPhanGiai, items };
}

/** Tạo mới (id = null) hoặc ghi đè cấu hình; máy chủ tự kiểm tra lại tương thích. */
export function luuCauHinh(userId: number, id: number | null, du: DuLieuLuu): number | null {
  const sps = new Map(laySanPhamTheoIds(du.items.map((i) => i.id)).map((s) => [s.id, s]));
  const hopLe = du.items.filter((i) => sps.has(i.id));
  const dem = demMucDo(kiemTra(hopLe.map((i) => ({ sanPham: sps.get(i.id)!, soLuong: i.soLuong })), { doPhanGiai: du.doPhanGiai }));

  db.exec("BEGIN");
  try {
    let buildId: number;
    if (id) {
      const r = db
        .prepare("UPDATE builds SET ten = ?, do_phan_giai = ?, so_loi = ?, so_canh_bao = ?, sua_luc = datetime('now') WHERE id = ? AND user_id = ?")
        .run(du.ten, du.doPhanGiai, dem.loi, dem.canhBao, id, userId);
      if (r.changes !== 1) {
        db.exec("ROLLBACK");
        return null;
      }
      buildId = id;
      db.prepare("DELETE FROM build_items WHERE build_id = ?").run(id);
    } else {
      const r = db
        .prepare("INSERT INTO builds (user_id, ten, do_phan_giai, so_loi, so_canh_bao) VALUES (?, ?, ?, ?, ?)")
        .run(userId, du.ten, du.doPhanGiai, dem.loi, dem.canhBao);
      buildId = Number(r.lastInsertRowid);
    }
    const them = db.prepare("INSERT INTO build_items (build_id, product_id, so_luong) VALUES (?, ?, ?)");
    for (const i of hopLe) them.run(buildId, i.id, i.soLuong);
    db.exec("COMMIT");
    return buildId;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
