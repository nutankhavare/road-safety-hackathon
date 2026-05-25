const { Pool } = require('pg');

const regions = [
  'us-east-1',      // N. Virginia
  'us-east-2',      // Ohio
  'us-west-1',      // N. California
  'us-west-2',      // Oregon
  'ca-central-1',   // Canada
  'eu-central-1',   // Frankfurt
  'eu-west-1',      // Ireland
  'eu-west-2',      // London
  'eu-west-3',      // Paris
  'ap-south-1',      // Mumbai
  'ap-southeast-1',  // Singapore
  'ap-southeast-2',  // Sydney
  'ap-northeast-1',  // Tokyo
  'ap-northeast-2',  // Seoul
  'sa-east-1'       // Sao Paulo
];

async function testConnections() {
  for (const region of regions) {
    const connStr = `postgresql://postgres.buphnvajvygxcafjhzvt:NutanSupaBase%40123@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
    console.log(`Testing region: ${region}...`);
    
    const pool = new Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000
    });
    
    try {
      const res = await pool.query('SELECT NOW()');
      console.log(`\n🎉 [SUCCESS] CONNECTED IN REGION: ${region} !!!\n`);
      console.log('Database time:', res.rows[0]);
      await pool.end();
      process.exit(0);
    } catch (err) {
      if (err.message.includes('not found') || err.message.includes('ENOTFOUND')) {
        // Tenant not in this region
        console.log(`[NOT IN REGION] ${region}`);
      } else {
        // Correct region, but maybe a password error or connection error?
        console.log(`[CORRECT REGION OR OTHER ERROR in ${region}]:`, err.message);
      }
      await pool.end();
    }
  }
  console.log("All regions checked.");
}

testConnections();
