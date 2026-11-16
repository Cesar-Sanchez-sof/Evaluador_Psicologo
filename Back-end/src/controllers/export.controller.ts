import type { NextFunction, Request, Response } from 'express';
import {
  buildCsv,
  generateGradesCsv,
  generateGradesExcel,
  getExportDataset,
  getGradesReportData,
  getSectionsList,
} from '../services/export.service.js';

function sanitizeSlug(value: string | undefined): string {
  if (!value || value.trim().toLowerCase() === 'todas') return 'todas';
  return value.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
}

function exportDatasetFilename(extension: 'csv' | 'json', seccion?: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const secSlug = sanitizeSlug(seccion);
  return `dataset_evaluador_psicologo_${secSlug}_${date}.${extension}`;
}

function exportGradesFilename(extension: 'xlsx' | 'csv', seccion?: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const secSlug = sanitizeSlug(seccion);
  return `reporte_notas_${secSlug}_${date}.${extension}`;
}

/**
 * GET /api/export/secciones
 * Devuelve la lista de secciones registradas en la base de datos.
 */
export async function handleGetSections(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const secciones = await getSectionsList();
    res.status(200).json({ ok: true, data: secciones });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/export/notas
 * Exporta el consolidado de notas oficiales (escala 0-20) y resultados vocacionales.
 * Query params:
 *   - `seccion`: 'todas' o nombre de la sección (ej. 'A', '5.° B').
 *   - `format`: 'xlsx' (por defecto) o 'csv'.
 */
export async function handleExportGrades(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const seccion = typeof req.query.seccion === 'string' ? req.query.seccion : undefined;
    const format = req.query.format === 'csv' ? 'csv' : 'xlsx';
    const rows = await getGradesReportData(seccion);

    if (format === 'csv') {
      const csv = generateGradesCsv(rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${exportGradesFilename('csv', seccion)}"`,
      );
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).send(csv);
      return;
    }

    const buffer = await generateGradesExcel(rows, seccion);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${exportGradesFilename('xlsx', seccion)}"`,
    );
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(buffer);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/export/csv
 * Descarga el dataset plano (una fila por estudiante) listo para Pandas.
 * Admite filtro opcional por `?seccion=...`.
 */
export async function handleExportCsv(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const seccion = typeof req.query.seccion === 'string' ? req.query.seccion : undefined;
    const { columns, rows } = await getExportDataset(seccion);
    const csv = buildCsv(rows, columns);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${exportDatasetFilename('csv', seccion)}"`,
    );
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/export/json
 * Respaldo equivalente al CSV: arreglo plano de objetos (uno por estudiante).
 * Admite filtro opcional por `?seccion=...`.
 */
export async function handleExportJson(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const seccion = typeof req.query.seccion === 'string' ? req.query.seccion : undefined;
    const { rows } = await getExportDataset(seccion);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${exportDatasetFilename('json', seccion)}"`,
    );
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}
