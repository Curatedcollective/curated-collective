const fs = require('fs');
const { Pool } = require('pg');

function loadEnv(path = '.env') {
  if (!fs.existsSync(path)) return {};
  const src = fs.readFileSync(path, 'utf8');
  const lines = src.split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*("?)(.*)\2\s*$/);
    if (m) env[m[1]] = m[3];
  }
  return env;
}

(async () => {
  try {
    const env = loadEnv('.env');
    const connectionString = env.DATABASE_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      console.error('DATABASE_URL not found in .env or environment');
      process.exit(1);
    }

    const pool = new Pool({ connectionString });
    console.log('Connecting to database...');
    const client = await pool.connect();
    try {
      const sql = `
        CREATE TABLE IF NOT EXISTS "session" (
          sid TEXT PRIMARY KEY,
          sess JSONB NOT NULL,
          expire TIMESTAMP NOT NULL
        );
      `;
      await client.query(sql);
      console.log('Session table ensured.');
    } finally {
      client.release();
      await pool.end();
    }
  } catch (err) {
    console.error('Error creating session table:', err);
    process.exit(1);
  }
})();
