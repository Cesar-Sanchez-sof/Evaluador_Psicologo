import { Router } from 'express';
import {
  handleCreateEvaluation,
  handleGetEvaluationById,
  handleGetStructure,
  handleListEvaluations,
  handlePreviewEvaluation,
  handleRecalculateEvaluation,
  handleSaveVerdict,
} from '../controllers/evaluation.controller.js';

export const evaluationRouter = Router();

evaluationRouter.get('/cuestionario/estructura', handleGetStructure);

evaluationRouter.post('/evaluaciones/calcular-preview', handlePreviewEvaluation);
evaluationRouter.get('/evaluaciones', handleListEvaluations);
evaluationRouter.post('/evaluaciones', handleCreateEvaluation);
evaluationRouter.get('/evaluaciones/:id', handleGetEvaluationById);
evaluationRouter.post('/evaluaciones/:id/recalcular', handleRecalculateEvaluation);
evaluationRouter.put('/evaluaciones/:id/veredicto', handleSaveVerdict);
