const { pool } = require('../config/database');

const generateNomor = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `TRX-${y}${m}${d}-${rand}`;
};

// GET ALL
const getAll = async (req, res) => {
  try {
    const { search = '', metode = '', status = '', date_start = '', date_end = '', page = 1, limit = 15 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = [];
    const params = [];
    if (search) { where.push('(t.nomor_transaksi LIKE ? OR u.nama LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (metode) { where.push('t.metode_pembayaran = ?'); params.push(metode); }
    if (status) { where.push('t.status = ?'); params.push(status); }
    if (date_start) { where.push('DATE(t.created_at) >= ?'); params.push(date_start); }
    if (date_end) { where.push('DATE(t.created_at) <= ?'); params.push(date_end); }
    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM transactions t LEFT JOIN users u ON t.user_id = u.id ${whereStr}`,
      params
    );
    const total = countRows[0].total;
    const [rows] = await pool.execute(
      `SELECT t.*, u.nama as kasir_nama FROM transactions t LEFT JOIN users u ON t.user_id = u.id ${whereStr} ORDER BY t.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );
    res.json({ success: true, data: rows, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data transaksi' });
  }
};

// GET ONE WITH ITEMS
const getOne = async (req, res) => {
  try {
    const [trx] = await pool.execute(
      'SELECT t.*, u.nama as kasir_nama FROM transactions t LEFT JOIN users u ON t.user_id = u.id WHERE t.id = ?',
      [req.params.id]
    );
    if (!trx.length) return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
    const [items] = await pool.execute(
      'SELECT ti.*, p.gambar, p.barcode FROM transaction_items ti LEFT JOIN products p ON ti.product_id = p.id WHERE ti.transaction_id = ?',
      [req.params.id]
    );
    res.json({ success: true, data: { ...trx[0], items } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail transaksi' });
  }
};

// CREATE TRANSACTION
const create = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { items, diskon = 0, pajak = 0, metode_pembayaran, nama_metode, jumlah_bayar, catatan } = req.body;
    if (!items || !items.length) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Keranjang belanja kosong' });
    }
    // Validate & calculate subtotal
    let subtotal = 0;
    const itemDetails = [];
    for (const item of items) {
      const [prod] = await conn.execute('SELECT * FROM products WHERE id = ? AND is_active = 1 FOR UPDATE', [item.product_id]);
      if (!prod.length) {
        await conn.rollback();
        return res.status(404).json({ success: false, message: `Produk ID ${item.product_id} tidak ditemukan` });
      }
      const p = prod[0];
      if (p.stok < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: `Stok ${p.nama_produk} tidak mencukupi. Stok: ${p.stok}` });
      }
      const itemSubtotal = p.harga_jual * item.quantity;
      subtotal += itemSubtotal;
      itemDetails.push({ ...p, quantity: item.quantity, itemSubtotal });
    }
    const diskonVal = parseFloat(diskon) || 0;
    const pajakVal = parseFloat(pajak) || 0;
    const total = subtotal - diskonVal + pajakVal;
    const kembalian = parseFloat(jumlah_bayar) - total;
    if (kembalian < 0 && metode_pembayaran === 'tunai') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Jumlah bayar kurang dari total' });
    }
    const nomor = generateNomor();
    const [trxResult] = await conn.execute(
      'INSERT INTO transactions (user_id, nomor_transaksi, subtotal, diskon, pajak, total, metode_pembayaran, nama_metode, jumlah_bayar, kembalian, catatan, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [req.user.id, nomor, subtotal, diskonVal, pajakVal, total, metode_pembayaran, nama_metode || metode_pembayaran, jumlah_bayar, kembalian > 0 ? kembalian : 0, catatan || null, 'paid']
    );
    const trxId = trxResult.insertId;
    for (const item of itemDetails) {
      await conn.execute(
        'INSERT INTO transaction_items (transaction_id, product_id, nama_produk, harga_beli, harga_jual, quantity, subtotal) VALUES (?,?,?,?,?,?,?)',
        [trxId, item.id, item.nama_produk, item.harga_beli, item.harga_jual, item.quantity, item.itemSubtotal]
      );
      await conn.execute('UPDATE products SET stok = stok - ? WHERE id = ?', [item.quantity, item.id]);
    }
    await conn.commit();
    const [newTrx] = await pool.execute(
      'SELECT t.*, u.nama as kasir_nama FROM transactions t LEFT JOIN users u ON t.user_id = u.id WHERE t.id = ?',
      [trxId]
    );
    const [newItems] = await pool.execute('SELECT * FROM transaction_items WHERE transaction_id = ?', [trxId]);
    res.status(201).json({ success: true, message: 'Transaksi berhasil disimpan', data: { ...newTrx[0], items: newItems } });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal memproses transaksi' });
  } finally {
    conn.release();
  }
};

// CANCEL
const cancel = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [trx] = await conn.execute('SELECT * FROM transactions WHERE id = ? FOR UPDATE', [req.params.id]);
    if (!trx.length) { await conn.rollback(); return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' }); }
    if (trx[0].status === 'cancelled') { await conn.rollback(); return res.status(400).json({ success: false, message: 'Transaksi sudah dibatalkan' }); }
    await conn.execute('UPDATE transactions SET status = ? WHERE id = ?', ['cancelled', req.params.id]);
    const [items] = await conn.execute('SELECT * FROM transaction_items WHERE transaction_id = ?', [req.params.id]);
    for (const item of items) {
      await conn.execute('UPDATE products SET stok = stok + ? WHERE id = ?', [item.quantity, item.product_id]);
    }
    await conn.commit();
    res.json({ success: true, message: 'Transaksi berhasil dibatalkan. Stok telah dikembalikan.' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: 'Gagal membatalkan transaksi' });
  } finally {
    conn.release();
  }
};

// EXPORT CSV
const exportCsv = async (req, res) => {
  try {
    const { date_start = '', date_end = '' } = req.query;
    let where = ["t.status = 'paid'"];
    const params = [];
    if (date_start) { where.push('DATE(t.created_at) >= ?'); params.push(date_start); }
    if (date_end) { where.push('DATE(t.created_at) <= ?'); params.push(date_end); }
    const whereStr = 'WHERE ' + where.join(' AND ');
    const [rows] = await pool.execute(
      `SELECT t.nomor_transaksi, u.nama as kasir, t.subtotal, t.diskon, t.pajak, t.total, t.metode_pembayaran, t.nama_metode, t.jumlah_bayar, t.kembalian, t.status, t.created_at FROM transactions t LEFT JOIN users u ON t.user_id = u.id ${whereStr} ORDER BY t.created_at DESC`,
      params
    );
    const headers = ['No Transaksi', 'Kasir', 'Subtotal', 'Diskon', 'Pajak', 'Total', 'Metode', 'Nama Metode', 'Dibayar', 'Kembalian', 'Status', 'Tanggal'];
    const csvRows = [headers.join(',')];
    rows.forEach(r => {
      csvRows.push([
        r.nomor_transaksi, r.kasir, r.subtotal, r.diskon, r.pajak, r.total,
        r.metode_pembayaran, r.nama_metode, r.jumlah_bayar, r.kembalian, r.status,
        new Date(r.created_at).toLocaleString('id-ID')
      ].join(','));
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="transaksi_${Date.now()}.csv"`);
    res.send('\uFEFF' + csvRows.join('\n'));
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal export CSV' });
  }
};

module.exports = { getAll, getOne, create, cancel, exportCsv };
