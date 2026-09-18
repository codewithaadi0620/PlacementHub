const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production' || (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost'));

// Create PostgreSQL connection pool
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'placement_db',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5433,
};

if (isProduction) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
