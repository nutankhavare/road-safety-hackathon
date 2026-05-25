require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: process.env.DATABASE_PASSWORD || 'NutanSupaBase@123',
  host: 'db.buphnvajvygxcafjhzvt.supabase.co',
  port: 5432,
  database: 'postgres',
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
