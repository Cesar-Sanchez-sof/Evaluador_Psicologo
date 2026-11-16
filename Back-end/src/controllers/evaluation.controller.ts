import type { NextFunction, Request, Response } from 'express';
import {
  createEvaluationSchema,
  previewScoreSchema,
  verdictSchema,
} from '../schemas/evaluation.schema.js';
import {
  createAndEvaluateSubmission,
  getEvaluationById,
  getQuestionnaireStructure,
  listEvaluations,
  recalculateEvaluation,
  savePsychologistVerdict,
} from '../services/evaluation.service.js';
import { evaluateQuestionnaire } from '../services/scoring.service.js';

function parseNumericId(rawId: string | string[] | undefined): number {
  const value = Array.isArray(rawId) ? rawId[0] : rawId;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('ID de evaluación inválido');
  }
  return id;
}

export async function handleGetStructure(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await getQuestionnaireStructure();
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
}

export async function handlePreviewEvaluation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { respuestas } = previewScoreSchema.parse(req.body);
    const resultado = evaluateQuestionnaire(respuestas);
    res.json({ ok: true, data: resultado });
  } catch (err) {
    next(err);
  }
}

export async function handleCreateEvaluation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = createEvaluationSchema.parse(req.body);
    const data = await createAndEvaluateSubmission(parsed);
    res.status(201).json({
      ok: true,
      message: 'Encuesta guardada y evaluada correctamente',
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function handleListEvaluations(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await listEvaluations();
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
}

export async function handleGetEvaluationById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseNumericId(req.params.id);
    const data = await getEvaluationById(id);
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
}

export async function handleRecalculateEvaluation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseNumericId(req.params.id);
    const data = await recalculateEvaluation(id);
    res.json({ ok: true, message: 'Evaluación recalculada correctamente', data });
  } catch (err) {
    next(err);
  }
}

export async function handleSaveVerdict(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseNumericId(req.params.id);
    const parsed = verdictSchema.parse(req.body);
    const data = await savePsychologistVerdict(id, parsed);
    res.json({
      ok: true,
      message: 'Veredicto del psicólogo guardado correctamente',
      data,
    });
  } catch (err) {
    next(err);
  }
}
