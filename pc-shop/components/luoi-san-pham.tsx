import type { SanPhamDayDu } from "@/lib/db";
import { BO_LOC, NHAN_SAP_XEP, locVaSap, mang, type DinhNghiaLoc, type ThamSo } from "@/lib/bo-loc";
import type { LoaiLinhKien } from "@/lib/tuong-thich";
import { BoLocForm, ChonSapXep, type NhomLoc } from "./bo-loc-form";
import { TheSanPham } from "./the-san-pham";
import { TrangTrong } from "./ui";

/** Lưới sản phẩm có cột lọc — dùng chung cho danh mục và tìm kiếm. */
export function LuoiCoLoc({
  ds,
  ts,
  hanhDong,
  loai,
  giuLai = {},
}: {
  ds: SanPhamDayDu[];
  ts: ThamSo;
  hanhDong: string;
  loai?: LoaiLinhKien;
  giuLai?: Record<string, string>;
}) {
  const boLoc: DinhNghiaLoc[] = [
    { khoa: "hang", nhan: "Hãng", lay: (sp) => [sp.hang] },
    ...(loai ? BO_LOC[loai] : []),
  ];
  const ketQua = locVaSap(ds, ts, loai ? BO_LOC[loai] : []);

  // Số đếm mỗi lựa chọn tính trên toàn bộ danh sách của trang (trước khi lọc)
  const nhom: NhomLoc[] = boLoc.map((bl) => {
    const dem = new Map<string, number>();
    for (const sp of ds) for (const v of bl.lay(sp)) dem.set(v, (dem.get(v) ?? 0) + 1);
    return {
      khoa: bl.khoa,
      nhan: bl.nhan,
      luaChon: [...dem].sort((a, b) => a[0].localeCompare(b[0], "vi", { numeric: true })).map(([giaTri, d]) => ({ giaTri, dem: d })),
      daChon: mang(ts[bl.khoa]),
    };
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr] lg:gap-6">
      <aside aria-label="Bộ lọc">
        <BoLocForm
          key={JSON.stringify(ts)}
          hanhDong={hanhDong}
          nhom={nhom}
          giaTu={typeof ts.giaTu === "string" ? ts.giaTu : undefined}
          giaDen={typeof ts.giaDen === "string" ? ts.giaDen : undefined}
          conHang={ts.conHang === "1"}
          giuLai={giuLai}
        />
      </aside>
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-co-nho text-n-8" aria-live="polite">
            <span className="so text-n-10">{ketQua.length}</span> sản phẩm
          </p>
          <ChonSapXep hienTai={typeof ts.sap === "string" ? ts.sap : "pho-bien"} luaChon={Object.entries(NHAN_SAP_XEP)} />
        </div>
        {ketQua.length === 0 ? (
          <TrangTrong tieuDe="Không có sản phẩm khớp bộ lọc" moTa="Bỏ bớt điều kiện lọc, hoặc mở rộng khoảng giá." />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {ketQua.map((sp) => (
              <TheSanPham key={sp.id} sp={sp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
