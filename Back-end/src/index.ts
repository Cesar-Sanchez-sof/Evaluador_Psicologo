import { createApp } from './app.js';
import { pool, testDatabaseConnection } from './config/database.js';
import { env } from './config/env.js';

const app = createApp();

const server = app.listen(env.PORT, async () => {
  console.log(`[API] Servidor escuchando en http://localhost:${env.PORT} (${env.NODE_ENV})`);
  try {
    const dbInfo = await testDatabaseConnection();
    console.log(`[DB] Conectado a PostgreSQL -> ${dbInfo.database} (${env.DB_HOST}:${env.DB_PORT})`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[DB] Advertencia: aún no se pudo conectar a PostgreSQL (${message})`);
  }
});

async function shutdown(signal: string) {
  console.log(`[API] Recibida señal ${signal}, cerrando servidor...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
