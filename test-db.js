import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function testConnection() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully');

    console.log('Running test query...');
    const result = await client.query('SELECT 1 as test');
    console.log('Query successful:', result.rows);

    await client.end();
    console.log('Connection closed');
  } catch (error) {
    console.error('Database test failed:', error);
    process.exit(1);
  }
}

testConnection();