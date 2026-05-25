require('dotenv').config();
const { Pool } = require('pg');
const dns = require('dns');

// Force ALL DNS lookups to use IPv4 only
// This fixes ENETUNREACH errors on Render's free tier which cannot reach IPv6 addresses
const origLookup = dns.lookup;
dns.lookup = function(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = { family: 4 };
  } else if (typeof options === 'number') {
    options = { family: 4 };
  } else {
    options = Object.assign({}, options, { family: 4 });
  }
  return origLookup.call(this, hostname, options, callback);
};

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
