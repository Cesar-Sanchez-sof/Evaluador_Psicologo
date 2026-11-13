import { z } from 'zod';

const AREA_CURRICULAR_CODES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'] as const;
const SIX_OPTIONS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;
const FIVE_OPTIONS = ['a', 'b', 'c', 'd', 'e'] as const;
const FOUR_OPTIONS = ['a', 'b', 'c', 'd'] as const;
const THREE_OPTIONS = ['a', 'b', 'c'] as const;
const AREA_CODES = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'] as const;

const likertSchema = z.coerce.number().int().min(1).max(5);

/** Nota final oficial por curso (escala 0–20, admite decimales). */
const officialGradeSchema = z.coerce.number().min(0).max(20);

export const officialGradesSchema = z
  .object({
    dpcc: officialGradeSchema,
    ccss: officialGradeSchema,
    er: officialGradeSchema,
    ept: officialGradeSchema,
    ef: officialGradeSchema,
    com: officialGradeSchema,
    arte: officialGradeSchema,
    csl: officialGradeSchema,
    ing: officialGradeSchema,
    mat: officialGradeSchema,
    cyt: officialGradeSchema,
  })
  .strict();

/** P1.1 y P1.2 aceptan una o varias opciones (`string[]` o `string` normalizado a array único). */
const multipleAreaCurricularSchema = z
  .union([
    z.array(z.enum(AREA_CURRICULAR_CODES)).min(1, 'Debes seleccionar al menos una opción'),
    z.enum(AREA_CURRICULAR_CODES).transform((val) => [val]),
  ])
  .transform((arr) => [...new Set(arr)]);

export const answersSchema = z
  .object({
    'P1.1': multipleAreaCurricularSchema,
    'P1.2': multipleAreaCurricularSchema,
    'P1.3': likertSchema,
    'P1.4': likertSchema,
    'P1.5': likertSchema,
    'P1.6': likertSchema,
    'P1.7': likertSchema,

    'P2.1': likertSchema,
    'P2.2': likertSchema,
    'P2.3': likertSchema,
    'P2.4': likertSchema,
    'P2.5': likertSchema,
    'P2.6': likertSchema,
    'P2.7': likertSchema,
    'P2.8': likertSchema,
    'P2.9': likertSchema,

    'P3.1': likertSchema,
    'P3.2': likertSchema,
    'P3.3': likertSchema,
    'P3.4': likertSchema,
    'P3.5': likertSchema,
    'P3.6': likertSchema,
    'P3.7': likertSchema,
    'P3.8': likertSchema,
    'P3.9': likertSchema,

    'P4.1': likertSchema,
    'P4.2': likertSchema,
    'P4.3': likertSchema,
    'P4.4': likertSchema,
    'P4.5': likertSchema,
    'P4.6': likertSchema,
    'P4.7': likertSchema,
    'P4.8': likertSchema,
    'P4.9': likertSchema,
    'P4.10': likertSchema,
    'P4.11': likertSchema,
    'P4.12': likertSchema,
    'P4.13': likertSchema,
    'P4.14': likertSchema,
    'P4.15': likertSchema,
    'P4.16': likertSchema,
    'P4.17': likertSchema,
    'P4.18': likertSchema,

    'P5.1': z.enum(SIX_OPTIONS),
    'P5.2': z.enum(SIX_OPTIONS),
    'P5.3': z.enum(SIX_OPTIONS),
    'P5.4': z.enum(FOUR_OPTIONS),

    'P6.1': z.enum(SIX_OPTIONS),
    'P6.2': z.enum(SIX_OPTIONS),
    'P6.3': z.enum(THREE_OPTIONS),
    'P6.4': z.enum(FOUR_OPTIONS),
    'P6.5': z.enum(FIVE_OPTIONS),
    'P6.6': z.enum(FIVE_OPTIONS),
  })
  .strict();

export const createEvaluationSchema = z.object({
  estudiante: z.object({
    nombresApellidos: z.string().trim().min(3, 'Ingresa nombres y apellidos completos').max(200),
    edadOpcion: z.enum(['15 años', '16 años', '17 años', '18 años', 'Otro']),
    edadExacta: z.coerce.number().int().min(12).max(25).optional().nullable(),
    sexo: z.enum(['Masculino', 'Femenino']),
    institucionEducativa: z.string().trim().max(150).optional(),
    grado: z.string().trim().max(40).optional(),
    seccion: z.string().trim().min(1, 'La sección es obligatoria').max(30),
  }),
  respuestas: answersSchema,
  notasOficiales: officialGradesSchema,
  fechaAplicacion: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha esperado YYYY-MM-DD')
    .optional(),
  tiempoLlenadoMin: z.coerce.number().int().min(1).max(240).optional(),
});

export const previewScoreSchema = z.object({
  respuestas: answersSchema,
});

export const verdictSchema = z.object({
  psicologoEvaluador: z.string().trim().min(3, 'Nombre del psicólogo evaluador requerido').max(180),
  cpspNumero: z.string().trim().max(30).optional(),
  fechaEvaluacion: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha esperado YYYY-MM-DD')
    .optional(),
  areaPrimeraOpcionCodigo: z.enum(AREA_CODES),
  areaSegundaOpcionCodigo: z.enum(AREA_CODES).optional().nullable(),
  esVocacionDual: z.boolean().optional().default(false),
  areaDualCodigo: z.enum(AREA_CODES).optional().nullable(),
  observacionesPsicopedagogicas: z.string().trim().max(2000).optional(),
});

export type ValidatedCreateEvaluation = z.infer<typeof createEvaluationSchema>;
export type ValidatedAnswers = z.infer<typeof answersSchema>;
export type ValidatedOfficialGrades = z.infer<typeof officialGradesSchema>;
export type ValidatedVerdict = z.infer<typeof verdictSchema>;
