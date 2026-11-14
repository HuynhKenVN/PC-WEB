import type { NextConfig } from "next";

// Dùng mô hình render động truyền thống (không bật cacheComponents) vì mọi trang
// đều đọc SQLite và cookie phiên theo từng yêu cầu.
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
