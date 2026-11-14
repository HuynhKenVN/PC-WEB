import { db } from "@/lib/db";
import { layNguoiDung } from "@/lib/auth";

type Dong = { id: number; soLuong: number };

export async function GET() {
  const u = await layNguoiDung();
  if (!u) return Response.json({ loi: "Chưa đăng nhập" }, { status: 401 });
  const rows = db.prepare("SELECT product_id AS id, so_luong AS soLuong FROM cart_items WHERE user_id = ?").all(u.id) as Dong[];
  return Response.json(rows.map((r) => ({ id: r.id, soLuong: r.soLuong })));
}

/** Ghi đè toàn bộ giỏ trên máy chủ bằng giỏ của trình duyệt (đã gộp ở trình duyệt). */
export async function PUT(req: Request) {
  const u = await layNguoiDung();
  if (!u) return Response.json({ loi: "Chưa đăng nhập" }, { status: 401 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ loi: "JSON không hợp lệ" }, { status: 400 });
  }
  if (!Array.isArray(body)) return Response.json({ loi: "Cần một mảng" }, { status: 400 });
  const dong = (body as Dong[]).filter((d) => Number.isInteger(d?.id) && Number.isInteger(d?.soLuong) && d.soLuong > 0 && d.soLuong <= 99);
  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(u.id);
    const them = db.prepare("INSERT OR IGNORE INTO cart_items (user_id, product_id, so_luong) SELECT ?, id, ? FROM products WHERE id = ?");
    for (const d of dong) them.run(u.id, d.soLuong, d.id);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  return Response.json({ ok: true });
}
