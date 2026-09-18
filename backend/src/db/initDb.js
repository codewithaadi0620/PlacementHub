const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function initializeDatabase() {
  // First connect to default postgres database to ensure target placement_db exists
  const systemPool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
  });

  const dbName = process.env.PGDATABASE || 'placement_db';

  try {
    console.log(`🔍 Checking if database '${dbName}' exists...`);
    const res = await systemPool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rowCount === 0) {
      console.log(`⚙️ Creating database '${dbName}'...`);
      await systemPool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database '${dbName}' created successfully.`);
    } else {
      console.log(`ℹ️ Database '${dbName}' already exists.`);
    }
  } catch (err) {
    console.error('Error checking/creating database:', err.message);
  } finally {
    await systemPool.end();
  }

  // Connect to placement_db to execute schema & seed
  const appPool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: dbName,
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
  });

  try {
    console.log('📄 Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⚡ Executing schema SQL script...');
    await appPool.query(schemaSql);
    console.log('✅ Tables and constraints created successfully.');

    console.log('🌱 Reading seed.sql...');
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('⚡ Executing seed SQL script...');
    await appPool.query(seedSql);
    console.log('✅ Demo data inserted successfully.');
  } catch (err) {
    console.error('❌ Error executing database script:', err);
    process.exit(1);
  } finally {
    await appPool.end();
    console.log('🎉 Database initialization complete!');
  }
}

initializeDatabase();
