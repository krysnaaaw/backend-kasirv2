const { pool } = require('../config/database');

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT c.*, COUNT(p.id) as total_produk FROM categories c LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1 GROUP BY c.id ORDER BY c.nama ASC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data kategori' });
  }
};

const create = async (req, res) => {
  try {
    const { nama, deskripsi } = req.body;
    if (!nama) return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' });
    const [result] = await pool.execute('INSERT INTO categories (nama, deskripsi) VALUES (?, ?)', [nama.trim(), deskripsi || null]);
    const [newCat] = await pool.execute('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan', data: newCat[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menambahkan kategori' });
  }
};

const update = async (req, res) => {
  try {
    const { nama, deskripsi } = req.body;
    const [existing] = await pool.execute('SELECT id FROM categories WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    await pool.execute('UPDATE categories SET nama=?, deskripsi=? WHERE id=?', [nama.trim(), deskripsi || null, req.params.id]);
    const [updated] = await pool.execute('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Kategori berhasil diperbarui', data: updated[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui kategori' });
  }
};

const remove = async (req, res) => {
  try {
    const [products] = await pool.execute('SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_active = 1', [req.params.id]);
    if (products[0].count > 0) {
      return res.status(400).json({ success: false, message: 'Tidak dapat menghapus kategori yang masih memiliki produk aktif' });
    }
    await pool.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus kategori' });
  }
};

module.exports = { getAll, create, update, remove };
