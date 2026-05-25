const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:NutanSupaBase%40123@db.buphnvajvygxcafjhzvt.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

console.log("Testing direct connection to db.buphnvajvygxcafjhzvt.supabase.co...");
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('[FAILED] Direct connection error:', err.message);
  } else {
    console.log('[SUCCESS] Direct connection working! Response:', res.rows[0]);
  }
  pool.end();
});
