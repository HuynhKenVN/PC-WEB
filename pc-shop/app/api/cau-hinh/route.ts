import { layNguoiDung } from "@/lib/auth";
import { docDuLieuLuu, luuCauHinh } from "@/lib/cau-hinh";

export async function POST(req: Request) {
  const u = await layNguoiDung();
  if (!u) return Response.json({ loi: "Đăng nhập để lưu cấu hình." }, { status: 401 });
  const du = docDuLieuLuu(await req.json().catch(() => null));
  if (typeof du === "string") return Response.json({ loi: du }, { status: 400 });
  const id = luuCauHinh(u.id, null, du);
  return Response.json({ id });
}
