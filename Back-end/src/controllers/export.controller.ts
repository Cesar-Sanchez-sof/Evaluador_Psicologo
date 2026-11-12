import type { NextFunction, Request, Response } from 'express';
import { buildCsv, getExportDataset } from '../services/export.service.js';

function exportFilename(extension: 'csv' | 'json'): string {
  const date = new Date().toISOString().slice(0, 10);
  return `dataset_evaluador_psicologo_${date}.${extension}`;
}

/**
 * GET /api/export/csv
 * Descarga el dataset plano (una fila por estudiante) listo para Pandas.
 */
export async function handleExportCsv(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { columns, rows } = await getExportDataset();
    const csv = buildCsv(rows, columns);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${exportFilename('csv')}"`);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/export/json
 * Respaldo equivalente al CSV: arreglo plano de objetos (uno por estudiante).
 */
export async function handleExportJson(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { rows } = await getExportDataset();

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${exportFilename('json')}"`);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}
