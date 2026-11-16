import type { StudentAnswers } from '../types/questionnaire';

export type AreaCode =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10';

export interface AreaInfo {
  codigo: AreaCode;
  nombre: string;
}

export const VOCATIONAL_AREAS: Record<AreaCode, string> = {
  '01': 'Ciencias de la Salud',
  '02': 'Ingenierías y Tecnología',
  '03': 'Ciencias Básicas y Naturales',
  '04': 'Ciencias Sociales y Humanidades',
  '05': 'Ciencias Económicas y Empresariales',
  '06': 'Comunicación, Arte y Diseño',
  '07': 'Educación y Pedagogía',
  '08': 'Ciencias Agrarias y Ambientales',
  '09': 'Fuerzas Armadas y Orden',
  '10': 'Oficios Técnicos y Tecnológicos',
};

export const S1_CURRICULAR_AREA_MAP: Record<string, AreaCode[]> = {
  a: ['06'],
  b: ['04', '07'],
  c: ['04', '05'],
  d: ['01', '02', '03', '08'],
  e: ['04', '06'],
  f: ['04', '07'],
  g: ['09', '01'],
  h: ['02', '05', '10'],
  i: ['04', '07'],
  j: ['04', '06', '05'],
  k: ['02', '03', '05'],
};

export const S5_HOBBY_MAP: Record<'P5.1' | 'P5.2' | 'P5.3', Record<string, AreaCode[]>> = {
  'P5.1': {
    a: ['02', '08', '09', '10'],
    b: ['01', '02', '03'],
    c: ['06'],
    d: ['01', '04', '07'],
    e: ['05', '06'],
    f: ['05', '07'],
  },
  'P5.2': {
    a: ['02', '08', '10'],
    b: ['01', '02', '03'],
    c: ['06'],
    d: ['01', '04', '07'],
    e: ['05', '06'],
    f: ['05', '07'],
  },
  'P5.3': {
    a: ['02', '08', '10'],
    b: ['01', '03'],
    c: ['06'],
    d: ['04', '07'],
    e: ['05'],
    f: ['05', '07'],
  },
};

export interface LiveAreaRow {
  codigo: AreaCode;
  nombre: string;
  ptosS1: number;
  ptosS3: number;
  ptosS4: number;
  ptosS5: number;
  bonusS6: number;
  total: number;
  porcentaje: number;
  orden: number;
}

export interface LiveAreaScoresResult {
  areas: LiveAreaRow[];
  totalPuntosGeneral: number;
  primeraOpcion: LiveAreaRow | null;
  segundaOpcion: LiveAreaRow | null;
  preguntasRespondidasCount: number;
  hayEmpatePrimero: boolean;
}

function createZeroBucket(): Record<AreaCode, number> {
  return {
    '01': 0,
    '02': 0,
    '03': 0,
    '04': 0,
    '05': 0,
    '06': 0,
    '07': 0,
    '08': 0,
    '09': 0,
    '10': 0,
  };
}

function addPoints(bucket: Record<AreaCode, number>, areas: AreaCode[], delta: number): void {
  for (const area of areas) {
    bucket[area] += delta;
  }
}

/**
 * Calcula en tiempo real la sumatoria por sección y el consolidado/porcentaje
 * de las 10 áreas vocacionales según las reglas oficiales de la Plantilla UPAO 2026.
 */
export function calculateLiveAreaScores(answers: StudentAnswers): LiveAreaScoresResult {
  const s1 = createZeroBucket();
  const s3 = createZeroBucket();
  const s4 = createZeroBucket();
  const s5 = createZeroBucket();
  const s6 = createZeroBucket();

  // P1.1 (+1 por opción marcada)
  const p1_1 = answers['P1.1'];
  if (p1_1) {
    const opts = Array.isArray(p1_1) ? p1_1 : [p1_1];
    for (const opt of opts) {
      addPoints(s1, S1_CURRICULAR_AREA_MAP[opt] ?? [], 1);
    }
  }

  // P1.2 (-1 por opción marcada)
  const p1_2 = answers['P1.2'];
  if (p1_2) {
    const opts = Array.isArray(p1_2) ? p1_2 : [p1_2];
    for (const opt of opts) {
      addPoints(s1, S1_CURRICULAR_AREA_MAP[opt] ?? [], -1);
    }
  }

  // P1.3 a P1.6 (valores directos 1–5)
  if (typeof answers['P1.3'] === 'number') addPoints(s1, ['02', '03', '05'], answers['P1.3'] as number);
  if (typeof answers['P1.4'] === 'number') addPoints(s1, ['01', '03', '08'], answers['P1.4'] as number);
  if (typeof answers['P1.5'] === 'number') addPoints(s1, ['04', '07'], answers['P1.5'] as number);
  if (typeof answers['P1.6'] === 'number') addPoints(s1, ['06'], answers['P1.6'] as number);

  // Sección 3: Aptitudes Cognitivas
  // 3A: P3.1, P3.2, P3.3 -> 02, 03, 05
  ['P3.1', 'P3.2', 'P3.3'].forEach((code) => {
    if (typeof answers[code] === 'number') addPoints(s3, ['02', '03', '05'], answers[code] as number);
  });
  // 3B: P3.4, P3.5, P3.6 -> 04, 06, 07
  ['P3.4', 'P3.5', 'P3.6'].forEach((code) => {
    if (typeof answers[code] === 'number') addPoints(s3, ['04', '06', '07'], answers[code] as number);
  });
  // 3C: P3.7, P3.8, P3.9 -> 02, 06, 08
  ['P3.7', 'P3.8', 'P3.9'].forEach((code) => {
    if (typeof answers[code] === 'number') addPoints(s3, ['02', '06', '08'], answers[code] as number);
  });

  // Sección 4: RIASEC
  // R: P4.1, P4.2, P4.3 -> 02, 08, 09, 10
  ['P4.1', 'P4.2', 'P4.3'].forEach((code) => {
    if (typeof answers[code] === 'number') addPoints(s4, ['02', '08', '09', '10'], answers[code] as number);
  });
  // I: P4.4, P4.5, P4.6 -> 01, 02, 03
  ['P4.4', 'P4.5', 'P4.6'].forEach((code) => {
    if (typeof answers[code] === 'number') addPoints(s4, ['01', '02', '03'], answers[code] as number);
  });
  // A: P4.7, P4.8, P4.9 -> 06
  ['P4.7', 'P4.8', 'P4.9'].forEach((code) => {
    if (typeof answers[code] === 'number') addPoints(s4, ['06'], answers[code] as number);
  });
  // S: P4.10, P4.11, P4.12 -> 01, 04, 07
  ['P4.10', 'P4.11', 'P4.12'].forEach((code) => {
    if (typeof answers[code] === 'number') addPoints(s4, ['01', '04', '07'], answers[code] as number);
  });
  // E: P4.13, P4.14, P4.15 -> 05, 06
  ['P4.13', 'P4.14', 'P4.15'].forEach((code) => {
    if (typeof answers[code] === 'number') addPoints(s4, ['05', '06'], answers[code] as number);
  });
  // C: P4.16, P4.17, P4.18 -> 05, 07, 09
  ['P4.16', 'P4.17', 'P4.18'].forEach((code) => {
    if (typeof answers[code] === 'number') addPoints(s4, ['05', '07', '09'], answers[code] as number);
  });

  // Sección 5: Intereses y Hobbies (+3 puntos por opción)
  const p5_1 = answers['P5.1'] as string | undefined;
  if (p5_1 && S5_HOBBY_MAP['P5.1'][p5_1]) {
    addPoints(s5, S5_HOBBY_MAP['P5.1'][p5_1], 3);
  }
  const p5_2 = answers['P5.2'] as string | undefined;
  if (p5_2 && S5_HOBBY_MAP['P5.2'][p5_2]) {
    addPoints(s5, S5_HOBBY_MAP['P5.2'][p5_2], 3);
  }
  const p5_3 = answers['P5.3'] as string | undefined;
  if (p5_3 && S5_HOBBY_MAP['P5.3'][p5_3]) {
    addPoints(s5, S5_HOBBY_MAP['P5.3'][p5_3], 3);
  }

  // Sección 6: Contexto (Excepción P6.6 = 'd' otorga +2 al Área 09)
  if (answers['P6.6'] === 'd') {
    s6['09'] += 2;
  }

  // Totales y ordenamiento
  const areaCodes: AreaCode[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
  let totalPuntosGeneral = 0;

  const rawRows = areaCodes.map((codigo) => {
    const ptosS1 = s1[codigo];
    const ptosS3 = s3[codigo];
    const ptosS4 = s4[codigo];
    const ptosS5 = s5[codigo];
    const bonusS6 = s6[codigo];
    const total = ptosS1 + ptosS3 + ptosS4 + ptosS5 + bonusS6;
    if (total > 0) totalPuntosGeneral += total;
    return {
      codigo,
      nombre: VOCATIONAL_AREAS[codigo],
      ptosS1,
      ptosS3,
      ptosS4,
      ptosS5,
      bonusS6,
      total,
      porcentaje: 0,
      orden: 0,
    };
  });

  // Ordenar de mayor a menor puntaje
  rawRows.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (b.ptosS4 !== a.ptosS4) return b.ptosS4 - a.ptosS4; // Desempate RIASEC S4
    return a.codigo.localeCompare(b.codigo);
  });

  // Asignar orden y porcentaje
  const rows: LiveAreaRow[] = rawRows.map((row, index) => ({
    ...row,
    orden: index + 1,
    porcentaje:
      totalPuntosGeneral > 0
        ? Math.round((Math.max(0, row.total) / totalPuntosGeneral) * 1000) / 10
        : 0,
  }));

  const hayEmpatePrimero =
    rows.length >= 2 && rows[0].total > 0 && rows[0].total === rows[1].total;

  const answeredCount = Object.values(answers).filter(
    (v) => v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : v !== ''),
  ).length;

  return {
    areas: rows,
    totalPuntosGeneral,
    primeraOpcion: rows[0]?.total > 0 ? rows[0] : null,
    segundaOpcion: rows[1]?.total > 0 ? rows[1] : null,
    preguntasRespondidasCount: answeredCount,
    hayEmpatePrimero,
  };
}

export interface ImpactItem {
  areaCodigo: AreaCode;
  areaNombre: string;
  delta: number; // +1, -1, +3, +4, etc.
}

export interface QuestionImpactDetails {
  hasImpact: boolean;
  additions: ImpactItem[];
  subtractions: ImpactItem[];
  isContextOnly: boolean;
  ruleDescription: string;
}

/**
 * Obtiene el impacto detallado de una respuesta seleccionada en una pregunta.
 */
export function getQuestionScoreImpact(
  questionCode: string,
  value: string | string[] | number | undefined,
): QuestionImpactDetails {
  if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
    return {
      hasImpact: false,
      additions: [],
      subtractions: [],
      isContextOnly: isContextQuestion(questionCode),
      ruleDescription: getQuestionRuleInfo(questionCode),
    };
  }

  const additions: ImpactItem[] = [];
  const subtractions: ImpactItem[] = [];

  // P1.1 (+1 por opción)
  if (questionCode === 'P1.1') {
    const opts = Array.isArray(value) ? value : [String(value)];
    for (const opt of opts) {
      const areas = S1_CURRICULAR_AREA_MAP[opt] ?? [];
      for (const a of areas) {
        additions.push({ areaCodigo: a, areaNombre: VOCATIONAL_AREAS[a], delta: 1 });
      }
    }
  }

  // P1.2 (-1 por opción)
  if (questionCode === 'P1.2') {
    const opts = Array.isArray(value) ? value : [String(value)];
    for (const opt of opts) {
      const areas = S1_CURRICULAR_AREA_MAP[opt] ?? [];
      for (const a of areas) {
        subtractions.push({ areaCodigo: a, areaNombre: VOCATIONAL_AREAS[a], delta: -1 });
      }
    }
  }

  // P1.3 a P1.6 (valores directos)
  const numVal = typeof value === 'number' ? value : Number(value);
  if (Number.isFinite(numVal) && numVal > 0) {
    if (questionCode === 'P1.3') {
      ['02', '03', '05'].forEach((a) =>
        additions.push({ areaCodigo: a as AreaCode, areaNombre: VOCATIONAL_AREAS[a as AreaCode], delta: numVal }),
      );
    } else if (questionCode === 'P1.4') {
      ['01', '03', '08'].forEach((a) =>
        additions.push({ areaCodigo: a as AreaCode, areaNombre: VOCATIONAL_AREAS[a as AreaCode], delta: numVal }),
      );
    } else if (questionCode === 'P1.5') {
      ['04', '07'].forEach((a) =>
        additions.push({ areaCodigo: a as AreaCode, areaNombre: VOCATIONAL_AREAS[a as AreaCode], delta: numVal }),
      );
    } else if (questionCode === 'P1.6') {
      additions.push({ areaCodigo: '06', areaNombre: VOCATIONAL_AREAS['06'], delta: numVal });
    }
  }

  // Sección 3: P3.1 a P3.9
  if (Number.isFinite(numVal) && numVal > 0) {
    if (['P3.1', 'P3.2', 'P3.3'].includes(questionCode)) {
      ['02', '03', '05'].forEach((a) =>
        additions.push({ areaCodigo: a as AreaCode, areaNombre: VOCATIONAL_AREAS[a as AreaCode], delta: numVal }),
      );
    } else if (['P3.4', 'P3.5', 'P3.6'].includes(questionCode)) {
      ['04', '06', '07'].forEach((a) =>
        additions.push({ areaCodigo: a as AreaCode, areaNombre: VOCATIONAL_AREAS[a as AreaCode], delta: numVal }),
      );
    } else if (['P3.7', 'P3.8', 'P3.9'].includes(questionCode)) {
      ['02', '06', '08'].forEach((a) =>
        additions.push({ areaCodigo: a as AreaCode, areaNombre: VOCATIONAL_AREAS[a as AreaCode], delta: numVal }),
      );
    }
  }

  // Sección 4: P4.1 a P4.18 (RIASEC)
  if (Number.isFinite(numVal) && numVal > 0) {
    if (['P4.1', 'P4.2', 'P4.3'].includes(questionCode)) {
      // Realista
      ['02', '08', '09', '10'].forEach((a) =>
        additions.push({ areaCodigo: a as AreaCode, areaNombre: VOCATIONAL_AREAS[a as AreaCode], delta: numVal }),
      );
    } else if (['P4.4', 'P4.5', 'P4.6'].includes(questionCode)) {
      // Investigador
      ['01', '02', '03'].forEach((a) =>
        additions.push({ areaCodigo: a as AreaCode, areaNombre: VOCATIONAL_AREAS[a as AreaCode], delta: numVal }),
      );
    } else if (['P4.7', 'P4.8', 'P4.9'].includes(questionCode)) {
      // Artístico
      additions.push({ areaCodigo: '06', areaNombre: VOCATIONAL_AREAS['06'], delta: numVal });
    } else if (['P4.10', 'P4.11', 'P4.12'].includes(questionCode)) {
      // Social
      ['01', '04', '07'].forEach((a) =>
        additions.push({ areaCodigo: a as AreaCode, areaNombre: VOCATIONAL_AREAS[a as AreaCode], delta: numVal }),
      );
    } else if (['P4.13', 'P4.14', 'P4.15'].includes(questionCode)) {
      // Emprendedor
      ['05', '06'].forEach((a) =>
        additions.push({ areaCodigo: a as AreaCode, areaNombre: VOCATIONAL_AREAS[a as AreaCode], delta: numVal }),
      );
    } else if (['P4.16', 'P4.17', 'P4.18'].includes(questionCode)) {
      // Convencional
      ['05', '07', '09'].forEach((a) =>
        additions.push({ areaCodigo: a as AreaCode, areaNombre: VOCATIONAL_AREAS[a as AreaCode], delta: numVal }),
      );
    }
  }

  // Sección 5: P5.1 a P5.3 (+3 pts)
  const optStr = String(value);
  if (['P5.1', 'P5.2', 'P5.3'].includes(questionCode)) {
    const hobbyMap = S5_HOBBY_MAP[questionCode as 'P5.1' | 'P5.2' | 'P5.3'];
    const areas = hobbyMap?.[optStr] ?? [];
    for (const a of areas) {
      additions.push({ areaCodigo: a, areaNombre: VOCATIONAL_AREAS[a], delta: 3 });
    }
  }

  // Sección 6: P6.6 = 'd' (+2 pts Área 09)
  if (questionCode === 'P6.6' && optStr === 'd') {
    additions.push({ areaCodigo: '09', areaNombre: VOCATIONAL_AREAS['09'], delta: 2 });
  }

  return {
    hasImpact: additions.length > 0 || subtractions.length > 0,
    additions,
    subtractions,
    isContextOnly: isContextQuestion(questionCode),
    ruleDescription: getQuestionRuleInfo(questionCode),
  };
}

/**
 * Obtiene qué áreas recibirán puntos si se elige una opción específica.
 */
export function getOptionScorePreview(
  questionCode: string,
  optionCode: string,
): { delta: number; areas: AreaCode[] } | null {
  if (questionCode === 'P1.1') {
    const areas = S1_CURRICULAR_AREA_MAP[optionCode] ?? [];
    return areas.length > 0 ? { delta: 1, areas } : null;
  }
  if (questionCode === 'P1.2') {
    const areas = S1_CURRICULAR_AREA_MAP[optionCode] ?? [];
    return areas.length > 0 ? { delta: -1, areas } : null;
  }
  if (['P5.1', 'P5.2', 'P5.3'].includes(questionCode)) {
    const areas = S5_HOBBY_MAP[questionCode as 'P5.1' | 'P5.2' | 'P5.3']?.[optionCode] ?? [];
    return areas.length > 0 ? { delta: 3, areas } : null;
  }
  if (questionCode === 'P6.6' && optionCode === 'd') {
    return { delta: 2, areas: ['09'] };
  }
  return null;
}

function isContextQuestion(code: string): boolean {
  if (code === 'P1.7') return true;
  if (code.startsWith('P2.')) return true;
  if (code === 'P5.4') return true;
  if (['P6.1', 'P6.2', 'P6.3', 'P6.4', 'P6.5'].includes(code)) return true;
  if (code === 'P6.6') return false; // Puede sumar +2
  return false;
}

function getQuestionRuleInfo(code: string): string {
  if (code === 'P1.1') return 'P1.1 (Paso 2): Otorga +1 punto a las áreas curriculares afines.';
  if (code === 'P1.2') return 'P1.2 (Paso 2): Resta −1 punto a las áreas curriculares afines.';
  if (code === 'P1.3') return 'P1.3 (Paso 2): Suma su valor directo (1–5) a 02 Ingenierías, 03 Básicas y 05 Económicas.';
  if (code === 'P1.4') return 'P1.4 (Paso 2): Suma su valor directo (1–5) a 01 Salud, 03 Básicas y 08 Agrarias.';
  if (code === 'P1.5') return 'P1.5 (Paso 2): Suma su valor directo (1–5) a 04 Sociales y 07 Educación.';
  if (code === 'P1.6') return 'P1.6 (Paso 2): Suma su valor directo (1–5) a 06 Arte y Diseño.';
  if (code === 'P1.7') return 'P1.7: Indicador de confiabilidad y dedicación (no suma puntaje numérico a áreas).';
  if (code.startsWith('P2.')) return 'Sección 2 (Paso 3): Perfil Psicométrico modulador (evalúa madurez emocional, no asigna carrera).';
  if (['P3.1', 'P3.2', 'P3.3'].includes(code)) return 'Grupo 3A Lógico-Matemático: Suma a 02 Ingenierías, 03 Básicas y 05 Económicas.';
  if (['P3.4', 'P3.5', 'P3.6'].includes(code)) return 'Grupo 3B Comprensión Verbal: Suma a 04 Sociales, 06 Arte y 07 Educación.';
  if (['P3.7', 'P3.8', 'P3.9'].includes(code)) return 'Grupo 3C Espacial/Visual: Suma a 02 Ingenierías, 06 Arte y 08 Agrarias.';
  if (['P4.1', 'P4.2', 'P4.3'].includes(code)) return 'RIASEC Realista (R): Suma a 02 Ingenierías, 08 Agrarias, 09 FF.AA. y 10 Oficios.';
  if (['P4.4', 'P4.5', 'P4.6'].includes(code)) return 'RIASEC Investigador (I): Suma a 01 Salud, 02 Ingenierías y 03 Básicas.';
  if (['P4.7', 'P4.8', 'P4.9'].includes(code)) return 'RIASEC Artístico (A): Suma a 06 Comunicación, Arte y Diseño.';
  if (['P4.10', 'P4.11', 'P4.12'].includes(code)) return 'RIASEC Social (S): Suma a 01 Salud, 04 Sociales y 07 Educación.';
  if (['P4.13', 'P4.14', 'P4.15'].includes(code)) return 'RIASEC Emprendedor (E): Suma a 05 Económicas y 06 Comunicación, Arte y Diseño.';
  if (['P4.16', 'P4.17', 'P4.18'].includes(code)) return 'RIASEC Convencional (C): Suma a 05 Económicas, 07 Educación y 09 FF.AA.';
  if (['P5.1', 'P5.2', 'P5.3'].includes(code)) return 'Sección 5 (Paso 6): La opción elegida otorga +3 puntos a las áreas vinculadas.';
  if (code === 'P5.4') return 'P5.4: Grado de exploración extracurricular (indicador de madurez, 0 pts).';
  if (code === 'P6.6') return 'P6.6: Si marca d (Escuela militar/policial), otorga +2 puntos al Área 09.';
  if (code.startsWith('P6.')) return 'Sección 6 (Paso 7): Contexto socioeconómico y familiar (0 pts).';
  return 'Plantilla de Corrección Oficial UPAO 2026.';
}
