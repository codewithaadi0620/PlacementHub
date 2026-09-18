const { Pool } = require('pg');
require('dotenv').config();

let pool;

const dbUrl = (process.env.DATABASE_URL || '').trim();

if (dbUrl) {
  const isCloud = dbUrl.includes('neon.tech') || dbUrl.includes('supabase') || dbUrl.includes('render.com') || dbUrl.includes('sslmode=require');
  
  pool = new Pool({
    connectionString: dbUrl,
    ssl: isCloud || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000
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
    console.error('Unexpected error on idle PostgreSQL client:', err.message);
  });
}

// Resilient query wrapper with automatic 1-time retry for Neon serverless wakeups
const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (err) {
    if (
      err.code === 'ECONNRESET' ||
      err.code === '57P01' ||
      (err.message && (err.message.includes('terminated') || err.message.includes('closed') || err.message.includes('reset')))
    ) {
      console.warn('⚠️ DB Connection reset by Neon endpoint, retrying query...', err.message);
      return await pool.query(text, params);
    }
    throw err;
  }
};

module.exports = {
  query,
  pool
};
