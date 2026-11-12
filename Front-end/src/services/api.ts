import type {
  EvaluationDetail,
  EvaluationListItem,
  EvaluationScoringPreview,
  GeneralDataState,
  LikertGroupBlock,
  LikertScaleItem,
  LikertSubgroup,
  PsychologistVerdictState,
  QuestionnaireMeta,
  QuestionnaireSection,
  QuestionnaireStructure,
  SectionBlock,
  StudentAnswers,
  VocationalAreaOption,
} from '../types/questionnaire';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3001/api';

interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface BackendSectionRow {
  id: number;
  numero: number;
  codigo: string;
  titulo: string;
  instruccion: string;
  suma_puntaje: boolean;
}

interface BackendQuestionRow {
  id: number;
  seccion_id: number;
  codigo: string;
  subgrupo_codigo: string | null;
  subgrupo_nombre: string | null;
  enunciado: string;
  tipo_respuesta: 'opcion_unica' | 'opcion_multiple' | 'likert_1_5';
  es_puntuable: boolean;
  es_indicador_apoyo: boolean;
  orden: number;
}

interface BackendOptionRow {
  id: number;
  pregunta_id: number;
  codigo_opcion: string;
  texto_opcion: string;
  orden: number;
}

interface BackendAreaRow {
  codigo: string;
  nombre: string;
  ejemplos_cortos: string;
  carreras_afines: string;
}

interface BackendStructurePayload {
  meta: QuestionnaireMeta;
  escalaLikert: LikertScaleItem[];
  datosGenerales: {
    edades: string[];
    sexos: string[];
  };
  secciones: BackendSectionRow[];
  preguntas: BackendQuestionRow[];
  opciones: BackendOptionRow[];
  areasVocacionales: BackendAreaRow[];
}

const SECTION_SHORT_TITLES: Record<number, string> = {
  1: 'Rendimiento Académico',
  2: 'Perfil Psicométrico',
  3: 'Aptitudes Cognitivas',
  4: 'Modelo RIASEC',
  5: 'Intereses y Hobbies',
  6: 'Entorno Socioeconómico',
};

const LIKERT_PROMPT_BY_SECTION: Record<number, string> = {
  1: 'Indica tu grado de acuerdo con las siguientes afirmaciones (del 1 al 5):',
  2: 'Afirmaciones / Enunciados (escala del 1 al 5):',
  3: 'Afirmaciones / Enunciados (escala del 1 al 5):',
  4: 'Dimensiones del Modelo RIASEC (escala del 1 al 5):',
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.ok) {
    throw new Error(body.error || `Error HTTP ${response.status}`);
  }
  return body.data;
}

function buildSectionBlocks(
  sectionNumber: number,
  questions: BackendQuestionRow[],
  optionsByQuestionId: Map<number, BackendOptionRow[]>,
): SectionBlock[] {
  const blocks: SectionBlock[] = [];
  let currentLikertBlock: LikertGroupBlock | null = null;
  let subgroupByKey = new Map<string, LikertSubgroup>();

  const flushLikert = () => {
    if (currentLikertBlock) {
      blocks.push(currentLikertBlock);
      currentLikertBlock = null;
      subgroupByKey = new Map();
    }
  };

  for (const q of questions) {
    if (q.tipo_respuesta === 'likert_1_5') {
      if (!currentLikertBlock) {
        currentLikertBlock = {
          id: `s${sectionNumber}-likert`,
          type: 'likert_group',
          prompt: LIKERT_PROMPT_BY_SECTION[sectionNumber] ?? 'Escala del 1 al 5:',
          subgroups: [],
        };
      }

      const sgKey = q.subgrupo_codigo ?? `s${sectionNumber}-general`;
      let subgroup = subgroupByKey.get(sgKey);
      if (!subgroup) {
        subgroup = {
          id: sgKey,
          badge: q.subgrupo_codigo ?? undefined,
          title: q.subgrupo_nombre ?? undefined,
          items: [],
        };
        subgroupByKey.set(sgKey, subgroup);
        currentLikertBlock.subgroups.push(subgroup);
      }

      subgroup.items.push({
        id: q.codigo,
        code: q.codigo,
        statement: q.enunciado,
      });
    } else {
      flushLikert();
      const opts = (optionsByQuestionId.get(q.id) ?? []).map((opt) => ({
        code: opt.codigo_opcion,
        label: opt.texto_opcion,
      }));

      blocks.push({
        id: q.codigo,
        code: q.codigo,
        type: q.tipo_respuesta === 'opcion_multiple' ? 'multiple_choice' : 'single_choice',
        prompt: q.enunciado,
        note:
          q.tipo_respuesta === 'opcion_multiple'
            ? 'Puedes marcar una o más opciones'
            : sectionNumber >= 5
              ? 'Marca solo una'
              : undefined,
        options: opts,
      });
    }
  }

  flushLikert();
  return blocks;
}

export async function fetchQuestionnaireStructure(): Promise<QuestionnaireStructure> {
  const payload = await requestJson<BackendStructurePayload>('/cuestionario/estructura');

  const optionsByQuestionId = new Map<number, BackendOptionRow[]>();
  for (const opt of payload.opciones) {
    const list = optionsByQuestionId.get(opt.pregunta_id) ?? [];
    list.push(opt);
    optionsByQuestionId.set(opt.pregunta_id, list);
  }

  const questionsBySectionId = new Map<number, BackendQuestionRow[]>();
  for (const q of payload.preguntas) {
    const list = questionsBySectionId.get(q.seccion_id) ?? [];
    list.push(q);
    questionsBySectionId.set(q.seccion_id, list);
  }

  const sections: QuestionnaireSection[] = payload.secciones
    .filter((sec) => sec.numero >= 1 && sec.numero <= 6)
    .map((sec) => ({
      id: `section-${sec.numero}`,
      number: sec.numero,
      title: sec.titulo,
      shortTitle: SECTION_SHORT_TITLES[sec.numero] ?? sec.titulo,
      instruction: sec.instruccion,
      blocks: buildSectionBlocks(
        sec.numero,
        questionsBySectionId.get(sec.id) ?? [],
        optionsByQuestionId,
      ),
    }));

  const vocationalAreas: VocationalAreaOption[] = payload.areasVocacionales.map((area) => ({
    code: area.codigo,
    name: area.nombre,
    examples: area.ejemplos_cortos,
    careers: area.carreras_afines,
  }));

  return {
    meta: payload.meta,
    likertScale: payload.escalaLikert,
    ageOptions: payload.datosGenerales.edades,
    sexOptions: payload.datosGenerales.sexos,
    sections,
    vocationalAreas,
  };
}

function resolveAgeExact(ageOption: string, ageOther: string): number | null {
  if (ageOption === 'Otro') {
    const parsed = Number.parseInt(ageOther, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const match = ageOption.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : null;
}

export async function previewEvaluation(
  answers: StudentAnswers,
): Promise<EvaluationScoringPreview> {
  return requestJson<EvaluationScoringPreview>('/evaluaciones/calcular-preview', {
    method: 'POST',
    body: JSON.stringify({
      respuestas: answers,
    }),
  });
}

export async function submitEvaluation(
  generalData: GeneralDataState,
  answers: StudentAnswers,
): Promise<EvaluationDetail> {
  return requestJson<EvaluationDetail>('/evaluaciones', {
    method: 'POST',
    body: JSON.stringify({
      estudiante: {
        nombresApellidos: generalData.fullName.trim(),
        edadOpcion: generalData.ageOption,
        edadExacta: resolveAgeExact(generalData.ageOption, generalData.ageOther),
        sexo: generalData.sex,
        seccion: generalData.sectionName.trim(),
      },
      respuestas: answers,
    }),
  });
}

export async function fetchEvaluations(): Promise<EvaluationListItem[]> {
  return requestJson<EvaluationListItem[]>('/evaluaciones');
}

export async function fetchEvaluationDetail(evaluacionId: number | string): Promise<EvaluationDetail> {
  return requestJson<EvaluationDetail>(`/evaluaciones/${evaluacionId}`);
}

export async function savePsychologistVerdict(
  evaluacionId: number | string,
  verdict: PsychologistVerdictState,
): Promise<EvaluationDetail> {
  return requestJson<EvaluationDetail>(`/evaluaciones/${evaluacionId}/veredicto`, {
    method: 'PUT',
    body: JSON.stringify({
      psicologoEvaluador: verdict.evaluatorName.trim(),
      cpspNumero: verdict.cpspNumber.trim() || undefined,
      fechaEvaluacion: verdict.evaluationDate || undefined,
      areaPrimeraOpcionCodigo: verdict.recommendedAreaCode,
      areaSegundaOpcionCodigo: verdict.secondAreaCode || undefined,
      esVocacionDual: Boolean(verdict.isDualVocation),
      areaDualCodigo: verdict.dualAreaCode || undefined,
      observacionesPsicopedagogicas: verdict.observations.trim() || undefined,
    }),
  });
}

export type ExportFormat = 'csv' | 'json';

/**
 * URL directa de descarga del dataset (Back-end /api/export/:format).
 * Se usa con `window.open` para que el navegador gestione la descarga.
 */
export function buildExportUrl(format: ExportFormat): string {
  return `${API_BASE_URL}/export/${format}`;
}
