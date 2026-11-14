import { Logo } from "./thanh-tren";

export function KhungXacThuc({ tieuDe, moTa, children }: { tieuDe: string; moTa: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[400px] flex-col px-4 py-12 sm:py-16">
      <div className="tem p-6 sm:p-7">
        <Logo />
        <h1 className="mt-5 text-co-gia font-bold tracking-[-0.015em] text-n-10">{tieuDe}</h1>
        <p className="mb-6 mt-1 text-co-than text-n-8">{moTa}</p>
        {children}
      </div>
    </div>
  );
}
