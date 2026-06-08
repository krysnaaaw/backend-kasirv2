const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
    }
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [email.toLowerCase().trim()]
    );
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }
    const token = generateToken(user);
    const { password: _, ...userData } = user;
    res.json({
      success: true,
      message: 'Login berhasil',
      data: { token, user: userData }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const register = async (req, res) => {
  try {
    const { nama, email, password, role = 'kasir' } = req.body;
    if (!nama || !email || !password) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
    }
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Email sudah digunakan' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const validRole = ['admin', 'kasir'].includes(role) ? role : 'kasir';
    const [result] = await pool.execute(
      'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
      [nama.trim(), email.toLowerCase().trim(), hashedPassword, validRole]
    );
    const [newUser] = await pool.execute(
      'SELECT id, nama, email, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json({ success: true, message: 'Akun berhasil dibuat', data: newUser[0] });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const me = async (req, res) => {
  res.json({ success: true, data: req.user });
};

const changePassword = async (req, res) => {
  try {
    const { password_lama, password_baru } = req.body;
    if (!password_lama || !password_baru) {
      return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi' });
    }
    if (password_baru.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter' });
    }
    const [rows] = await pool.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(password_lama, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Password lama salah' });
    }
    const hashed = await bcrypt.hash(password_baru, 12);
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

module.exports = { login, register, me, changePassword };
