-- ============================================
-- POS KLASIK - DUMMY DATA
-- ============================================

USE pos_klasik;

-- ============================================
-- USERS (password: Admin123! & Kasir123!)
-- ============================================
INSERT INTO users (nama, email, password, role) VALUES
('Administrator', 'admin@posklasik.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewPEHxXHqiUnVVEm', 'admin'),
('Kasir Utama', 'kasir@posklasik.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/oLEBDUEFwBHEBxpBm', 'kasir'),
('Budi Santoso', 'budi@posklasik.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/oLEBDUEFwBHEBxpBm', 'kasir');

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO categories (nama, deskripsi) VALUES
('Minuman', 'Berbagai jenis minuman segar dan kemasan'),
('Makanan', 'Makanan ringan dan berat siap saji'),
('Sembako', 'Kebutuhan pokok sehari-hari'),
('Rokok', 'Berbagai merek rokok'),
('Perawatan', 'Produk perawatan diri dan kebersihan'),
('Alat Tulis', 'Perlengkapan tulis dan kantor'),
('Frozen Food', 'Makanan beku dan olahan'),
('Obat-obatan', 'Obat bebas dan suplemen');

-- ============================================
-- PRODUCTS
-- ============================================
INSERT INTO products (category_id, kode_produk, nama_produk, deskripsi, harga_beli, harga_jual, stok, stok_minimum, satuan, barcode) VALUES
-- Minuman
(1, 'PRD-001', 'Aqua 600ml', 'Air mineral dalam kemasan 600ml', 2500, 4000, 150, 20, 'botol', '8999999000001'),
(1, 'PRD-002', 'Indomilk Coklat 250ml', 'Susu coklat kemasan 250ml', 4500, 6500, 80, 10, 'kotak', '8999999000002'),
(1, 'PRD-003', 'Teh Botol Sosro 450ml', 'Teh manis dalam botol 450ml', 4000, 6000, 60, 10, 'botol', '8999999000003'),
(1, 'PRD-004', 'Coca Cola 390ml', 'Minuman soda kaleng 390ml', 6000, 8500, 48, 12, 'kaleng', '8999999000004'),
(1, 'PRD-005', 'Kopi Kapal Api Sachet', 'Kopi sachet siap saji', 1500, 2500, 200, 30, 'sachet', '8999999000005'),
-- Makanan
(2, 'PRD-006', 'Indomie Goreng', 'Mie instan goreng original', 2800, 3500, 120, 20, 'bungkus', '8999999000006'),
(2, 'PRD-007', 'Chitato Sapi Panggang 68g', 'Keripik kentang rasa sapi panggang', 8000, 11000, 36, 6, 'bungkus', '8999999000007'),
(2, 'PRD-008', 'Oreo Original 133g', 'Biskuit coklat sandwich', 9000, 13000, 24, 6, 'bungkus', '8999999000008'),
(2, 'PRD-009', 'Biskuat Tiger 40g', 'Biskuit energi coklat', 3000, 4500, 48, 10, 'bungkus', '8999999000009'),
(2, 'PRD-010', 'Pop Mie Ayam Bawang 75g', 'Mie cup rasa ayam bawang', 4500, 6500, 30, 8, 'cup', '8999999000010'),
-- Sembako
(3, 'PRD-011', 'Beras Rose Brand 5kg', 'Beras pulen premium 5kg', 58000, 72000, 20, 5, 'karung', '8999999000011'),
(3, 'PRD-012', 'Minyak Goreng Bimoli 2L', 'Minyak goreng sawit 2 liter', 28000, 35000, 15, 4, 'botol', '8999999000012'),
(3, 'PRD-013', 'Gula Pasir 1kg', 'Gula pasir putih kemasan 1kg', 13000, 17000, 25, 5, 'kg', '8999999000013'),
(3, 'PRD-014', 'Tepung Terigu Segitiga 1kg', 'Tepung terigu protein tinggi 1kg', 10000, 14000, 18, 4, 'bungkus', '8999999000014'),
(3, 'PRD-015', 'Telur Ayam 1kg', 'Telur ayam kampung segar 1kg', 22000, 28000, 10, 3, 'kg', '8999999000015'),
-- Rokok
(4, 'PRD-016', 'Djarum Super 12', 'Rokok kretek filter isi 12', 17000, 22000, 30, 5, 'bungkus', '8999999000016'),
(4, 'PRD-017', 'Sampoerna Mild 16', 'Rokok mild isi 16 batang', 23000, 29000, 25, 5, 'bungkus', '8999999000017'),
(4, 'PRD-018', 'Gudang Garam Surya 12', 'Rokok kretek filter surya 12', 19000, 24000, 20, 4, 'bungkus', '8999999000018'),
-- Perawatan
(5, 'PRD-019', 'Pepsodent 75gr', 'Pasta gigi perlindungan gigi dan mulut', 8000, 12000, 40, 8, 'tube', '8999999000019'),
(5, 'PRD-020', 'Lifebuoy Sabun 75gr', 'Sabun mandi antibakteri', 5000, 8000, 35, 8, 'batang', '8999999000020'),
(5, 'PRD-021', 'Pantene Shampoo 170ml', 'Sampo perawatan rambut', 18000, 25000, 20, 4, 'botol', '8999999000021'),
-- Alat Tulis
(6, 'PRD-022', 'Pulpen Pilot BPS-GP', 'Pulpen ballpoint hitam', 3500, 5500, 50, 10, 'buah', '8999999000022'),
(6, 'PRD-023', 'Buku Tulis Sidu 58 lembar', 'Buku tulis bergaris 58 halaman', 5000, 7500, 30, 6, 'buah', '8999999000023'),
(6, 'PRD-024', 'Penggaris 30cm', 'Penggaris plastik transparan 30cm', 4000, 6500, 20, 4, 'buah', '8999999000024'),
-- Frozen Food
(7, 'PRD-025', 'Nugget So Good 500g', 'Nugget ayam original 500g', 32000, 42000, 12, 3, 'bungkus', '8999999000025'),
(7, 'PRD-026', 'Sosis Bernardi 375g', 'Sosis sapi 375g', 25000, 33000, 10, 3, 'bungkus', '8999999000026'),
(7, 'PRD-027', 'Dimsum Siomay 300g', 'Siomay babi dan udang 300g', 22000, 30000, 2, 4, 'bungkus', '8999999000027'),
-- Obat-obatan
(8, 'PRD-028', 'Paracetamol 500mg Generik', 'Obat penurun panas strip 10', 4000, 7000, 30, 6, 'strip', '8999999000028'),
(8, 'PRD-029', 'Antangin JRG Sachet', 'Jamu masuk angin sachet', 2500, 4000, 40, 8, 'sachet', '8999999000029'),
(8, 'PRD-030', 'Minyak Kayu Putih Cap Lang 30ml', 'Minyak kayu putih 30ml', 15000, 22000, 0, 5, 'botol', '8999999000030');

-- ============================================
-- TRANSACTIONS (Sample)
-- ============================================
INSERT INTO transactions (user_id, nomor_transaksi, subtotal, diskon, pajak, total, metode_pembayaran, nama_metode, jumlah_bayar, kembalian, status, created_at) VALUES
(2, 'TRX-20240101-001', 45000, 0, 0, 45000, 'tunai', 'Tunai', 50000, 5000, 'paid', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(2, 'TRX-20240102-001', 87500, 5000, 0, 82500, 'transfer', 'BCA Transfer', 82500, 0, 'paid', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 'TRX-20240103-001', 32000, 0, 0, 32000, 'ewallet', 'GoPay', 32000, 0, 'paid', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 'TRX-20240104-001', 125000, 10000, 0, 115000, 'debit', 'Debit BNI', 115000, 0, 'paid', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 'TRX-20240105-001', 58500, 0, 0, 58500, 'tunai', 'Tunai', 60000, 1500, 'paid', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'TRX-20240106-001', 75000, 0, 3750, 78750, 'kredit', 'Kredit BRI', 78750, 0, 'paid', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 'TRX-20240107-001', 42500, 0, 0, 42500, 'tunai', 'Tunai', 50000, 7500, 'paid', NOW());

-- ============================================
-- TRANSACTION ITEMS
-- ============================================
INSERT INTO transaction_items (transaction_id, product_id, nama_produk, harga_beli, harga_jual, quantity, subtotal) VALUES
(1, 1, 'Aqua 600ml', 2500, 4000, 3, 12000),
(1, 6, 'Indomie Goreng', 2800, 3500, 5, 17500),
(1, 5, 'Kopi Kapal Api Sachet', 1500, 2500, 6, 15000),
(2, 11, 'Beras Rose Brand 5kg', 58000, 72000, 1, 72000),
(2, 13, 'Gula Pasir 1kg', 13000, 17000, 1, 17000),
(3, 8, 'Oreo Original 133g', 9000, 13000, 1, 13000),
(3, 7, 'Chitato Sapi Panggang 68g', 8000, 11000, 1, 11000),
(3, 4, 'Coca Cola 390ml', 6000, 8500, 1, 8500),
(4, 25, 'Nugget So Good 500g', 32000, 42000, 2, 84000),
(4, 26, 'Sosis Bernardi 375g', 25000, 33000, 1, 33000),
(5, 19, 'Pepsodent 75gr', 8000, 12000, 1, 12000),
(5, 20, 'Lifebuoy Sabun 75gr', 5000, 8000, 2, 16000),
(5, 22, 'Pulpen Pilot BPS-GP', 3500, 5500, 3, 16500),
(5, 28, 'Paracetamol 500mg Generik', 4000, 7000, 2, 14000),
(6, 12, 'Minyak Goreng Bimoli 2L', 28000, 35000, 2, 70000),
(7, 17, 'Sampoerna Mild 16', 23000, 29000, 1, 29000),
(7, 3, 'Teh Botol Sosro 450ml', 4000, 6000, 2, 12000);

-- ============================================
-- DONE
-- ============================================
