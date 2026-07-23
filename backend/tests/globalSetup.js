const path = require('path');
const { Client } = require('pg');

module.exports = async () => {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') });

  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.test.example to .env.test and fill in a test database URL.'
    );
  }

  const dbUrl = new URL(process.env.DATABASE_URL);
  const dbName = dbUrl.pathname.replace('/', '');

  const adminUrl = new URL(process.env.DATABASE_URL);
  adminUrl.pathname = '/postgres';
  const adminClient = new Client({ connectionString: adminUrl.toString() });
  await adminClient.connect();

  const { rows } = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (rows.length === 0) {
    await adminClient.query(`CREATE DATABASE "${dbName}"`);
  }
  await adminClient.end();

  const { execSync } = require('child_process');
  execSync('npx prisma migrate reset --force --skip-seed', {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env },
    stdio: 'inherit',
  });
};