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
  const env = loadEnv('.env');
  const connectionString = env.DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not found');
    process.exit(1);
  }
  const pool = new Pool({ connectionString });
  const client = await pool.connect();
  try {
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name ILIKE '%session%'");
    console.log('found tables:', tables.rows.map(r => r.table_name));
    const res1 = await client.query('SELECT sid, sess, expire FROM "session" ORDER BY expire DESC LIMIT 10');
    console.log('session rows:', res1.rows);
    const res2 = await client.query('SELECT sid, sess, expire FROM "sessions" ORDER BY expire DESC LIMIT 10');
    console.log('sessions (plural) rows:', res2.rows);
  } catch (err) {
    console.error('Query error:', err);
  } finally {
    client.release();
    await pool.end();
  }
})();
