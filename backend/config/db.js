require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  user: process.env.DATABASE_URL ? undefined : 'postgres',
  password: process.env.DATABASE_URL ? undefined : (process.env.DATABASE_PASSWORD || 'NutanSupaBase@123'),
  host: process.env.DATABASE_URL ? undefined : 'db.buphnvajvygxcafjhzvt.supabase.co',
  port: process.env.DATABASE_URL ? undefined : 5432,
  database: process.env.DATABASE_URL ? undefined : 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

// Diagnostic logging for host
let connectionHost = 'db.buphnvajvygxcafjhzvt.supabase.co (Fallback)';
if (process.env.DATABASE_URL) {
  try {
    const match = process.env.DATABASE_URL.match(/@([^/:]+)/);
    if (match && match[1]) {
      connectionHost = match[1];
    } else {
      connectionHost = 'DATABASE_URL (Found but unparseable)';
    }
  } catch (e) {
    connectionHost = 'DATABASE_URL (Error parsing)';
  }
}
console.log('--- DATABASE DIAGNOSTIC INFO ---');
console.log('Attempting connection to host:', connectionHost);
console.log('DATABASE_URL is set:', !!process.env.DATABASE_URL);
console.log('DATABASE_PASSWORD is set:', !!process.env.DATABASE_PASSWORD);
console.log('--------------------------------');

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to Supabase PostgreSQL:', err.message);
  } else {
    console.log('Successfully connected to Supabase PostgreSQL database.');
  }
});

module.exports = pool;
