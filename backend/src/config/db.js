const { Pool } = require('pg');
require('dotenv').config();

let pool;

const dbUrl = (process.env.DATABASE_URL || '').trim();

if (dbUrl) {
  const isCloud = dbUrl.includes('neon.tech') || dbUrl.includes('supabase') || dbUrl.includes('render.com') || dbUrl.includes('sslmode=require');
  
  pool = new Pool({
    connectionString: dbUrl,
    ssl: isCloud || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} else if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  console.error('DATABASE_URL is missing in environment variables');
  pool = {
    query: async () => {
      const err = new Error('DATABASE_URL environment variable is missing on Vercel. Please add DATABASE_URL in Vercel Project Settings -> Environment Variables.');
      err.status = 500;
      throw err;
    }
  };
} else {
  pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'placement_db',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5433,
  });
}

if (pool.on) {
  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
  });
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
