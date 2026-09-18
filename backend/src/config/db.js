const { Pool } = require('pg');
require('dotenv').config();

let pool;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim()) {
  const dbUrl = process.env.DATABASE_URL.trim();
  const isCloud = dbUrl.includes('neon.tech') || dbUrl.includes('supabase') || dbUrl.includes('render.com') || dbUrl.includes('sslmode=require');
  
  // Pass connectionString explicitly and enable SSL for cloud databases
  pool = new Pool({
    connectionString: dbUrl,
    ssl: isCloud || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} else {
  // Local development pool config
  pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'placement_db',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5433,
  });
}

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
