import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { NotFoundError } from '../services/evaluation.service.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      ok: false,
      error: 'Error de validación en los datos enviados',
      detalles: err.flatten(),
    });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({
      ok: false,
      error: err.message,
    });
    return;
  }

  // Errores conocidos de PostgreSQL (violación FK/UNIQUE/conexión)
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const pgErr = err as { code?: string; message?: string; detail?: string };
    if (pgErr.code === '23503' || pgErr.code === '23505' || pgErr.code === '22P02') {
      res.status(400).json({
        ok: false,
        error: 'Error de integridad o formato en base de datos',
        detail: pgErr.detail ?? pgErr.message,
      });
      return;
    }
    if (pgErr.code === 'ECONNREFUSED') {
      res.status(503).json({
        ok: false,
        error: 'No se pudo conectar con PostgreSQL. Verifica que el servicio esté activo y revisa .env.',
      });
      return;
    }
  }

  const message = err instanceof Error ? err.message : 'Error interno del servidor';
  console.error('[API Error]', err);
  res.status(500).json({
    ok: false,
    error: message,
  });
}
