import { Router } from 'express';
import { testDatabaseConnection } from '../config/database.js';
import { evaluationRouter } from './evaluation.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', async (_req, res, next) => {
  try {
    const db = await testDatabaseConnection();
    res.json({
      ok: true,
      service: 'evaluador-psicologo-backend',
      database: db.database,
      serverTime: db.serverTime,
    });
  } catch (err) {
    next(err);
  }
});

apiRouter.use(evaluationRouter);
