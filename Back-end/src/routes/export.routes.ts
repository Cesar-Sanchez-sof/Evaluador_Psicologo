import { Router } from 'express';
import {
  handleExportCsv,
  handleExportGrades,
  handleExportJson,
  handleGetSections,
} from '../controllers/export.controller.js';

export const exportRouter = Router();

exportRouter.get('/secciones', handleGetSections);
exportRouter.get('/notas', handleExportGrades);
exportRouter.get('/csv', handleExportCsv);
exportRouter.get('/json', handleExportJson);
