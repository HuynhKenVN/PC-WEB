import { db } from "@/lib/db";
import { layNguoiDung } from "@/lib/auth";
import { docDuLieuLuu, luuCauHinh } from "@/lib/cau-hinh";

export async function PUT(req: Request, ctx: RouteContext<"/api/cau-hinh/[id]">) {
  const u = await layNguoiDung();
  if (!u) return Response.json({ loi: "Đăng nhập để lưu cấu hình." }, { status: 401 });
  const id = Number((await ctx.params).id);
  const du = docDuLieuLuu(await req.json().catch(() => null));
  if (typeof du === "string") return Response.json({ loi: du }, { status: 400 });
  const ra = luuCauHinh(u.id, id, du);
  if (!ra) return Response.json({ loi: "Không tìm thấy cấu hình của bạn." }, { status: 404 });
  return Response.json({ id: ra });
}

export async function DELETE(_: Request, ctx: RouteContext<"/api/cau-hinh/[id]">) {
  const u = await layNguoiDung();
  if (!u) return Response.json({ loi: "Chưa đăng nhập" }, { status: 401 });
  const id = Number((await ctx.params).id);
  const r = db.prepare("DELETE FROM builds WHERE id = ? AND user_id = ?").run(id, u.id);
  if (r.changes !== 1) return Response.json({ loi: "Không tìm thấy cấu hình của bạn." }, { status: 404 });
  return Response.json({ ok: true });
}
