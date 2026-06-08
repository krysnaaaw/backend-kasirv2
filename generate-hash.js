/**
 * Jalankan script ini SATU KALI setelah import database:
 *   cd backend
 *   node generate-hash.js
 *
 * Script ini akan update password di tabel users secara otomatis.
 */

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'pos_klasik',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
  });

  const accounts = [
    { email: 'admin@posklasik.com', password: 'Admin123!' },
    { email: 'kasir@posklasik.com', password: 'password' },
    { email: 'budi@posklasik.com',  password: 'password' },
  ];

  console.log('\n🔐 Generating & updating password hashes...\n');

  for (const acc of accounts) {
    const hash = await bcrypt.hash(acc.password, 12);
    try {
      const [result] = await pool.execute(
        'UPDATE users SET password = ? WHERE email = ?',
        [hash, acc.email]
      );
      if (result.affectedRows > 0) {
        console.log(`✅ ${acc.email} → password: ${acc.password}`);
      } else {
        console.log(`⚠️  ${acc.email} tidak ditemukan di database`);
      }
    } catch (err) {
      console.error(`❌ Error update ${acc.email}:`, err.message);
    }
  }

  console.log('\n✅ Selesai! Sekarang bisa login dengan akun di atas.\n');
  await pool.end();
  process.exit(0);
}

run().catch(err => {
  console.error('\n❌ Gagal konek ke database:', err.message);
  console.log('\nPastikan:');
  console.log('  1. XAMPP MySQL sudah running');
  console.log('  2. Database pos_klasik sudah dibuat');
  console.log('  3. File backend/.env sudah dikonfigurasi\n');
  process.exit(1);
});
