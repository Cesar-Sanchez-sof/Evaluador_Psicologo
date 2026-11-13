import type { PoolClient } from 'pg';
import { query, withTransaction } from '../config/database.js';
import type {
  ValidatedCreateEvaluation,
  ValidatedOfficialGrades,
  ValidatedVerdict,
} from '../schemas/evaluation.schema.js';
import type { AreaCode } from '../types/evaluation.types.js';

/**
 * Correspondencia entre las claves que viajan por la API (una por curso) y las
 * columnas de la tabla `notas_oficiales`.
 */
const OFFICIAL_GRADE_DB_COLUMNS: Record<keyof ValidatedOfficialGrades, string> = {
  dpcc: 'nota_dpcc',
  ccss: 'nota_ciencias_sociales',
  er: 'nota_educacion_religiosa',
  ept: 'nota_educacion_trabajo',
  ef: 'nota_educacion_fisica',
  com: 'nota_comunicacion',
  arte: 'nota_arte_cultura',
  csl: 'nota_castellano_segunda_lengua',
  ing: 'nota_ingles',
  mat: 'nota_matematica',
  cyt: 'nota_ciencia_tecnologia',
};

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapOfficialGrades(
  row: Record<string, unknown> | undefined,
): ValidatedOfficialGrades | null {
  if (!row) return null;

  const entries = Object.entries(OFFICIAL_GRADE_DB_COLUMNS).map(([key, column]) => [
    key,
    toNumberOrNull(row[column]) ?? 0,
  ]);

  return Object.fromEntries(entries) as ValidatedOfficialGrades;
}

/**
 * Guarda o actualiza las 11 notas finales del estudiante.
 * La tabla tiene una fila por estudiante (`estudiante_id` UNIQUE), de modo que
 * una nueva aplicación del cuestionario actualiza sus notas oficiales.
 */
async function upsertOfficialGrades(
  client: PoolClient,
  estudianteId: number,
  grades: ValidatedOfficialGrades,
): Promise<void> {
  const keys = Object.keys(OFFICIAL_GRADE_DB_COLUMNS) as Array<
    keyof ValidatedOfficialGrades
  >;
  const columns = keys.map((key) => OFFICIAL_GRADE_DB_COLUMNS[key]);
  const placeholders = columns.map((_, index) => `$${index + 2}`);
  const updates = columns.map((column) => `${column} = EXCLUDED.${column}`);

  await client.query(
    `INSERT INTO notas_oficiales (estudiante_id, ${columns.join(', ')})
     VALUES ($1, ${placeholders.join(', ')})
     ON CONFLICT (estudiante_id) DO UPDATE SET
       ${updates.join(',\n       ')},
       updated_at = NOW()`,
    [estudianteId, ...keys.map((key) => grades[key])],
  );
}

export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

interface QuestionLookupRow {
  id: number;
  codigo: string;
  tipo_respuesta: 'opcion_unica' | 'opcion_multiple' | 'likert_1_5';
}

export async function getQuestionnaireStructure() {
  const [secciones, preguntas, opciones, areas] = await Promise.all([
    query('SELECT id, numero, codigo, titulo, instruccion, suma_puntaje FROM secciones_cuestionario ORDER BY numero'),
    query(
      `SELECT id, seccion_id, codigo, subgrupo_codigo, subgrupo_nombre, enunciado, tipo_respuesta, es_puntuable, es_indicador_apoyo, orden
       FROM preguntas ORDER BY orden`,
    ),
    query('SELECT id, pregunta_id, codigo_opcion, texto_opcion, orden FROM opciones_pregunta ORDER BY pregunta_id, orden'),
    query('SELECT codigo, nombre, ejemplos_cortos, carreras_afines FROM areas_vocacionales ORDER BY codigo'),
  ]);

  return {
    meta: {
      university: 'UNIVERSIDAD PRIVADA ANTENOR ORREGO',
      faculty: 'FACULTAD DE INGENIERÍA — ESCUELA PROFESIONAL DE INGENIERÍA DE SISTEMAS',
      title: 'CUESTIONARIO DE ORIENTACIÓN VOCACIONAL',
      subtitle: 'PARA ESTUDIANTES DE 5.° DE SECUNDARIA',
      school: 'IE - SPMA /A1-80819 FRANCISCO LIZARZABURU',
      targetPopulation: 'Estudiantes de 5.° de secundaria (16-17 años)',
      researchers: 'Cesar Diego Sanchez Chiroque & Renzo Daniel Ponce Evangelista',
      affiliation: 'Universidad Privada Antenor Orrego (UPAO)',
      estimatedTime: '25 – 30 minutos',
      purpose: 'Investigación académica de orientación vocacional',
      welcomeTitle: '¡BIENVENIDO(A)! — TU PARTICIPACIÓN ES MUY VALIOSA',
      welcomeIntro: [
        '¡Hola! Te damos la más cordial bienvenida a este cuestionario de orientación vocacional.',
        'Somos Cesar Diego Sanchez Chiroque y Renzo Daniel Ponce Evangelista, estudiantes e investigadores de la Universidad Privada Antenor Orrego (UPAO). Nos encontramos desarrollando este proyecto especialmente con la comunidad estudiantil de la IE - SPMA /A1-80819 FRANCISCO LIZARZABURU, con el propósito de acompañarte y brindarte un espacio de reflexión en una etapa tan crucial y emocionante como lo es culminar tu 5.° de secundaria.',
        'Sabemos que tomar una decisión sobre tu futuro profesional puede generar muchas preguntas y expectativas. Por ello, este cuestionario busca que conozcas mejor tus talentos, intereses y preferencias personales en un ambiente de total confianza y tranquilidad:',
      ],
      welcomeBullets: [
        'No existen respuestas correctas ni incorrectas: lo más importante es lo que piensas y sientes de manera sincera.',
        'Tus respuestas son estrictamente confidenciales: tus datos están protegidos y se utilizarán exclusivamente para fines académicos de investigación.',
        'Responde con calma y a tu propio ritmo: lee con atención cada pregunta. Marca una sola opción por ítem, salvo indicación expresa.',
        'En las preguntas con escala del 1 al 5: guíate de la tabla de valoración que encontrarás a continuación para indicar tu grado de acuerdo o identificación.',
      ],
      welcomeClosing:
        '¡Agradecemos sinceramente tu valioso tiempo y te deseamos los mayores éxitos en todos tus proyectos personales y académicos!',
      confidentialityTitle: 'Compromiso de Confidencialidad',
      confidentialityText:
        'Tus datos personales están protegidos por el principio de confidencialidad académica. Se emplearán únicamente para vincular tus resultados con fines de investigación educativa y no serán divulgados de forma individual.',
    },
    escalaLikert: [
      { value: 1, label: 'Totalmente en desacuerdo / Nada identificado(a)' },
      { value: 2, label: 'En desacuerdo / Poco identificado(a)' },
      { value: 3, label: 'Ni de acuerdo ni en desacuerdo / Moderadamente identificado(a)' },
      { value: 4, label: 'De acuerdo / Bastante identificado(a)' },
      { value: 5, label: 'Totalmente de acuerdo / Completamente identificado(a)' },
    ],
    datosGenerales: {
      edades: ['15 años', '16 años', '17 años', '18 años', 'Otro'],
      sexos: ['Masculino', 'Femenino'],
    },
    secciones: secciones.rows,
    preguntas: preguntas.rows,
    opciones: opciones.rows,
    areasVocacionales: areas.rows,
  };
}

/**
 * Registra estudiante + evaluación + todas sus respuestas (incluyendo múltiples en P1.1 y P1.2)
 * y ejecuta `fn_calcular_y_guardar_evaluacion` dentro de la misma transacción PostgreSQL.
 */
export async function createAndEvaluateSubmission(payload: ValidatedCreateEvaluation) {
  const evaluacionId = await withTransaction(async (client) => {
    const estRes = await client.query<{ id: string }>(
      `INSERT INTO estudiantes (
        nombres_apellidos, edad_opcion, edad_exacta, sexo, institucion_educativa, grado, seccion
      ) VALUES (
        $1, $2, $3, $4, COALESCE($5, 'IE - SPMA /A1-80819 FRANCISCO LIZARZABURU'), COALESCE($6, '5.° de secundaria'), $7
      ) RETURNING id`,
      [
        payload.estudiante.nombresApellidos,
        payload.estudiante.edadOpcion,
        payload.estudiante.edadExacta ?? null,
        payload.estudiante.sexo,
        payload.estudiante.institucionEducativa ?? null,
        payload.estudiante.grado ?? null,
        payload.estudiante.seccion,
      ],
    );
    const estudianteId = Number(estRes.rows[0].id);

    const evalRes = await client.query<{ id: string }>(
      `INSERT INTO evaluaciones (estudiante_id, fecha_aplicacion, estado, tiempo_llenado_min)
       VALUES ($1, COALESCE($2::date, CURRENT_DATE), 'completada', $3)
       RETURNING id`,
      [estudianteId, payload.fechaAplicacion ?? null, payload.tiempoLlenadoMin ?? null],
    );
    const newEvalId = Number(evalRes.rows[0].id);

    await upsertOfficialGrades(client, estudianteId, payload.notasOficiales);

    const qRows = await client.query<QuestionLookupRow>(
      'SELECT id, codigo, tipo_respuesta FROM preguntas ORDER BY orden',
    );
    const questionByCode = new Map(qRows.rows.map((row) => [row.codigo, row]));

    for (const [code, value] of Object.entries(payload.respuestas)) {
      const q = questionByCode.get(code);
      if (!q) {
        throw new Error(`Código de pregunta no encontrado en catálogo: ${code}`);
      }

      if (q.tipo_respuesta === 'likert_1_5') {
        await client.query(
          `INSERT INTO respuestas_cuestionario (evaluacion_id, pregunta_id, codigo_opcion, valor_likert)
           VALUES ($1, $2, NULL, $3)`,
          [newEvalId, q.id, Number(value)],
        );
      } else if (Array.isArray(value)) {
        for (const opt of value) {
          await client.query(
            `INSERT INTO respuestas_cuestionario (evaluacion_id, pregunta_id, codigo_opcion, valor_likert)
             VALUES ($1, $2, $3, NULL)`,
            [newEvalId, q.id, opt],
          );
        }
      } else {
        await client.query(
          `INSERT INTO respuestas_cuestionario (evaluacion_id, pregunta_id, codigo_opcion, valor_likert)
           VALUES ($1, $2, $3, NULL)`,
          [newEvalId, q.id, String(value)],
        );
      }
    }

    // Ejecuta el motor SQL de la Plantilla de Corrección y persiste en resultados_evaluacion y resultados_detalle_area
    await client.query('SELECT * FROM fn_calcular_y_guardar_evaluacion($1)', [newEvalId]);

    return newEvalId;
  });

  return getEvaluationById(evaluacionId);
}

export async function listEvaluations() {
  const res = await query(
    `SELECT
       ev.id AS evaluacion_id,
       ev.fecha_aplicacion,
       ev.estado,
       ev.tiempo_llenado_min,
       est.id AS estudiante_id,
       est.nombres_apellidos,
       est.edad_opcion,
       est.edad_exacta,
       est.sexo,
       est.grado,
       est.seccion,
       re.primera_opcion_codigo,
       av1.nombre AS primera_opcion_nombre,
       re.primera_opcion_puntaje,
       re.segunda_opcion_codigo,
       av2.nombre AS segunda_opcion_nombre,
       re.segunda_opcion_puntaje,
       re.total_s2,
       re.nivel_psicometrico,
       vp.psicologo_evaluador,
       vp.area_primera_opcion_codigo AS veredicto_area_codigo
     FROM evaluaciones ev
     JOIN estudiantes est ON est.id = ev.estudiante_id
     LEFT JOIN resultados_evaluacion re ON re.evaluacion_id = ev.id
     LEFT JOIN areas_vocacionales av1 ON av1.codigo = re.primera_opcion_codigo
     LEFT JOIN areas_vocacionales av2 ON av2.codigo = re.segunda_opcion_codigo
     LEFT JOIN veredictos_psicologo vp ON vp.evaluacion_id = ev.id
     ORDER BY ev.created_at DESC, ev.id DESC`,
  );
  return res.rows;
}

export async function getEvaluationById(evaluacionId: number) {
  const [hojaRes, detalleRes, respuestasRes, veredictoRes, notasRes] = await Promise.all([
    query('SELECT * FROM vw_hoja_correccion_final WHERE evaluacion_id = $1', [evaluacionId]),
    query(
      `SELECT d.area_codigo, av.nombre AS area_nombre, d.ptos_s1, d.ptos_s3, d.ptos_s4, d.ptos_s5, d.bonus_s6, d.total_area, d.porcentaje_orientacion, d.orden_prioridad
       FROM resultados_detalle_area d
       JOIN areas_vocacionales av ON av.codigo = d.area_codigo
       WHERE d.evaluacion_id = $1
       ORDER BY d.orden_prioridad ASC`,
      [evaluacionId],
    ),
    query(
      `SELECT p.codigo, p.seccion_id, p.subgrupo_codigo, p.enunciado, p.tipo_respuesta,
              r.codigo_opcion, op.texto_opcion, r.valor_likert
       FROM respuestas_cuestionario r
       JOIN preguntas p ON p.id = r.pregunta_id
       LEFT JOIN opciones_pregunta op
              ON op.pregunta_id = r.pregunta_id
             AND op.codigo_opcion = r.codigo_opcion
       WHERE r.evaluacion_id = $1
       ORDER BY p.orden ASC, r.codigo_opcion ASC`,
      [evaluacionId],
    ),
    query('SELECT * FROM veredictos_psicologo WHERE evaluacion_id = $1', [evaluacionId]),
    query(
      `SELECT n.*
       FROM notas_oficiales n
       JOIN evaluaciones e ON e.estudiante_id = n.estudiante_id
       WHERE e.id = $1`,
      [evaluacionId],
    ),
  ]);

  if (hojaRes.rowCount === 0) {
    throw new NotFoundError(`No existe la evaluación con ID ${evaluacionId}`);
  }

  return {
    hojaCorreccion: hojaRes.rows[0],
    notasOficiales: mapOfficialGrades(notasRes.rows[0]),
    detalleAreas: detalleRes.rows,
    respuestas: respuestasRes.rows,
    veredictoPsicologo: veredictoRes.rows[0] ?? null,
  };
}

export async function recalculateEvaluation(evaluacionId: number) {
  const exists = await query('SELECT 1 FROM evaluaciones WHERE id = $1', [evaluacionId]);
  if (exists.rowCount === 0) {
    throw new NotFoundError(`No existe la evaluación con ID ${evaluacionId}`);
  }
  await query('SELECT * FROM fn_calcular_y_guardar_evaluacion($1)', [evaluacionId]);
  return getEvaluationById(evaluacionId);
}

export async function savePsychologistVerdict(evaluacionId: number, verdict: ValidatedVerdict) {
  await withTransaction(async (client) => {
    const exists = await client.query('SELECT 1 FROM evaluaciones WHERE id = $1', [evaluacionId]);
    if (exists.rowCount === 0) {
      throw new NotFoundError(`No existe la evaluación con ID ${evaluacionId}`);
    }

    await client.query(
      `INSERT INTO veredictos_psicologo (
         evaluacion_id, psicologo_evaluador, cpsp_numero, fecha_evaluacion,
         area_primera_opcion_codigo, area_segunda_opcion_codigo,
         es_vocacion_dual, area_dual_codigo, observaciones_psicopedagogicas
       ) VALUES (
         $1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5, $6, $7, $8, $9
       )
       ON CONFLICT (evaluacion_id) DO UPDATE SET
         psicologo_evaluador = EXCLUDED.psicologo_evaluador,
         cpsp_numero = EXCLUDED.cpsp_numero,
         fecha_evaluacion = EXCLUDED.fecha_evaluacion,
         area_primera_opcion_codigo = EXCLUDED.area_primera_opcion_codigo,
         area_segunda_opcion_codigo = EXCLUDED.area_segunda_opcion_codigo,
         es_vocacion_dual = EXCLUDED.es_vocacion_dual,
         area_dual_codigo = EXCLUDED.area_dual_codigo,
         observaciones_psicopedagogicas = EXCLUDED.observaciones_psicopedagogicas,
         updated_at = NOW()`,
      [
        evaluacionId,
        verdict.psicologoEvaluador,
        verdict.cpspNumero ?? null,
        verdict.fechaEvaluacion ?? null,
        verdict.areaPrimeraOpcionCodigo as AreaCode,
        (verdict.areaSegundaOpcionCodigo ?? null) as AreaCode | null,
        verdict.esVocacionDual,
        (verdict.areaDualCodigo ?? null) as AreaCode | null,
        verdict.observacionesPsicopedagogicas ?? null,
      ],
    );

    await client.query(
      `UPDATE evaluaciones SET estado = 'revisada', updated_at = NOW() WHERE id = $1`,
      [evaluacionId],
    );
  });

  return getEvaluationById(evaluacionId);
}
