import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log('[DB] Initializing database connection pool...');
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 10000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('[DB] New client connected');
});

console.log('[DB] Creating drizzle instance...');
export const db = drizzle(pool, { schema });
console.log('[DB] Database initialized successfully');

