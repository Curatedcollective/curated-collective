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
      // Ensure there's a user with id '1' and email 'cocoraec@gmail.com'
      const targetId = '1';
      const email = 'cocoraec@gmail.com';

      const exists = await client.query("SELECT id FROM users WHERE id = $1", [targetId]);
      if (exists.rowCount > 0) {
        console.log('Admin user already exists with id=1');
        return;
      }

      const byEmail = await client.query("SELECT id FROM users WHERE email = $1", [email]);
      if (byEmail.rowCount === 0) {
        await client.query(
          "INSERT INTO users(id, email, first_name, last_name, created_at, updated_at) VALUES ($1,$2,$3,$4,now(),now())",
          [targetId, email, 'Coco', 'Rae']
        );
        console.log('Inserted admin user with id=1');
      } else {
        const oldId = byEmail.rows[0].id;
        console.log('User with that email exists, updating id', oldId, '->', targetId);
        // Update the id to '1'
        await client.query('UPDATE users SET id=$1 WHERE id=$2', [targetId, oldId]);
        console.log('Updated existing user id to 1');
      }
    } finally {
      client.release();
      await pool.end();
    }
  } catch (err) {
    console.error('Error ensuring admin user:', err);
    process.exit(1);
  }
})();
