import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: Set DATABASE_URL before running this script.');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

const SQL = `
CREATE TABLE IF NOT EXISTS "session" (
  sid text PRIMARY KEY,
  sess jsonb NOT NULL,
  expire timestamp NOT NULL
);
`;

async function run() {
  const client = await pool.connect();
  try {
    console.log('Creating session table if missing...');
    await client.query(SQL);
    console.log('Done. session table ensured.');
  } catch (err) {
    console.error('Failed to create session table:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
