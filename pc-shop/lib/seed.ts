import type { DatabaseSync } from "node:sqlite";
import { SAN_PHAM_MAU } from "./du-lieu-mau";
import { bamMatKhau } from "./mat-khau";

// Tài khoản thử — cũng ghi trong .env.example
export const TAI_KHOAN_THU = {
  admin: { email: "admin@pcshop.local", matKhau: "Admin@123", hoTen: "Quản trị viên" },
  khach: { email: "khach@pcshop.local", matKhau: "Khach@123", hoTen: "Nguyễn Văn Khách" },
};

const DANH_GIA_MAU: { slug: string; soSao: number; noiDung: string }[] = [
  { slug: "intel-core-i5-13400f", soSao: 5, noiDung: "Chơi game 1080p mượt, tản kèm theo hơi ồn khi render nhưng chấp nhận được." },
  { slug: "msi-rtx-4060-ventus-2x-8g", soSao: 4, noiDung: "Mát, nhỏ gọn, vừa case mATX. 8 GB VRAM hơi ít cho game mới ở mức Ultra." },
  { slug: "amd-ryzen-7-7800x3d", soSao: 5, noiDung: "FPS tăng rõ trong game nặng CPU. Nhớ mua kèm tản vì hộp không có." },
  { slug: "deepcool-ak400", soSao: 5, noiDung: "Giá rẻ mà đè được i5, lắp dễ." },
  { slug: "jonsbo-c6", soSao: 3, noiDung: "Đẹp và rẻ nhưng card dài là không vừa, phải đo kỹ." },
];

export function napDuLieuMau(db: DatabaseSync) {
  db.exec("BEGIN");
  try {
    const themUser = db.prepare(
      "INSERT INTO users (email, ho_ten, mat_khau, la_admin, so_dien_thoai, dia_chi) VALUES (?, ?, ?, ?, ?, ?)",
    );
    themUser.run(TAI_KHOAN_THU.admin.email, TAI_KHOAN_THU.admin.hoTen, bamMatKhau(TAI_KHOAN_THU.admin.matKhau), 1, null, null);
    const khach = themUser.run(
      TAI_KHOAN_THU.khach.email,
      TAI_KHOAN_THU.khach.hoTen,
      bamMatKhau(TAI_KHOAN_THU.khach.matKhau),
      0,
      "0901234567",
      "227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM",
    );

    const themSp = db.prepare(
      "INSERT INTO products (slug, ten, hang, loai, gia, gia_goc, ton_kho, mo_ta, specs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );
    const idTheoSlug = new Map<string, number>();
    for (const sp of SAN_PHAM_MAU) {
      const r = themSp.run(sp.slug, sp.ten, sp.hang, sp.loai, sp.gia, sp.giaGoc ?? null, sp.tonKho, sp.moTa, JSON.stringify(sp.specs));
      idTheoSlug.set(sp.slug, Number(r.lastInsertRowid));
    }

    const themDg = db.prepare("INSERT INTO reviews (product_id, user_id, so_sao, noi_dung) VALUES (?, ?, ?, ?)");
    for (const dg of DANH_GIA_MAU) {
      themDg.run(idTheoSlug.get(dg.slug)!, Number(khach.lastInsertRowid), dg.soSao, dg.noiDung);
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
