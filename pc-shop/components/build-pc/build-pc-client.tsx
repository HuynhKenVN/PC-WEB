"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Minus, Plus, RotateCcw, Save, ShoppingCart, Trash2 } from "lucide-react";
import { useDanhMuc, useKho } from "../kho-trinh-duyet";
import { HinhLinhKien, bienCua } from "../hinh-linh-kien";
import { BangDinhMuc } from "../bang-dinh-muc";
import { BangKetQua, BieuTuongMucDo, MAU_MUC_DO, lopNut } from "../ui";
import { NganChon } from "./ngan-chon";
import { NHAP_TRONG, datVaoNhap, docNhap, ghiNhap, type NhapCauHinh } from "@/lib/nhap-cau-hinh";
import { demMucDo, kiemTra, THU_TU_LOAI, TEN_LOAI, uocTinhCongSuat, type DoPhanGiai, type KetQua, type LoaiLinhKien } from "@/lib/tuong-thich";
import { dinhDangTien, thongSoNoiBat } from "@/lib/thong-so";
import type { SanPhamDayDu } from "@/lib/db";

const BAT_BUOC: LoaiLinhKien[] = ["cpu", "mainboard", "ram", "o-cung", "nguon", "case"];
const GOI_Y_LOAI: Partial<Record<LoaiLinhKien, string>> = {
  cpu: "Bắt đầu từ đây: socket CPU quyết định các món còn lại",
  vga: "Có thể bỏ qua nếu CPU có đồ họa tích hợp",
  "tan-nhiet": "Có thể bỏ qua nếu CPU kèm tản",
};

function mucNangNhat(id: number, ketQua: KetQua[]) {
  const ds = ketQua.filter((k) => k.linhKienLienQuan.includes(id) && (k.mucDo === "loi" || k.mucDo === "canh-bao"));
  return ds.some((k) => k.mucDo === "loi") ? "loi" : ds.length ? "canh-bao" : null;
}

export function BuildPcClient({ daDangNhap, khoiTao }: { daDangNhap: boolean; khoiTao: NhapCauHinh | null }) {
  const danhMuc = useDanhMuc();
  const { themNhieu } = useKho();
  const router = useRouter();
  const [nhap, setNhap] = useState<NhapCauHinh>(NHAP_TRONG);
  const [daNap, setDaNap] = useState(false);
  const [ngan, setNgan] = useState<LoaiLinhKien | null>(null);
  const [thongBao, setThongBao] = useState<{ loai: "ok" | "loi"; noiDung: React.ReactNode } | null>(null);
  const [dangLuu, setDangLuu] = useState(false);

  useEffect(() => {
    // Nạp nháp; nếu mở từ cấu hình gợi ý / cấu hình đã lưu thì ghi đè nháp
    const n = khoiTao ?? docNhap();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage chỉ đọc được sau khi mount
    setNhap(n);
    setDaNap(true);
    if (khoiTao) {
      ghiNhap(khoiTao);
      router.replace("/build-pc", { scroll: false });
    }
  }, [khoiTao, router]);

  const capNhat = useCallback((f: (n: NhapCauHinh) => NhapCauHinh) => {
    setNhap((cu) => {
      const moi = f(cu);
      ghiNhap(moi);
      return moi;
    });
  }, []);

  const theoId = useMemo(() => new Map((danhMuc ?? []).map((s) => [s.id, s])), [danhMuc]);
  const daChon = useMemo(
    () => nhap.items.map((i) => ({ sanPham: theoId.get(i.id)!, soLuong: i.soLuong })).filter((d) => d.sanPham),
    [nhap.items, theoId],
  );
  const ketQua = useMemo(() => kiemTra(daChon, { doPhanGiai: nhap.doPhanGiai }), [daChon, nhap.doPhanGiai]);
  const dem = demMucDo(ketQua);
  const cs = uocTinhCongSuat(daChon);
  const tong = daChon.reduce((t, d) => t + d.sanPham.gia * d.soLuong, 0);
  const psu = daChon.find((d) => d.sanPham.loai === "nguon")?.sanPham;
  const buocTiep = BAT_BUOC.find((l) => !daChon.some((d) => d.sanPham.loai === l)) ?? null;
  const tenTheoId = new Map(daChon.map((d) => [d.sanPham.id, d.sanPham.ten]));

  const dongNgan = useCallback(() => setNgan(null), []);
  const chon = (sp: SanPhamDayDu) => {
    capNhat((n) => datVaoNhap(n, sp, (id) => theoId.get(id)?.loai));
    setNgan(null);
  };

  const luu = async () => {
    if (!daNap || daChon.length === 0) return;
    if (!daDangNhap) {
      // Nháp đã nằm trong localStorage, đăng nhập xong quay lại vẫn còn
      router.push("/dang-nhap?tiep=/build-pc");
      return;
    }
    setDangLuu(true);
    setThongBao(null);
    try {
      const r = await fetch(nhap.suaId ? `/api/cau-hinh/${nhap.suaId}` : "/api/cau-hinh", {
        method: nhap.suaId ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ten: nhap.ten, doPhanGiai: nhap.doPhanGiai, items: nhap.items }),
      });
      const j = await r.json();
      if (!r.ok) {
        if (r.status === 404 && nhap.suaId) {
          // Cấu hình gốc đã bị xóa: lưu thành cấu hình mới ở lần bấm sau
          capNhat((n) => ({ ...n, suaId: null }));
        }
        setThongBao({ loai: "loi", noiDung: j.loi ?? "Không lưu được. Thử lại." });
        return;
      }
      capNhat((n) => ({ ...n, suaId: j.id }));
      setThongBao({
        loai: "ok",
        noiDung: (
          <>
            Đã lưu &ldquo;{nhap.ten}&rdquo;.{" "}
            <Link href={`/cau-hinh/${j.id}`} className="underline">
              Xem trang cấu hình
            </Link>
          </>
        ),
      });
    } catch {
      setThongBao({ loai: "loi", noiDung: "Mất kết nối tới máy chủ. Nháp vẫn được giữ trên máy này." });
    } finally {
      setDangLuu(false);
    }
  };

  const themVaoGio = () => {
    themNhieu(nhap.items);
    setThongBao({
      loai: "ok",
      noiDung: (
        <>
          Đã thêm {nhap.items.length} món vào giỏ.{" "}
          <Link href="/gio-hang" className="underline">
            Xem giỏ hàng
          </Link>
        </>
      ),
    });
  };

  if (!danhMuc || !daNap) {
    return <div className="tem h-[480px] animate-pulse" aria-label="Đang tải danh mục" />;
  }

  return (
    <>
      <div className="grid gap-6 pb-24 lg:grid-cols-[1fr_360px] lg:pb-0">
        <div className="flex flex-col gap-4">
          {/* Tên + độ phân giải mục tiêu */}
          <div className="tem flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="ten-cau-hinh" className="mb-1.5 block text-co-nho text-n-8">
                Tên cấu hình
              </label>
              <input
                id="ten-cau-hinh"
                value={nhap.ten}
                maxLength={80}
                onChange={(e) => capNhat((n) => ({ ...n, ten: e.target.value }))}
                className="h-10 w-full rounded-md border border-n-4 bg-n-1 px-3 text-co-doc font-medium text-n-10 focus:border-nhan focus:outline-none"
              />
            </div>
            <fieldset>
              <legend className="mb-1.5 text-co-nho text-n-8">Chơi game ở độ phân giải</legend>
              <div className="flex rounded-md border border-n-4 bg-n-1 p-0.5">
                {(["1080p", "1440p", "4K"] as DoPhanGiai[]).map((d) => (
                  <label
                    key={d}
                    className={`so cursor-pointer rounded px-3 py-1.5 text-co-nho transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-nhan-sang ${
                      nhap.doPhanGiai === d ? "bg-nhan text-white" : "text-n-9 hover:text-n-10"
                    }`}
                  >
                    <input type="radio" name="dpg" value={d} checked={nhap.doPhanGiai === d} onChange={() => capNhat((n) => ({ ...n, doPhanGiai: d }))} className="sr-only" />
                    {d}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Các ô linh kiện */}
          <ul className="tem divide-y divide-n-4" aria-label="Linh kiện trong cấu hình">
            {THU_TU_LOAI.map((loai) => {
              const mon = daChon.filter((d) => d.sanPham.loai === loai);
              const laTiep = loai === buocTiep;
              return (
                <li key={loai} className={`relative p-3 sm:p-4 ${laTiep ? "bg-nhan-nen/50" : ""}`}>
                  {laTiep && <span className="absolute inset-y-0 left-0 w-0.5 bg-nhan-sang" aria-hidden />}
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-co-than font-semibold text-n-10">
                      {TEN_LOAI[loai]}
                      {BAT_BUOC.includes(loai) && mon.length === 0 && <span className="text-co-phu font-normal text-n-7">bắt buộc</span>}
                      {laTiep && <span className="text-co-phu font-medium text-nhan-sang">· chọn tiếp</span>}
                    </p>
                    {mon.length === 0 ? null : loai === "o-cung" ? (
                      <button type="button" onClick={() => setNgan(loai)} className="text-co-nho text-nhan-sang hover:underline">
                        + Thêm ổ cứng
                      </button>
                    ) : (
                      <button type="button" onClick={() => setNgan(loai)} className="text-co-nho text-nhan-sang hover:underline">
                        Đổi
                      </button>
                    )}
                  </div>

                  {mon.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => setNgan(loai)}
                      className={`mt-2 flex w-full items-center gap-3 rounded-md border border-dashed px-3 py-3 text-left transition-colors ${
                        laTiep ? "border-nhan/70 hover:bg-nhan-nen" : "border-n-5 hover:border-n-6 hover:bg-n-3"
                      }`}
                    >
                      <HinhLinhKien loai={loai} className="h-9 w-12 shrink-0" />
                      <span className="min-w-0">
                        <span className={`block text-co-than font-medium ${laTiep ? "text-nhan-sang" : "text-n-9"}`}>+ Chọn {TEN_LOAI[loai]}</span>
                        {GOI_Y_LOAI[loai] && <span className="block text-co-phu text-n-7">{GOI_Y_LOAI[loai]}</span>}
                      </span>
                    </button>
                  ) : (
                    <ul className="mt-2 flex flex-col gap-2">
                      {mon.map(({ sanPham: sp, soLuong }) => {
                        const muc = mucNangNhat(sp.id, ketQua);
                        return (
                          <li key={sp.id} className="grid grid-cols-[56px_1fr] gap-3 sm:grid-cols-[64px_1fr_auto] sm:items-center">
                            <div className="flex aspect-[4/3] items-center justify-center rounded bg-n-3">
                              <HinhLinhKien loai={sp.loai} bien={bienCua(sp)} className="h-[80%] w-[80%]" />
                            </div>
                            <div className="min-w-0">
                              <Link href={`/san-pham/${sp.slug}`} className="line-clamp-1 text-co-than text-n-10 hover:underline">
                                {sp.ten}
                              </Link>
                              <p className="so truncate text-co-nhan text-n-8">{thongSoNoiBat(sp).join(" · ")}</p>
                              {muc && (
                                <span key={`${muc}-${nhap.items.length}`} className={`dau mt-1 ${MAU_MUC_DO[muc].chu} animate-dong-dau`}>
                                  <BieuTuongMucDo mucDo={muc} className="size-3" />
                                  {muc === "loi" ? "Không hợp, xem bên phải" : "Có lưu ý"}
                                </span>
                              )}
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-2 sm:col-span-1">
                              {(loai === "ram" || loai === "o-cung") && (
                                <div className="flex h-8 items-center rounded-md border border-n-4 bg-n-1" role="group" aria-label={`Số lượng ${sp.ten}`}>
                                  <button
                                    type="button"
                                    aria-label="Giảm"
                                    disabled={soLuong <= 1}
                                    onClick={() => capNhat((n) => ({ ...n, items: n.items.map((i) => (i.id === sp.id ? { ...i, soLuong: i.soLuong - 1 } : i)) }))}
                                    className="flex h-full w-7 items-center justify-center text-n-9 disabled:opacity-40"
                                  >
                                    <Minus className="size-3.5" />
                                  </button>
                                  <span className="so w-6 text-center text-co-nho">{soLuong}</span>
                                  <button
                                    type="button"
                                    aria-label="Tăng"
                                    disabled={soLuong >= 4}
                                    onClick={() => capNhat((n) => ({ ...n, items: n.items.map((i) => (i.id === sp.id ? { ...i, soLuong: i.soLuong + 1 } : i)) }))}
                                    className="flex h-full w-7 items-center justify-center text-n-9 disabled:opacity-40"
                                  >
                                    <Plus className="size-3.5" />
                                  </button>
                                </div>
                              )}
                              <span className="so w-28 text-right text-co-than font-semibold text-n-10">{dinhDangTien(sp.gia * soLuong)}</span>
                              <button
                                type="button"
                                aria-label={`Bỏ ${sp.ten}`}
                                onClick={() => capNhat((n) => ({ ...n, items: n.items.filter((i) => i.id !== sp.id) }))}
                                className="rounded p-1.5 text-n-8 hover:bg-n-3 hover:text-loi"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Tóm tắt */}
        <aside id="tom-tat" className="flex scroll-mt-36 flex-col gap-3 lg:sticky lg:top-36 lg:max-h-[calc(100dvh-10rem)] lg:self-start [&>*]:shrink-0">
          <BangDinhMuc
            tieuDe={nhap.suaId ? "Đang sửa cấu hình đã lưu" : "Bảng định mức cấu hình"}
            tongTien={tong}
            congSuat={cs.tong}
            nguonDeNghi={cs.nguonDeNghi}
            congSuatNguon={psu?.loai === "nguon" ? psu.specs.congSuat : null}
            soLoi={dem.loi}
            soCanhBao={dem.canhBao}
            soMon={daChon.reduce((t, d) => t + d.soLuong, 0)}
            doPhanGiai={nhap.doPhanGiai}
          />
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={luu} disabled={dangLuu || daChon.length === 0} className={lopNut("chinh")}>
              <Save className="size-4" aria-hidden /> {dangLuu ? "Đang lưu…" : nhap.suaId ? "Lưu thay đổi" : "Lưu cấu hình"}
            </button>
            <button type="button" onClick={themVaoGio} disabled={daChon.length === 0} className={lopNut("phu")}>
              <ShoppingCart className="size-4" aria-hidden /> Thêm cả bộ vào giỏ
            </button>
          </div>
          {!daDangNhap && daChon.length > 0 && <p className="text-co-phu text-n-7">Lưu cấu hình cần đăng nhập; nháp hiện tại vẫn được giữ trên máy này.</p>}
          {thongBao && (
            <p role="status" className={`animate-hien rounded-md px-3 py-2 text-co-nho ${thongBao.loai === "ok" ? "bg-dat-nen text-dat" : "bg-loi-nen text-loi"}`}>
              {thongBao.noiDung}
            </p>
          )}

          <section aria-labelledby="kq" className="tem flex min-h-0 !shrink flex-col lg:flex-1">
            <h2 id="kq" className="flex items-center justify-between border-b border-n-4 px-4 py-2.5 text-co-doc font-semibold text-n-10">
              Kiểm tra tương thích
              <span className="text-co-phu font-normal text-n-8">{dem.dat} mục đạt</span>
            </h2>
            <div className="min-h-0 overflow-y-auto overscroll-contain px-4">
              {ketQua.length === 0 ? (
                <p className="py-4 text-co-nho text-n-8">Chọn linh kiện để bắt đầu kiểm tra.</p>
              ) : (
                <BangKetQua ketQua={ketQua} tenTheoId={tenTheoId} />
              )}
            </div>
            {daChon.some((d) => d.sanPham.loai === "cpu") && daChon.some((d) => d.sanPham.loai === "vga") && (
              <p className="border-t border-n-4 px-4 py-2.5 text-co-phu text-n-7">Nghẽn cổ chai là ước lượng từ điểm hiệu năng tương đối, không phải số đo FPS thực tế.</p>
            )}
          </section>

          {daChon.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Xóa toàn bộ linh kiện trong cấu hình đang dựng?")) capNhat(() => NHAP_TRONG);
                setThongBao(null);
              }}
              className={`${lopNut("nhat", "nho")} self-start`}
            >
              <RotateCcw className="size-3.5" aria-hidden /> Bắt đầu lại
            </button>
          )}
        </aside>
      </div>

      {/* Thanh tóm tắt dưới đáy trên điện thoại */}
      <a
        href="#tom-tat"
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-n-4 bg-n-1/95 px-4 py-3 backdrop-blur-sm lg:hidden"
      >
        <span className="so text-co-muc font-bold text-n-10">{dinhDangTien(tong)}</span>
        <span className="flex items-center gap-3 text-co-nho">
          <span className={dem.loi ? "text-loi" : "text-n-7"}>{dem.loi} lỗi</span>
          <span className={dem.canhBao ? "text-canh-bao" : "text-n-7"}>{dem.canhBao} cảnh báo</span>
          <span className="so text-n-9">~{cs.tong} W</span>
        </span>
      </a>

      {ngan && (
        <NganChon
          loai={ngan}
          danhMuc={danhMuc}
          daChon={daChon}
          doPhanGiai={nhap.doPhanGiai}
          dangChonId={ngan !== "o-cung" ? daChon.find((d) => d.sanPham.loai === ngan)?.sanPham.id : undefined}
          onChon={chon}
          onDong={dongNgan}
        />
      )}
    </>
  );
}
