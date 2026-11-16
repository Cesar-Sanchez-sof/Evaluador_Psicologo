import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { exportRouter } from './routes/export.routes.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Permitir peticiones sin header Origin (como curl, mobile apps, Postman)
        if (!origin) return callback(null, true);

        // Si se especificó '*' o el origen está explícitamente en la lista
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Permitir automáticamente cualquier subdominio de Vercel y localhost
        if (
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          origin.endsWith('.vercel.app') ||
          origin.endsWith('.onrender.com')
        ) {
          return callback(null, true);
        }

        // Permitir por defecto para evitar bloqueos innecesarios en producción
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    }),
  );

  app.use(express.json({ limit: '1mb' }));

  app.use('/api/export', exportRouter);
  app.use('/api', apiRouter);

  app.use((_req, res) => {
    res.status(404).json({ ok: false, error: 'Ruta no encontrada' });
  });

  app.use(errorHandler);

  return app;
}
