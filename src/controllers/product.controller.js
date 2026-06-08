const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const generateBarcode = () => {
  return Date.now().toString().slice(-12).padStart(13, '0');
};

const generateKode = async () => {
  const [rows] = await pool.execute('SELECT COUNT(*) as count FROM products');
  const count = rows[0].count + 1;
  return `PRD-${String(count).padStart(3, '0')}`;
};

// GET ALL
const getAll = async (req, res) => {
  try {
    const { search = '', category_id = '', status = '', page = 1, limit = 10, sort = 'id', order = 'DESC' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const allowed = ['id', 'nama_produk', 'harga_jual', 'stok', 'created_at'];
    const sortCol = allowed.includes(sort) ? sort : 'id';
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';
    let where = ['p.is_active = 1'];
    const params = [];
    if (search) { where.push('(p.nama_produk LIKE ? OR p.kode_produk LIKE ? OR p.barcode LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (category_id) { where.push('p.category_id = ?'); params.push(category_id); }
    if (status === 'aman') where.push('p.stok > p.stok_minimum');
    else if (status === 'hampir') where.push('p.stok > 0 AND p.stok <= p.stok_minimum');
    else if (status === 'habis') where.push('p.stok = 0');
    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereStr}`,
      params
    );
    const total = countRows[0].total;
    const [rows] = await pool.execute(
      `SELECT p.*, c.nama as kategori_nama FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereStr} ORDER BY p.${sortCol} ${sortOrder} LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );
    res.json({ success: true, data: rows, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data produk' });
  }
};

// GET ONE
const getOne = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT p.*, c.nama as kategori_nama FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ? AND p.is_active = 1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data produk' });
  }
};

// GET BY BARCODE
const getByBarcode = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT p.*, c.nama as kategori_nama FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.barcode = ? AND p.is_active = 1',
      [req.params.barcode]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mencari produk' });
  }
};

// CREATE
const create = async (req, res) => {
  try {
    const { category_id, nama_produk, deskripsi, harga_beli, harga_jual, stok, stok_minimum, satuan } = req.body;
    if (!category_id || !nama_produk || !harga_jual) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Kategori, nama produk, dan harga jual wajib diisi' });
    }
    const kode_produk = await generateKode();
    const barcode = generateBarcode();
    const gambar = req.file ? req.file.filename : null;
    const [result] = await pool.execute(
      'INSERT INTO products (category_id, kode_produk, nama_produk, deskripsi, harga_beli, harga_jual, stok, stok_minimum, satuan, barcode, gambar) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [category_id, kode_produk, nama_produk, deskripsi || null, harga_beli || 0, harga_jual, stok || 0, stok_minimum || 5, satuan || 'pcs', barcode, gambar]
    );
    const [newProd] = await pool.execute(
      'SELECT p.*, c.nama as kategori_nama FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [result.insertId]
    );
    res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan', data: newProd[0] });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Kode produk atau barcode sudah ada' });
    res.status(500).json({ success: false, message: 'Gagal menambahkan produk' });
  }
};

// UPDATE
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.execute('SELECT * FROM products WHERE id = ? AND is_active = 1', [id]);
    if (!existing.length) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }
    const prod = existing[0];
    const { category_id, nama_produk, deskripsi, harga_beli, harga_jual, stok, stok_minimum, satuan } = req.body;
    let gambar = prod.gambar;
    if (req.file) {
      if (prod.gambar) {
        const oldPath = path.join(__dirname, '..', '..', 'uploads', prod.gambar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      gambar = req.file.filename;
    }
    await pool.execute(
      'UPDATE products SET category_id=?, nama_produk=?, deskripsi=?, harga_beli=?, harga_jual=?, stok=?, stok_minimum=?, satuan=?, gambar=? WHERE id=?',
      [category_id || prod.category_id, nama_produk || prod.nama_produk, deskripsi || prod.deskripsi, harga_beli ?? prod.harga_beli, harga_jual || prod.harga_jual, stok ?? prod.stok, stok_minimum ?? prod.stok_minimum, satuan || prod.satuan, gambar, id]
    );
    const [updated] = await pool.execute(
      'SELECT p.*, c.nama as kategori_nama FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [id]
    );
    res.json({ success: true, message: 'Produk berhasil diperbarui', data: updated[0] });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui produk' });
  }
};

// DELETE (soft delete)
const remove = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id FROM products WHERE id = ? AND is_active = 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    await pool.execute('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus produk' });
  }
};

// LOW STOCK
const getLowStock = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT p.*, c.nama as kategori_nama FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1 AND p.stok <= p.stok_minimum ORDER BY p.stok ASC'
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data stok rendah' });
  }
};

module.exports = { getAll, getOne, getByBarcode, create, update, remove, getLowStock };
