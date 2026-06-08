const { pool } = require('../config/database');

const getDashboard = async (req, res) => {
  try {
    // Product stats
    const [[prodStats]] = await pool.execute(`
      SELECT
        COUNT(*) as total_produk,
        SUM(CASE WHEN stok > stok_minimum THEN 1 ELSE 0 END) as stok_aman,
        SUM(CASE WHEN stok > 0 AND stok <= stok_minimum THEN 1 ELSE 0 END) as stok_hampir,
        SUM(CASE WHEN stok = 0 THEN 1 ELSE 0 END) as stok_habis
      FROM products WHERE is_active = 1
    `);

    // Category count
    const [[catStats]] = await pool.execute('SELECT COUNT(*) as total FROM categories');

    // Revenue stats
    const [[revenueStats]] = await pool.execute(`
      SELECT
        SUM(CASE WHEN DATE(created_at) = CURDATE() AND status='paid' THEN total ELSE 0 END) as hari_ini,
        SUM(CASE WHEN YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1) AND status='paid' THEN total ELSE 0 END) as minggu_ini,
        SUM(CASE WHEN MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) AND status='paid' THEN total ELSE 0 END) as bulan_ini,
        COUNT(CASE WHEN status='paid' THEN 1 END) as total_transaksi,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() AND status='paid' THEN 1 END) as transaksi_hari_ini
      FROM transactions
    `);

    // Top products (last 30 days)
    const [topProducts] = await pool.execute(`
      SELECT p.nama_produk, p.gambar, SUM(ti.quantity) as total_terjual, SUM(ti.subtotal) as total_revenue
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.status = 'paid' AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY p.id ORDER BY total_terjual DESC LIMIT 5
    `);

    // Weekly revenue (last 7 days)
    const [weeklyRevenue] = await pool.execute(`
      SELECT DATE(created_at) as tanggal, SUM(total) as revenue, COUNT(*) as count
      FROM transactions WHERE status='paid' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at) ORDER BY tanggal ASC
    `);

    // Low stock alert
    const [lowStock] = await pool.execute(`
      SELECT id, nama_produk, stok, stok_minimum, satuan FROM products
      WHERE is_active = 1 AND stok <= stok_minimum ORDER BY stok ASC LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        produk: { ...prodStats, total_kategori: catStats.total },
        pendapatan: revenueStats,
        produk_terlaris: topProducts,
        pendapatan_mingguan: weeklyRevenue,
        stok_rendah: lowStock
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data dashboard' });
  }
};

module.exports = { getDashboard };
