import { canAdmin } from "@/lib/auth";
import { KhungTrang } from "@/components/ui";
import { MenuQuanTri } from "@/components/quan-tri/menu";

export default async function LayoutQuanTri({ children }: LayoutProps<"/quan-tri">) {
  await canAdmin();
  return (
    <KhungTrang>
      <div className="flex flex-col gap-6 pt-6 lg:flex-row">
        <MenuQuanTri />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </KhungTrang>
  );
}
