import "server-only";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { napDuLieuMau } from "./seed";
import type { LoaiLinhKien, SanPham } from "./tuong-thich/types";

const THU_MUC = path.join(process.cwd(), "du-lieu");
const FILE_DB = path.join(THU_MUC, "pc-shop.db");

function moDb(): DatabaseSync {
  mkdirSync(THU_MUC, { recursive: true });
  const db = new DatabaseSync(FILE_DB);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 3000;");
  db.exec(readFileSync(path.join(process.cwd(), "lib", "schema.sql"), "utf8"));
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number };
  if (n === 0) napDuLieuMau(db);
  return db;
}

// Giữ một kết nối duy nhất qua các lần hot reload khi dev
const g = globalThis as unknown as { __pcShopDb?: DatabaseSync };
export const db: DatabaseSync = g.__pcShopDb ?? (g.__pcShopDb = moDb());

// ───── Sản phẩm ─────

export type SanPhamDayDu = SanPham & {
  giaGoc: number | null;
  tonKho: number;
  moTa: string;
  diemTb: number | null;
  soDanhGia: number;
};

type DongSanPham = {
  id: number;
  slug: string;
  ten: string;
  hang: string;
  loai: LoaiLinhKien;
  gia: number;
  gia_goc: number | null;
  ton_kho: number;
  mo_ta: string;
  specs: string;
  diem_tb: number | null;
  so_danh_gia: number;
};

const CHON_SAN_PHAM = `
  SELECT p.*, (SELECT AVG(so_sao) FROM reviews r WHERE r.product_id = p.id) AS diem_tb,
         (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id) AS so_danh_gia
  FROM products p`;

export function chuyenSanPham(d: DongSanPham): SanPhamDayDu {
  return {
    id: d.id,
    slug: d.slug,
    ten: d.ten,
    hang: d.hang,
    loai: d.loai,
    gia: d.gia,
    giaGoc: d.gia_goc,
    tonKho: d.ton_kho,
    moTa: d.mo_ta,
    specs: JSON.parse(d.specs),
    diemTb: d.diem_tb,
    soDanhGia: d.so_danh_gia,
  } as SanPhamDayDu;
}

export function laySanPhamTheoSlug(slug: string): SanPhamDayDu | null {
  const d = db.prepare(`${CHON_SAN_PHAM} WHERE p.slug = ?`).get(slug) as DongSanPham | undefined;
  return d ? chuyenSanPham(d) : null;
}

export function laySanPhamTheoId(id: number): SanPhamDayDu | null {
  const d = db.prepare(`${CHON_SAN_PHAM} WHERE p.id = ?`).get(id) as DongSanPham | undefined;
  return d ? chuyenSanPham(d) : null;
}

export function layTatCaSanPham(): SanPhamDayDu[] {
  return (db.prepare(`${CHON_SAN_PHAM} ORDER BY p.id`).all() as DongSanPham[]).map(chuyenSanPham);
}

export function laySanPhamTheoIds(ids: number[]): SanPhamDayDu[] {
  if (ids.length === 0) return [];
  const dauHoi = ids.map(() => "?").join(",");
  return (db.prepare(`${CHON_SAN_PHAM} WHERE p.id IN (${dauHoi})`).all(...ids) as DongSanPham[]).map(chuyenSanPham);
}

export function layNhieuSanPham(dk: { loai?: LoaiLinhKien; tuKhoa?: string } = {}): SanPhamDayDu[] {
  const where: string[] = [];
  const thamSo: string[] = [];
  if (dk.loai) {
    where.push("p.loai = ?");
    thamSo.push(dk.loai);
  }
  if (dk.tuKhoa) {
    // So khớp từng từ, không phân biệt hoa thường
    for (const tu of dk.tuKhoa.trim().split(/\s+/).filter(Boolean)) {
      where.push("(p.ten LIKE ? OR p.hang LIKE ? OR p.mo_ta LIKE ?)");
      thamSo.push(`%${tu}%`, `%${tu}%`, `%${tu}%`);
    }
  }
  const sql = `${CHON_SAN_PHAM} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY p.id`;
  return (db.prepare(sql).all(...thamSo) as DongSanPham[]).map(chuyenSanPham);
}
