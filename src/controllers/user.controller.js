const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

const getAll = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, nama, email, role, is_active, created_at FROM users ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data pengguna' });
  }
};

const create = async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;
    if (!nama || !email || !password) return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    const [exist] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (exist.length) return res.status(409).json({ success: false, message: 'Email sudah digunakan' });
    const hashed = await bcrypt.hash(password, 12);
    const [result] = await pool.execute('INSERT INTO users (nama, email, password, role) VALUES (?,?,?,?)', [nama, email, hashed, role || 'kasir']);
    const [newUser] = await pool.execute('SELECT id, nama, email, role, is_active, created_at FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Pengguna berhasil ditambahkan', data: newUser[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menambahkan pengguna' });
  }
};

const update = async (req, res) => {
  try {
    const { nama, email, role, is_active } = req.body;
    await pool.execute('UPDATE users SET nama=?, email=?, role=?, is_active=? WHERE id=?', [nama, email, role, is_active, req.params.id]);
    const [updated] = await pool.execute('SELECT id, nama, email, role, is_active, created_at FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Pengguna berhasil diperbarui', data: updated[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui pengguna' });
  }
};

const remove = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun sendiri' });
    await pool.execute('UPDATE users SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Pengguna berhasil dinonaktifkan' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus pengguna' });
  }
};

module.exports = { getAll, create, update, remove };
