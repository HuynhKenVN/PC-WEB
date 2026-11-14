import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const DO_DAI = 64;

export function bamMatKhau(matKhau: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(matKhau, salt, DO_DAI).toString("hex");
  return `${salt}:${hash}`;
}

export function kiemMatKhau(matKhau: string, daLuu: string): boolean {
  const [salt, hash] = daLuu.split(":");
  if (!salt || !hash) return false;
  const thu = scryptSync(matKhau, salt, DO_DAI);
  const goc = Buffer.from(hash, "hex");
  return goc.length === thu.length && timingSafeEqual(goc, thu);
}
