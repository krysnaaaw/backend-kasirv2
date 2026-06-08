-- ============================================
-- POS KLASIK - DATABASE SCHEMA
-- Compatible with MySQL 5.7+ / MariaDB 10.4+
-- ============================================

CREATE DATABASE IF NOT EXISTS pos_klasik
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pos_klasik;

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'kasir') NOT NULL DEFAULT 'kasir',
  avatar VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  deskripsi TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nama (nama)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  kode_produk VARCHAR(50) NOT NULL UNIQUE,
  nama_produk VARCHAR(200) NOT NULL,
  deskripsi TEXT DEFAULT NULL,
  harga_beli DECIMAL(15,2) NOT NULL DEFAULT 0,
  harga_jual DECIMAL(15,2) NOT NULL DEFAULT 0,
  stok INT NOT NULL DEFAULT 0,
  stok_minimum INT NOT NULL DEFAULT 5,
  satuan VARCHAR(20) NOT NULL DEFAULT 'pcs',
  barcode VARCHAR(100) DEFAULT NULL UNIQUE,
  gambar VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_category (category_id),
  INDEX idx_barcode (barcode),
  INDEX idx_kode (kode_produk),
  INDEX idx_nama (nama_produk),
  INDEX idx_stok (stok)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: transactions
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nomor_transaksi VARCHAR(50) NOT NULL UNIQUE,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  diskon DECIMAL(15,2) NOT NULL DEFAULT 0,
  pajak DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  metode_pembayaran ENUM('tunai','transfer','debit','kredit','ewallet') NOT NULL DEFAULT 'tunai',
  nama_metode VARCHAR(50) DEFAULT NULL,
  jumlah_bayar DECIMAL(15,2) NOT NULL DEFAULT 0,
  kembalian DECIMAL(15,2) NOT NULL DEFAULT 0,
  status ENUM('paid','cancelled') NOT NULL DEFAULT 'paid',
  catatan TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_nomor (nomor_transaksi),
  INDEX idx_status (status),
  INDEX idx_metode (metode_pembayaran),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: transaction_items
-- ============================================
CREATE TABLE IF NOT EXISTS transaction_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  product_id INT NOT NULL,
  nama_produk VARCHAR(200) NOT NULL,
  harga_beli DECIMAL(15,2) NOT NULL DEFAULT 0,
  harga_jual DECIMAL(15,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_transaction (transaction_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- DONE
-- ============================================
