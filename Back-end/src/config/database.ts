import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg';
import { env } from './env.js';

export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]', err.message);
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

/**
 * Ejecuta un bloque de operaciones dentro de una transacción PostgreSQL atómica.
 */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function testDatabaseConnection(): Promise<{ database: string; serverTime: string }> {
  const result = await pool.query<{ database: string; server_time: string }>(
    'SELECT current_database() AS database, NOW()::text AS server_time',
  );
  return {
    database: result.rows[0].database,
    serverTime: result.rows[0].server_time,
  };
}
