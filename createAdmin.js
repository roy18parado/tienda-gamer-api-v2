// CreateAdmin.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    const username = 'admin';
    const plainPassword = 'admin123';
    const hashed = await bcrypt.hash(plainPassword, 10);

    await pool.query('DELETE FROM usuarios WHERE username = $1', [username]);
    await pool.query(
      'INSERT INTO usuarios (username, password, role) VALUES ($1, $2, $3)',
      [username, hashed, 'super']
    );

    console.log(`✅ Super creado: ${username} / ${plainPassword}`);
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error CreateAdmin:', err.message);
    process.exit(1);
  }
})();
