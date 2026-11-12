import { Router } from 'express';
import { handleExportCsv, handleExportJson } from '../controllers/export.controller.js';

export const exportRouter = Router();

exportRouter.get('/csv', handleExportCsv);
exportRouter.get('/json', handleExportJson);
