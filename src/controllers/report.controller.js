const { pool } = require('../config/database');

const getReports = async (req, res) => {
  try {
    // Revenue last 7 days
    const [revenue7Days] = await pool.execute(`
      SELECT DATE(created_at) as tanggal, SUM(total) as revenue, COUNT(*) as count
      FROM transactions WHERE status='paid' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at) ORDER BY tanggal ASC
    `);

    // Monthly revenue (last 6 months)
    const [monthlyRevenue] = await pool.execute(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as bulan, SUM(total) as revenue, COUNT(*) as count
      FROM transactions WHERE status='paid' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY bulan ASC
    `);

    // Top products
    const [topProducts] = await pool.execute(`
      SELECT p.nama_produk, SUM(ti.quantity) as total_terjual, SUM(ti.subtotal) as total_revenue
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.status = 'paid'
      GROUP BY p.id ORDER BY total_terjual DESC LIMIT 8
    `);

    // Payment methods distribution
    const [paymentMethods] = await pool.execute(`
      SELECT metode_pembayaran, COUNT(*) as count, SUM(total) as total
      FROM transactions WHERE status='paid'
      GROUP BY metode_pembayaran ORDER BY count DESC
    `);

    // Inventory value by category
    const [inventoryByCategory] = await pool.execute(`
      SELECT c.nama, SUM(p.stok * p.harga_jual) as nilai_jual, SUM(p.stok * p.harga_beli) as nilai_beli, COUNT(p.id) as total_produk
      FROM categories c LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      GROUP BY c.id ORDER BY nilai_jual DESC
    `);

    // Margin estimation by category
    const [marginByCategory] = await pool.execute(`
      SELECT c.nama,
        AVG(CASE WHEN p.harga_beli > 0 THEN ((p.harga_jual - p.harga_beli) / p.harga_beli * 100) ELSE 0 END) as avg_margin
      FROM categories c LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1 AND p.harga_beli > 0
      GROUP BY c.id ORDER BY avg_margin DESC
    `);

    // Summary stats
    const [[summary]] = await pool.execute(`
      SELECT
        SUM(total) as total_revenue,
        COUNT(*) as total_transaksi,
        AVG(total) as avg_transaksi,
        MAX(total) as max_transaksi,
        MIN(total) as min_transaksi
      FROM transactions WHERE status='paid'
    `);

    res.json({
      success: true,
      data: {
        revenue_7_hari: revenue7Days,
        pendapatan_bulanan: monthlyRevenue,
        produk_terlaris: topProducts,
        metode_pembayaran: paymentMethods,
        inventori_per_kategori: inventoryByCategory,
        margin_per_kategori: marginByCategory,
        ringkasan: summary
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data laporan' });
  }
};

module.exports = { getReports };
