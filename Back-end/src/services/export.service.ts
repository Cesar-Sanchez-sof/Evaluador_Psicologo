import ExcelJS from 'exceljs';
import { query } from '../config/database.js';

/**
 * Módulo de exportación del Dataset para el modelo CatBoost.
 *
 * Genera una fila "plana" por estudiante (última evaluación evaluada/revisada),
 * lista para `pandas.read_csv()`:
 *   - Datos generales
 *   - Notas académicas oficiales (10 cursos)
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

/**
 * Notas oficiales por curso (mismo orden del catálogo del Front-end).
 * Se exportan una vez por estudiante y se mantienen aunque el estudiante
 * vuelva a responder el cuestionario.
 */
const OFFICIAL_GRADE_COLUMNS = [
  'nota_dpcc',
  'nota_ciencias_sociales',
  'nota_educacion_religiosa',
  'nota_educacion_trabajo',
  'nota_educacion_fisica',
  'nota_comunicacion',
  'nota_arte_cultura',
  'nota_ingles',
  'nota_matematica',
  'nota_ciencia_tecnologia',
] as const;

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
  notas: Record<string, number | string | null> | null;
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
    COALESCE(to_jsonb(no.*), '{}'::jsonb) AS notas,
    COALESCE(rj.respuestas, '{}'::jsonb) AS respuestas,
    COALESCE(aj.areas, '{}'::jsonb)      AS areas
FROM ultima_evaluacion ue
JOIN estudiantes est               ON est.id = ue.estudiante_id
JOIN resultados_evaluacion re      ON re.evaluacion_id = ue.evaluacion_id
LEFT JOIN notas_oficiales no      ON no.estudiante_id = ue.estudiante_id
LEFT JOIN respuestas_json rj       ON rj.evaluacion_id = ue.evaluacion_id
LEFT JOIN areas_json aj            ON aj.evaluacion_id = ue.evaluacion_id
WHERE ($1::text IS NULL OR $1 = '' OR LOWER(TRIM($1)) = 'todas' OR LOWER(TRIM(est.seccion)) = LOWER(TRIM($1)))
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

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildExportRow(
  questionCodes: string[],
  raw: ExportQueryRow,
): ExportRow {
  const answers = raw.respuestas ?? {};
  const areas = raw.areas ?? {};
  const officialGrades = raw.notas ?? {};

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
  // Cada hobby puntuable vale +3 por cada opción seleccionada (P5.1 y P5.2 múltiples, P5.3 única).
  const optionsP51 = toOptionList(answers, 'P5.1');
  const optionsP52 = toOptionList(answers, 'P5.2');
  const ptosS5 =
    optionsP51.length * 3 +
    optionsP52.length * 3 +
    (answers['P5.3'] ? 3 : 0);
  const bonusS6 = answers['P6.6'] === 'd' ? 2 : 0;

  const row: ExportRow = {
    id_estudiante: Number(raw.id_estudiante),
    edad: resolveAge(raw.edad_opcion, raw.edad_exacta),
    sexo: raw.sexo,
    seccion: raw.seccion,
  };

  for (const column of OFFICIAL_GRADE_COLUMNS) {
    row[column] = toNullableNumber(officialGrades[column]);
  }

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
    ...OFFICIAL_GRADE_COLUMNS,
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

export async function getExportDataset(seccionFilter?: string): Promise<ExportDataset> {
  const filter =
    !seccionFilter || seccionFilter.trim().toLowerCase() === 'todas'
      ? null
      : seccionFilter.trim();

  const [questionsRes, dataRes] = await Promise.all([
    query<{ codigo: string }>('SELECT codigo FROM preguntas ORDER BY orden ASC'),
    query<ExportQueryRow>(EXPORT_QUERY, [filter]),
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

// =============================================================================
// REPORTE DE NOTAS ACADÉMICAS OFICIALES Y RESULTADOS VOCACIONALES
// =============================================================================

export interface GradesReportRow {
  estudiante_id: number;
  nombres_apellidos: string;
  grado: string;
  seccion: string;
  edad_opcion: string;
  edad_exacta: number | null;
  sexo: string;
  institucion_educativa: string;
  nota_matematica: number | null;
  nota_comunicacion: number | null;
  nota_ciencia_tecnologia: number | null;
  nota_ciencias_sociales: number | null;
  nota_dpcc: number | null;
  nota_educacion_fisica: number | null;
  nota_arte_cultura: number | null;
  nota_ingles: number | null;
  nota_educacion_trabajo: number | null;
  nota_educacion_religiosa: number | null;
  promedio_general: number | null;
  primera_opcion_codigo: string | null;
  primera_opcion_nombre: string | null;
  primera_opcion_puntaje: number | null;
  segunda_opcion_codigo: string | null;
  segunda_opcion_nombre: string | null;
  segunda_opcion_puntaje: number | null;
  total_s2: number | null;
  nivel_psicometrico: string | null;
  observaciones_psicopedagogicas: string | null;
  fecha_aplicacion: string | null;
}

export async function getSectionsList(): Promise<string[]> {
  try {
    const res = await query<{ seccion: string }>(
      `SELECT DISTINCT seccion
       FROM (
         SELECT codigo AS seccion FROM secciones_academicas WHERE activo = TRUE
         UNION
         SELECT seccion FROM estudiantes WHERE seccion IS NOT NULL AND TRIM(seccion) <> ''
       ) s
       ORDER BY seccion ASC`,
    );
    if (res.rows.length > 0) {
      return res.rows.map((r) => r.seccion);
    }
  } catch {
    const fallbackRes = await query<{ seccion: string }>(
      `SELECT DISTINCT seccion
       FROM estudiantes
       WHERE seccion IS NOT NULL AND TRIM(seccion) <> ''
       ORDER BY seccion ASC`,
    ).catch(() => ({ rows: [] as Array<{ seccion: string }> }));

    if (fallbackRes.rows.length > 0) {
      return fallbackRes.rows.map((r) => r.seccion);
    }
  }
  return ['A', 'B', 'C', 'D', 'E', 'F'];
}

export async function getGradesReportData(
  seccionFilter?: string,
): Promise<GradesReportRow[]> {
  const filter =
    !seccionFilter || seccionFilter.trim().toLowerCase() === 'todas'
      ? null
      : seccionFilter.trim();

  const res = await query<Record<string, unknown>>(
    `WITH ultima_evaluacion AS (
       SELECT DISTINCT ON (ev.estudiante_id)
              ev.id AS evaluacion_id,
              ev.estudiante_id,
              ev.fecha_aplicacion
       FROM evaluaciones ev
       ORDER BY ev.estudiante_id, ev.created_at DESC, ev.id DESC
     )
     SELECT
       est.id AS estudiante_id,
       est.nombres_apellidos,
       est.grado,
       est.seccion,
       est.edad_opcion,
       est.edad_exacta,
       est.sexo,
       est.institucion_educativa,
       no.nota_matematica,
       no.nota_comunicacion,
       no.nota_ciencia_tecnologia,
       no.nota_ciencias_sociales,
       no.nota_dpcc,
       no.nota_educacion_fisica,
       no.nota_arte_cultura,
       no.nota_ingles,
       no.nota_educacion_trabajo,
       no.nota_educacion_religiosa,
       re.primera_opcion_codigo,
       av1.nombre AS primera_opcion_nombre,
       re.primera_opcion_puntaje,
       re.segunda_opcion_codigo,
       av2.nombre AS segunda_opcion_nombre,
       re.segunda_opcion_puntaje,
       re.total_s2,
       re.nivel_psicometrico,
       vp.observaciones_psicopedagogicas,
       ue.fecha_aplicacion
     FROM estudiantes est
     LEFT JOIN notas_oficiales no ON no.estudiante_id = est.id
     LEFT JOIN ultima_evaluacion ue ON ue.estudiante_id = est.id
     LEFT JOIN resultados_evaluacion re ON re.evaluacion_id = ue.evaluacion_id
     LEFT JOIN areas_vocacionales av1 ON av1.codigo = re.primera_opcion_codigo
     LEFT JOIN areas_vocacionales av2 ON av2.codigo = re.segunda_opcion_codigo
     LEFT JOIN veredictos_psicologo vp ON vp.evaluacion_id = ue.evaluacion_id
     WHERE ($1::text IS NULL OR LOWER(TRIM(est.seccion)) = LOWER(TRIM($1)))
     ORDER BY est.seccion ASC, est.nombres_apellidos ASC`,
    [filter],
  );

  return res.rows.map((r) => {
    const grades = [
      toNullableNumber(r.nota_matematica),
      toNullableNumber(r.nota_comunicacion),
      toNullableNumber(r.nota_ciencia_tecnologia),
      toNullableNumber(r.nota_ciencias_sociales),
      toNullableNumber(r.nota_dpcc),
      toNullableNumber(r.nota_educacion_fisica),
      toNullableNumber(r.nota_arte_cultura),
      toNullableNumber(r.nota_ingles),
      toNullableNumber(r.nota_educacion_trabajo),
      toNullableNumber(r.nota_educacion_religiosa),
    ];
    const validGrades = grades.filter((g): g is number => g !== null);
    const promedio =
      validGrades.length > 0
        ? Number((validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(2))
        : null;

    return {
      estudiante_id: Number(r.estudiante_id),
      nombres_apellidos: String(r.nombres_apellidos ?? ''),
      grado: String(r.grado ?? '5.° de secundaria'),
      seccion: String(r.seccion ?? ''),
      edad_opcion: String(r.edad_opcion ?? ''),
      edad_exacta: toNullableNumber(r.edad_exacta),
      sexo: String(r.sexo ?? ''),
      institucion_educativa: String(
        r.institucion_educativa ?? 'IE - SPMA /A1-80819 FRANCISCO LIZARZABURU',
      ),
      nota_matematica: grades[0],
      nota_comunicacion: grades[1],
      nota_ciencia_tecnologia: grades[2],
      nota_ciencias_sociales: grades[3],
      nota_dpcc: grades[4],
      nota_educacion_fisica: grades[5],
      nota_arte_cultura: grades[6],
      nota_ingles: grades[7],
      nota_educacion_trabajo: grades[8],
      nota_educacion_religiosa: grades[9],
      promedio_general: promedio,
      primera_opcion_codigo: r.primera_opcion_codigo ? String(r.primera_opcion_codigo) : null,
      primera_opcion_nombre: r.primera_opcion_nombre ? String(r.primera_opcion_nombre) : null,
      primera_opcion_puntaje: toNullableNumber(r.primera_opcion_puntaje),
      segunda_opcion_codigo: r.segunda_opcion_codigo ? String(r.segunda_opcion_codigo) : null,
      segunda_opcion_nombre: r.segunda_opcion_nombre ? String(r.segunda_opcion_nombre) : null,
      segunda_opcion_puntaje: toNullableNumber(r.segunda_opcion_puntaje),
      total_s2: toNullableNumber(r.total_s2),
      nivel_psicometrico: r.nivel_psicometrico ? String(r.nivel_psicometrico) : null,
      observaciones_psicopedagogicas: r.observaciones_psicopedagogicas
        ? String(r.observaciones_psicopedagogicas)
        : null,
      fecha_aplicacion: r.fecha_aplicacion
        ? r.fecha_aplicacion instanceof Date
          ? r.fecha_aplicacion.toISOString().slice(0, 10)
          : String(r.fecha_aplicacion).slice(0, 10)
        : null,
    };
  });
}

/**
 * Genera un archivo Excel (.xlsx) estilizado y profesional con las notas oficiales
 * y resultados vocacionales de los estudiantes, opcionalmente filtrados por sección.
 */
export async function generateGradesExcel(
  rows: GradesReportRow[],
  seccionFilter?: string,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Evaluador Psicológico de Orientación Vocacional';
  workbook.created = new Date();

  const isAll = !seccionFilter || seccionFilter.trim().toLowerCase() === 'todas';
  const seccionTitle = isAll ? 'Todas las Secciones' : `Sección ${seccionFilter.trim()}`;
  const sheetName = (isAll ? 'Notas - Todas' : `Notas - ${seccionFilter.trim()}`).slice(0, 31);

  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ state: 'frozen', xSplit: 3, ySplit: 5 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  // 1. Títulos y Encabezado Institucional
  worksheet.mergeCells('A1:X1');
  const row1 = worksheet.getCell('A1');
  row1.value = 'IE - SPMA /A1-80819 FRANCISCO LIZARZABURU';
  row1.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF1E3A8A' } };
  row1.alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet.mergeCells('A2:X2');
  const row2 = worksheet.getCell('A2');
  row2.value = 'CONSOLIDADO OFICIAL DE RENDIMIENTO ACADÉMICO Y ORIENTACIÓN VOCACIONAL';
  row2.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF334155' } };
  row2.alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet.mergeCells('A3:X3');
  const row3 = worksheet.getCell('A3');
  const dateStr = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  row3.value = `Filtro: ${seccionTitle}   |   Fecha de Emisión: ${dateStr}   |   Total Estudiantes: ${rows.length}`;
  row3.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF64748B' } };
  row3.alignment = { vertical: 'middle', horizontal: 'center' };

  worksheet.addRow([]); // Fila 4 vacía

  // 2. Fila 5: Encabezados de Columna
  const headers = [
    'N°',
    'ID',
    'Estudiante',
    'Grado',
    'Sección',
    'Edad',
    'Sexo',
    'Matemática',
    'Comunicación',
    'Ciencia y Tecnol.',
    'Ciencias Sociales',
    'DPCC',
    'Educ. Física',
    'Arte y Cultura',
    'Inglés',
    'Educ. Trabajo',
    'Educ. Religiosa',
    'Promedio (0-20)',
    '1.ª Opción Vocacional',
    'Ptos. 1.ª',
    '2.ª Opción Vocacional',
    'Ptos. 2.ª',
    'Perfil S2',
    'Observaciones Psicopedagógicas',
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF0F172A' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FF334155' } },
    };
  });

  // 3. Filas de Datos
  rows.forEach((r, idx) => {
    const dataRow = worksheet.addRow([
      idx + 1,
      r.estudiante_id,
      r.nombres_apellidos,
      r.grado,
      r.seccion,
      r.edad_exacta ? `${r.edad_exacta} años` : r.edad_opcion,
      r.sexo,
      r.nota_matematica,
      r.nota_comunicacion,
      r.nota_ciencia_tecnologia,
      r.nota_ciencias_sociales,
      r.nota_dpcc,
      r.nota_educacion_fisica,
      r.nota_arte_cultura,
      r.nota_ingles,
      r.nota_educacion_trabajo,
      r.nota_educacion_religiosa,
      r.promedio_general,
      r.primera_opcion_nombre ? `${r.primera_opcion_nombre} (${r.primera_opcion_codigo})` : '—',
      r.primera_opcion_puntaje ?? '—',
      r.segunda_opcion_nombre ? `${r.segunda_opcion_nombre} (${r.segunda_opcion_codigo})` : '—',
      r.segunda_opcion_puntaje ?? '—',
      r.nivel_psicometrico ?? '—',
      r.observaciones_psicopedagogicas ?? '—',
    ]);

    dataRow.height = 20;
    const isEven = idx % 2 === 0;
    const bgArgb = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      // Columna Promedio General (18) destacada
      if (colNumber === 18) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E3A8A' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (typeof cell.value === 'number') {
          cell.numFmt = '0.00';
        }
      } else {
        cell.font = { name: 'Calibri', size: 9.5 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };

        // Columnas de notas (8 a 17)
        if (colNumber >= 8 && colNumber <= 17) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          if (typeof cell.value === 'number') {
            cell.numFmt = '0.00';
          }
        } else if (colNumber === 3 || colNumber === 19 || colNumber === 21 || colNumber === 24) {
          // Estudiante, Opciones vocacionales y Observaciones: a la izquierda
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: colNumber === 24 };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      }
    });
  });

  // 4. Fila de Promedios Generales de la Sección (si hay filas)
  if (rows.length > 0) {
    const summaryRowVals: (string | number | null)[] = new Array(24).fill(null);
    summaryRowVals[2] = 'PROMEDIO CONSOLIDADO DE LA SECCIÓN';

    for (let c = 8; c <= 18; c++) {
      const colValues = rows
        .map((r) => {
          switch (c) {
            case 8: return r.nota_matematica;
            case 9: return r.nota_comunicacion;
            case 10: return r.nota_ciencia_tecnologia;
            case 11: return r.nota_ciencias_sociales;
            case 12: return r.nota_dpcc;
            case 13: return r.nota_educacion_fisica;
            case 14: return r.nota_arte_cultura;
            case 15: return r.nota_ingles;
            case 16: return r.nota_educacion_trabajo;
            case 17: return r.nota_educacion_religiosa;
            case 18: return r.promedio_general;
            default: return null;
          }
        })
        .filter((v): v is number => v !== null);

      if (colValues.length > 0) {
        summaryRowVals[c - 1] = Number(
          (colValues.reduce((acc, v) => acc + v, 0) / colValues.length).toFixed(2),
        );
      }
    }

    const summaryRow = worksheet.addRow(summaryRowVals);
    summaryRow.height = 22;
    summaryRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF92400E' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FFD97706' } },
        bottom: { style: 'medium', color: { argb: 'FFD97706' } },
        left: { style: 'thin', color: { argb: 'FFFDE68A' } },
        right: { style: 'thin', color: { argb: 'FFFDE68A' } },
      };
      if (colNumber >= 8 && colNumber <= 18 && typeof cell.value === 'number') {
        cell.numFmt = '0.00';
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNumber === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  }

  // 5. Ajuste de anchos de columna
  const colWidths = [
    5,  // N°
    6,  // ID
    30, // Estudiante
    12, // Grado
    10, // Sección
    10, // Edad
    11, // Sexo
    12, // Matemática
    13, // Comunicación
    16, // Ciencia y Tecnol.
    15, // Ciencias Sociales
    10, // DPCC
    12, // Educ. Física
    13, // Arte y Cultura
    10, // Inglés
    13, // Educ. Trabajo
    14, // Educ. Religiosa
    15, // Promedio General
    28, // 1.ª Opción
    10, // Ptos. 1.ª
    28, // 2.ª Opción
    10, // Ptos. 2.ª
    12, // Perfil S2
    40, // Observaciones
  ];

  colWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Genera el reporte de notas en CSV con BOM UTF-8 (\uFEFF) para compatibilidad
 * directa con Microsoft Excel en español sin desconfigurar caracteres ni tildes.
 */
export function generateGradesCsv(rows: GradesReportRow[]): string {
  const columns = [
    'N°',
    'ID Estudiante',
    'Nombres y Apellidos',
    'Grado',
    'Sección',
    'Edad',
    'Sexo',
    'Matemática',
    'Comunicación',
    'Ciencia y Tecnología',
    'Ciencias Sociales',
    'DPCC',
    'Educación Física',
    'Arte y Cultura',
    'Inglés',
    'Educación para el Trabajo',
    'Educación Religiosa',
    'Promedio General',
    '1ra Opción Vocacional',
    'Puntaje 1ra Opción',
    '2da Opción Vocacional',
    'Puntaje 2da Opción',
    'Perfil S2',
    'Observaciones Psicopedagógicas',
  ];

  const header = columns.map(escapeCsvValue).join(',');
  const lines = rows.map((r, idx) => {
    const rowValues = [
      idx + 1,
      r.estudiante_id,
      r.nombres_apellidos,
      r.grado,
      r.seccion,
      r.edad_exacta ? `${r.edad_exacta} años` : r.edad_opcion,
      r.sexo,
      r.nota_matematica,
      r.nota_comunicacion,
      r.nota_ciencia_tecnologia,
      r.nota_ciencias_sociales,
      r.nota_dpcc,
      r.nota_educacion_fisica,
      r.nota_arte_cultura,
      r.nota_ingles,
      r.nota_educacion_trabajo,
      r.nota_educacion_religiosa,
      r.promedio_general,
      r.primera_opcion_nombre ? `${r.primera_opcion_nombre} (${r.primera_opcion_codigo})` : '',
      r.primera_opcion_puntaje ?? '',
      r.segunda_opcion_nombre ? `${r.segunda_opcion_nombre} (${r.segunda_opcion_codigo})` : '',
      r.segunda_opcion_puntaje ?? '',
      r.nivel_psicometrico ?? '',
      r.observaciones_psicopedagogicas ?? '',
    ];
    return rowValues.map(escapeCsvValue).join(',');
  });

  return `\uFEFF${header}\r\n${lines.join('\r\n')}\r\n`;
}
