PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  ho_ten        TEXT NOT NULL,
  mat_khau      TEXT NOT NULL,            -- "salt:hash" (scrypt, hex)
  la_admin      INTEGER NOT NULL DEFAULT 0,
  so_dien_thoai TEXT,
  dia_chi       TEXT,
  tao_luc       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token     TEXT PRIMARY KEY,
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  het_han   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  slug      TEXT NOT NULL UNIQUE,
  ten       TEXT NOT NULL,
  hang      TEXT NOT NULL,
  loai      TEXT NOT NULL,
  gia       INTEGER NOT NULL,
  gia_goc   INTEGER,
  ton_kho   INTEGER NOT NULL DEFAULT 0,
  mo_ta     TEXT NOT NULL DEFAULT '',
  specs     TEXT NOT NULL,                -- JSON theo loại, xem lib/tuong-thich/types.ts
  tao_luc   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_loai ON products(loai);

CREATE TABLE IF NOT EXISTS reviews (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  so_sao      INTEGER NOT NULL CHECK (so_sao BETWEEN 1 AND 5),
  noi_dung    TEXT NOT NULL,
  tao_luc     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (product_id, user_id)
);

CREATE TABLE IF NOT EXISTS cart_items (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  so_luong    INTEGER NOT NULL CHECK (so_luong > 0),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id),
  trang_thai    TEXT NOT NULL DEFAULT 'cho-xac-nhan', -- cho-xac-nhan | dang-giao | da-giao | da-huy
  thanh_toan    TEXT NOT NULL,                        -- cod | chuyen-khoan
  da_thanh_toan INTEGER NOT NULL DEFAULT 0,
  ho_ten        TEXT NOT NULL,
  so_dien_thoai TEXT NOT NULL,
  dia_chi       TEXT NOT NULL,
  ghi_chu       TEXT NOT NULL DEFAULT '',
  tong_tien     INTEGER NOT NULL,
  so_loi        INTEGER NOT NULL DEFAULT 0,           -- lỗi tương thích lúc đặt (khách đã xác nhận)
  tao_luc       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER REFERENCES products(id) ON DELETE SET NULL,
  ten         TEXT NOT NULL,                          -- chụp lại tên & giá lúc đặt
  loai        TEXT NOT NULL,
  gia         INTEGER NOT NULL,
  so_luong    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS builds (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ten         TEXT NOT NULL,
  do_phan_giai TEXT NOT NULL DEFAULT '1080p',
  so_loi      INTEGER NOT NULL DEFAULT 0,
  so_canh_bao INTEGER NOT NULL DEFAULT 0,
  tao_luc     TEXT NOT NULL DEFAULT (datetime('now')),
  sua_luc     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS build_items (
  build_id    INTEGER NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  so_luong    INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (build_id, product_id)
);
