require('dotenv').config();
const { Pool } = require('pg');
const dns = require('dns');

// Force IPv4 resolution to prevent ENETUNREACH on cloud platforms like Render
dns.setDefaultResultOrder('ipv4first');

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

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to Supabase PostgreSQL:', err.message);
  } else {
    console.log('Successfully connected to Supabase PostgreSQL database.');
  }
});

module.exports = pool;
