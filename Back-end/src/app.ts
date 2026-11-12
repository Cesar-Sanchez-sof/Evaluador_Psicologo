import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '1mb' }));

  app.use('/api', apiRouter);

  app.use((_req, res) => {
    res.status(404).json({ ok: false, error: 'Ruta no encontrada' });
  });

  app.use(errorHandler);

  return app;
}
