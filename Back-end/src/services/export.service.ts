import { query } from '../config/database.js';

/**
 * Módulo de exportación del Dataset para el modelo CatBoost.
 *
 * Genera una fila "plana" por estudiante (última evaluación evaluada/revisada),
 * lista para `pandas.read_csv()`:
 *   - Datos generales
 *   - Respuestas crudas P1.1 .. P6.6 (las de opción múltiple se unen por comas)
 *   - Puntajes consolidados por sección + perfil psicométrico
 *   - Puntaje total de cada una de las 10 áreas vocacionales
 *   - Variables objetivo: primera_opcion / segunda_opcion (código de área)
 */

const VOCATIONAL_AREA_CODES = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
] as const;

const S3_CODES = Array.from({ length: 9 }, (_, i) => `P3.${i + 1}`);
const S4_CODES = Array.from({ length: 18 }, (_, i) => `P4.${i + 1}`);

export type ExportRow = Record<string, string | number | null>;

interface ExportQueryRow {
  id_estudiante: string;
  edad_opcion: string;
  edad_exacta: number | null;
  sexo: string;
  seccion: string;
  primera_opcion_codigo: string;
  segunda_opcion_codigo: string;
  total_s2: number;
  nivel_psicometrico: string;
  respuestas: Record<string, string> | null;
  areas: Record<string, number> | null;
}

/**
 * Última evaluación con resultado calculado por estudiante.
 * Se excluyen las que no llegaron a `evaluada`/`revisada` para no dejar el target vacío.
 */
const EXPORT_QUERY = `
WITH ultima_evaluacion AS (
    SELECT DISTINCT ON (ev.estudiante_id)
           ev.id AS evaluacion_id,
           ev.estudiante_id
    FROM evaluaciones ev
    WHERE EXISTS (
        SELECT 1 FROM resultados_evaluacion re WHERE re.evaluacion_id = ev.id
    )
    ORDER BY ev.estudiante_id, ev.created_at DESC, ev.id DESC
),
respuestas_agg AS (
    SELECT
        r.evaluacion_id,
        p.codigo,
        CASE
            WHEN p.tipo_respuesta = 'likert_1_5' THEN MAX(r.valor_likert)::text
            ELSE string_agg(DISTINCT r.codigo_opcion, ',' ORDER BY r.codigo_opcion)
        END AS valor
    FROM respuestas_cuestionario r
    JOIN preguntas p ON p.id = r.pregunta_id
    GROUP BY r.evaluacion_id, p.codigo, p.tipo_respuesta
),
respuestas_json AS (
    SELECT evaluacion_id, jsonb_object_agg(codigo, valor) AS respuestas
    FROM respuestas_agg
    GROUP BY evaluacion_id
),
areas_json AS (
    SELECT evaluacion_id, jsonb_object_agg(area_codigo, total_area) AS areas
    FROM resultados_detalle_area
    GROUP BY evaluacion_id
)
SELECT
    est.id                       AS id_estudiante,
    est.edad_opcion              AS edad_opcion,
    est.edad_exacta              AS edad_exacta,
    est.sexo                     AS sexo,
    est.seccion                  AS seccion,
    re.primera_opcion_codigo     AS primera_opcion_codigo,
    re.segunda_opcion_codigo     AS segunda_opcion_codigo,
    re.total_s2                  AS total_s2,
    re.nivel_psicometrico        AS nivel_psicometrico,
    COALESCE(rj.respuestas, '{}'::jsonb) AS respuestas,
    COALESCE(aj.areas, '{}'::jsonb)      AS areas
FROM ultima_evaluacion ue
JOIN estudiantes est               ON est.id = ue.estudiante_id
JOIN resultados_evaluacion re      ON re.evaluacion_id = ue.evaluacion_id
LEFT JOIN respuestas_json rj       ON rj.evaluacion_id = ue.evaluacion_id
LEFT JOIN areas_json aj            ON aj.evaluacion_id = ue.evaluacion_id
ORDER BY est.id ASC
`;

function toLikert(answers: Record<string, string>, code: string): number {
  const value = Number(answers[code]);
  return Number.isFinite(value) ? value : 0;
}

function toOptionList(answers: Record<string, string>, code: string): string[] {
  const value = answers[code];
  if (typeof value !== 'string' || value === '') return [];
  return value.split(',');
}

function sumLikert(answers: Record<string, string>, codes: string[]): number {
  return codes.reduce((acc, code) => acc + toLikert(answers, code), 0);
}

function resolveAge(edadOpcion: string | null, edadExacta: number | null): number | null {
  if (edadExacta !== null && edadExacta !== undefined) return edadExacta;
  const match = /^(\d+)/.exec(edadOpcion ?? '');
  return match ? Number(match[1]) : null;
}

function buildExportRow(
  questionCodes: string[],
  raw: ExportQueryRow,
): ExportRow {
  const answers = raw.respuestas ?? {};
  const areas = raw.areas ?? {};

  const optionsP11 = toOptionList(answers, 'P1.1');
  const optionsP12 = toOptionList(answers, 'P1.2');

  // Puntajes consolidados por sección (misma lógica de la Plantilla de Corrección):
  // S1: +1 por opción de P1.1, -1 por opción de P1.2, más los Likert P1.3–P1.6.
  const ptosS1 =
    optionsP11.length -
    optionsP12.length +
    toLikert(answers, 'P1.3') +
    toLikert(answers, 'P1.4') +
    toLikert(answers, 'P1.5') +
    toLikert(answers, 'P1.6');
  const ptosS3 = sumLikert(answers, S3_CODES);
  const ptosS4 = sumLikert(answers, S4_CODES);
  // Cada hobby puntuable vale +3 y las tres preguntas son obligatorias.
  const ptosS5 = ['P5.1', 'P5.2', 'P5.3'].reduce(
    (acc, code) => acc + (answers[code] ? 3 : 0),
    0,
  );
  const bonusS6 = answers['P6.6'] === 'd' ? 2 : 0;

  const row: ExportRow = {
    id_estudiante: Number(raw.id_estudiante),
    edad: resolveAge(raw.edad_opcion, raw.edad_exacta),
    sexo: raw.sexo,
    seccion: raw.seccion,
  };

  for (const code of questionCodes) {
    row[code] = answers[code] ?? '';
  }

  row.ptos_S1 = ptosS1;
  row.ptos_S3 = ptosS3;
  row.ptos_S4 = ptosS4;
  row.ptos_S5 = ptosS5;
  row.bonus_S6 = bonusS6;
  row.total_S2 = Number(raw.total_s2);
  row.nivel_S2 = raw.nivel_psicometrico;

  for (const areaCode of VOCATIONAL_AREA_CODES) {
    row[`puntaje_area_${areaCode}`] = Number(areas[areaCode] ?? 0);
  }

  row.primera_opcion = raw.primera_opcion_codigo;
  row.segunda_opcion = raw.segunda_opcion_codigo;

  return row;
}

export function buildExportColumns(questionCodes: string[]): string[] {
  return [
    'id_estudiante',
    'edad',
    'sexo',
    'seccion',
    ...questionCodes,
    'ptos_S1',
    'ptos_S3',
    'ptos_S4',
    'ptos_S5',
    'bonus_S6',
    'total_S2',
    'nivel_S2',
    ...VOCATIONAL_AREA_CODES.map((code) => `puntaje_area_${code}`),
    'primera_opcion',
    'segunda_opcion',
  ];
}

export interface ExportDataset {
  columns: string[];
  rows: ExportRow[];
}

export async function getExportDataset(): Promise<ExportDataset> {
  const [questionsRes, dataRes] = await Promise.all([
    query<{ codigo: string }>('SELECT codigo FROM preguntas ORDER BY orden ASC'),
    query<ExportQueryRow>(EXPORT_QUERY),
  ]);

  const questionCodes = questionsRes.rows.map((row) => row.codigo);

  return {
    columns: buildExportColumns(questionCodes),
    rows: dataRes.rows.map((row) => buildExportRow(questionCodes, row)),
  };
}

function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  // Comillas dobles, comas y saltos de línea obligan a entrecomillar el campo.
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/** Serializa el dataset a CSV RFC 4180 (UTF-8, sin BOM, CRLF). */
export function buildCsv(rows: ExportRow[], columns: string[]): string {
  const header = columns.map((column) => escapeCsvValue(column)).join(',');
  if (rows.length === 0) return `${header}\r\n`;

  const lines = rows.map((row) =>
    columns.map((column) => escapeCsvValue(row[column])).join(','),
  );

  return `${header}\r\n${lines.join('\r\n')}\r\n`;
}
