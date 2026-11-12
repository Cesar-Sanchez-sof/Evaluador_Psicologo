export type AreaCode = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10';

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export type AgeOption = '15 años' | '16 años' | '17 años' | '18 años' | 'Otro';
export type SexOption = 'Masculino' | 'Femenino';

export interface StudentInput {
  nombresApellidos: string;
  edadOpcion: AgeOption;
  edadExacta?: number | null;
  sexo: SexOption;
  institucionEducativa?: string;
  grado?: string;
  seccion: string;
}

/**
 * Mapa de respuestas del estudiante por código de pregunta (`P1.1` .. `P6.6`).
 * - `P1.1` y `P1.2` aceptan un arreglo de opciones (`string[]`, ej. `['d', 'k']`) o string único.
 * - `P5.1`..`P5.4`, `P6.1`..`P6.6` aceptan código de opción (`'a'`, `'b'`, ...).
 * - Ítems Likert (`P1.3`..`P1.7`, `P2.1`..`P2.9`, `P3.1`..`P3.9`, `P4.1`..`P4.18`) aceptan 1..5.
 */
export type QuestionnaireAnswersMap = Record<string, string | string[] | LikertValue>;

export interface CreateEvaluationInput {
  estudiante: StudentInput;
  respuestas: QuestionnaireAnswersMap;
  fechaAplicacion?: string;
  tiempoLlenadoMin?: number;
}

export interface VerdictInput {
  psicologoEvaluador: string;
  cpspNumero?: string;
  fechaEvaluacion?: string;
  areaPrimeraOpcionCodigo: AreaCode;
  areaSegundaOpcionCodigo?: AreaCode | null;
  esVocacionDual?: boolean;
  areaDualCodigo?: AreaCode | null;
  observacionesPsicopedagogicas?: string;
}

export interface AreaScoreRow {
  areaCodigo: AreaCode;
  areaNombre: string;
  ptosS1: number;
  ptosS3: number;
  ptosS4: number;
  ptosS5: number;
  bonusS6: number;
  totalArea: number;
  porcentajeOrientacion: number;
  ordenPrioridad: number;
}

export interface EvaluationScoringResult {
  primeraOpcionCodigo: AreaCode;
  primeraOpcionNombre: string;
  primeraOpcionPuntaje: number;
  primeraOpcionPorcentaje: number;
  segundaOpcionCodigo: AreaCode;
  segundaOpcionNombre: string;
  segundaOpcionPuntaje: number;
  segundaOpcionPorcentaje: number;
  requiereRevisionEmpateDual: boolean;
  carrerasRecomendadasPrimeraOpcion: string;
  seccion1Detalle: {
    p1_1Opciones: string[];
    p1_2Opciones: string[];
    p1_3Matematica: number;
    p1_4Ciencias: number;
    p1_5Humanidades: number;
    p1_6Arte: number;
  };
  seccion2: {
    grupoAAutoeficacia: number;
    grupoBResiliencia: number;
    grupoCEstres: number;
    totalS2: number;
    nivelPsicometrico: 'ALTO' | 'MEDIO' | 'BAJO' | 'MUY BAJO';
    interpretacionS2: string;
  };
  seccion3: {
    puntaje3aLogicoMatematico: number;
    puntaje3bComprensionVerbal: number;
    puntaje3cEspacialVisual: number;
  };
  seccion4Riasec: {
    rRealista: number;
    iInvestigador: number;
    aArtistico: number;
    sSocial: number;
    eEmprendedor: number;
    cConvencional: number;
  };
  seccion5Detalle: {
    p5_1: string;
    p5_2: string;
    p5_3: string;
  };
  seccion6Detalle: {
    bonusArea09: number;
  };
  indicadoresApoyo: {
    p1_7Dedicacion: number;
    p1_7Interpretacion: string;
    p5_4Opcion: string;
    p5_4Interpretacion: string;
    p6_3Internet: string;
    p6_4Computadora: string;
    p6_5PlanPrincipal: string;
    p6_6TipoInstitucion: string;
  };
  detalleAreas: AreaScoreRow[];
}
