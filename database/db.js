// database/db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'myappdb',
  password: 'Welcome2025!',
  port: 5432,
});

// Test connection once
(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
})();

export default pool;
