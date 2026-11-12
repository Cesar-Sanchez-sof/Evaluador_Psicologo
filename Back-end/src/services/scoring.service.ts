import type { ValidatedAnswers } from '../schemas/evaluation.schema.js';
import type { AreaCode, AreaScoreRow, EvaluationScoringResult } from '../types/evaluation.types.js';

interface AreaCatalogItem {
  codigo: AreaCode;
  nombre: string;
  carrerasAfines: string;
}

export const AREAS_CATALOG: AreaCatalogItem[] = [
  {
    codigo: '01',
    nombre: 'Ciencias de la Salud',
    carrerasAfines:
      'Medicina Humana, Enfermería, Odontología, Obstetricia, Farmacia y Bioquímica, Nutrición y Dietética, Tecnología Médica, Psicología Clínica, Fisioterapia y Rehabilitación.',
  },
  {
    codigo: '02',
    nombre: 'Ingenierías y Tecnología',
    carrerasAfines:
      'Ingeniería de Sistemas y Computación, Ingeniería Civil, Ingeniería Industrial, Ingeniería Mecatrónica, Ingeniería Electrónica y Telecomunicaciones, Arquitectura y Urbanismo, Ingeniería Mecánica.',
  },
  {
    codigo: '03',
    nombre: 'Ciencias Básicas y Naturales',
    carrerasAfines:
      'Biología pura, Química, Física, Matemáticas, Estadística Aplicada, Biotecnología, Microbiología, Astronomía.',
  },
  {
    codigo: '04',
    nombre: 'Ciencias Sociales y Humanidades',
    carrerasAfines:
      'Derecho, Psicología Organizacional/Educativa, Sociología, Historia, Filosofía, Antropología, Arqueología, Trabajo Social, Ciencias Políticas, Relaciones Internacionales.',
  },
  {
    codigo: '05',
    nombre: 'Ciencias Económicas y Empresariales',
    carrerasAfines:
      'Administración de Empresas, Contabilidad y Finanzas, Economía, Marketing y Publicidad Comercial, Negocios Internacionales, Gestión Pública, Comercio Exterior, Banca y Seguros.',
  },
  {
    codigo: '06',
    nombre: 'Comunicación, Arte y Diseño',
    carrerasAfines:
      'Ciencias de la Comunicación, Publicidad, Diseño Gráfico Digital, Producción Audiovisual, Cine y Televisión, Animación Digital, Artes Plásticas, Fotografía, Música, Diseño de Interiores.',
  },
  {
    codigo: '07',
    nombre: 'Educación y Pedagogía',
    carrerasAfines:
      'Educación Inicial, Educación Primaria, Educación Secundaria (en diversas especialidades), Educación Física, Educación Especial, Psicopedagogía, Docencia de Idiomas.',
  },
  {
    codigo: '08',
    nombre: 'Ciencias Agrarias y Ambientales',
    carrerasAfines:
      'Ingeniería Agronómica, Medicina Veterinaria y Zootecnia, Ingeniería Ambiental, Ingeniería Forestal, Ingeniería Agroindustrial, Ingeniería Pesquera, Acuicultura.',
  },
  {
    codigo: '09',
    nombre: 'Fuerzas Armadas y Orden',
    carrerasAfines:
      'Escuela de Oficiales/Suboficiales de la Policía Nacional del Perú (PNP), Escuela Naval (Marina de Guerra), Escuela Militar de Chorrillos (Ejército), FAP (Fuerza Aérea), Cuerpo General de Bomberos.',
  },
  {
    codigo: '10',
    nombre: 'Oficios Técnicos y Tecnológicos',
    carrerasAfines:
      'Mecánica Automotriz, Electricidad Industrial, Gastronomía y Arte Culinario, Computación e Informática Técnica, Redes y Conectividad, Soldadura y Construcciones Metálicas, Cosmetología.',
  },
];

const S1_CURRICULAR_AREA_MAP: Record<string, AreaCode[]> = {
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

const S5_HOBBY_MAP: Record<'P5.1' | 'P5.2' | 'P5.3', Record<string, AreaCode[]>> = {
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

function addPoints(bucket: Record<AreaCode, number>, areas: AreaCode[], delta: number): void {
  for (const area of areas) {
    bucket[area] += delta;
  }
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

function interpretSeccion2(totalS2: number): {
  nivel: 'ALTO' | 'MEDIO' | 'BAJO' | 'MUY BAJO';
  interpretacion: string;
} {
  if (totalS2 >= 36) {
    return {
      nivel: 'ALTO',
      interpretacion:
        'Perfil emocional sólido. Puede afrontar carreras de alta exigencia académica sin problema.',
    };
  }
  if (totalS2 >= 27) {
    return {
      nivel: 'MEDIO',
      interpretacion: 'Nivel normal y adecuado. Sin dificultades emocionales relevantes.',
    };
  }
  if (totalS2 >= 18) {
    return {
      nivel: 'BAJO',
      interpretacion:
        'Suele abrumarse ante exámenes. Puede requerir acompañamiento o tutoría vocacional.',
    };
  }
  return {
    nivel: 'MUY BAJO',
    interpretacion:
      'Alerta psicopedagógica. Priorizar apoyo socioemocional escolar antes de la decisión final.',
  };
}

function interpretP17(val: number): string {
  if (val >= 4) return 'Organizado y dedicado (perfil sólido)';
  if (val === 3) return 'Dedicación moderada';
  return 'Posible potencial desaprovechado o dificultad de estudio (anotar en observaciones)';
}

function interpretP54(opt: string): string {
  switch (opt) {
    case 'a':
      return 'Menos de 2 h: Poca exploración de intereses (perfil en desarrollo)';
    case 'b':
      return '2 a 5 h: Nivel estándar de dedicación';
    case 'c':
      return '6 a 10 h: Alto compromiso e intereses definidos';
    case 'd':
      return 'Más de 10 h: Muy alta dedicación y vocación temprana';
    default:
      return '';
  }
}

/**
 * Calcula toda la evaluación según las reglas oficiales de `Plantilla_Correccion_Cuestionario_OV.pdf`.
 */
export function evaluateQuestionnaire(answers: ValidatedAnswers): EvaluationScoringResult {
  const s1 = createZeroBucket();
  const s3 = createZeroBucket();
  const s4 = createZeroBucket();
  const s5 = createZeroBucket();
  const s6 = createZeroBucket();

  // Paso 2 — Sección 1: P1.1 (+1 por cada opción múltiple) y P1.2 (-1 por cada opción múltiple)
  for (const opt of answers['P1.1']) {
    addPoints(s1, S1_CURRICULAR_AREA_MAP[opt] ?? [], 1);
  }
  for (const opt of answers['P1.2']) {
    addPoints(s1, S1_CURRICULAR_AREA_MAP[opt] ?? [], -1);
  }

  // P1.3 a P1.6 (valor directo)
  addPoints(s1, ['02', '03', '05'], answers['P1.3']);
  addPoints(s1, ['01', '03', '08'], answers['P1.4']);
  addPoints(s1, ['04', '07'], answers['P1.5']);
  addPoints(s1, ['06'], answers['P1.6']);

  // Paso 3 — Sección 2: Perfil Psicométrico (moduladora, no asigna carrera)
  const grupoAAutoeficacia = answers['P2.1'] + answers['P2.2'] + answers['P2.3'];
  const grupoBResiliencia = answers['P2.4'] + answers['P2.5'] + answers['P2.6'];
  const grupoCEstres = answers['P2.7'] + answers['P2.8'] + answers['P2.9'];
  const totalS2 = grupoAAutoeficacia + grupoBResiliencia + grupoCEstres;
  const s2Eval = interpretSeccion2(totalS2);

  // Paso 4 — Sección 3: Aptitudes Cognitivas
  const puntaje3a = answers['P3.1'] + answers['P3.2'] + answers['P3.3'];
  const puntaje3b = answers['P3.4'] + answers['P3.5'] + answers['P3.6'];
  const puntaje3c = answers['P3.7'] + answers['P3.8'] + answers['P3.9'];

  addPoints(s3, ['02', '03', '05'], puntaje3a);
  addPoints(s3, ['04', '06', '07'], puntaje3b);
  addPoints(s3, ['02', '06', '08'], puntaje3c);

  // Paso 5 — Sección 4: Personalidad RIASEC
  const rRealista = answers['P4.1'] + answers['P4.2'] + answers['P4.3'];
  const iInvestigador = answers['P4.4'] + answers['P4.5'] + answers['P4.6'];
  const aArtistico = answers['P4.7'] + answers['P4.8'] + answers['P4.9'];
  const sSocial = answers['P4.10'] + answers['P4.11'] + answers['P4.12'];
  const eEmprendedor = answers['P4.13'] + answers['P4.14'] + answers['P4.15'];
  const cConvencional = answers['P4.16'] + answers['P4.17'] + answers['P4.18'];

  addPoints(s4, ['02', '08', '09', '10'], rRealista);
  addPoints(s4, ['01', '02', '03'], iInvestigador);
  addPoints(s4, ['06'], aArtistico);
  addPoints(s4, ['01', '04', '07'], sSocial);
  addPoints(s4, ['05', '06'], eEmprendedor);
  addPoints(s4, ['05', '07', '09'], cConvencional);

  // Paso 6 — Sección 5: Intereses y Hobbies (+3 puntos en P5.1, P5.2, P5.3)
  addPoints(s5, S5_HOBBY_MAP['P5.1'][answers['P5.1']] ?? [], 3);
  addPoints(s5, S5_HOBBY_MAP['P5.2'][answers['P5.2']] ?? [], 3);
  addPoints(s5, S5_HOBBY_MAP['P5.3'][answers['P5.3']] ?? [], 3);

  // Paso 7 — Sección 6: Excepción P6.6 = 'd' (+2 puntos al Área 09)
  if (answers['P6.6'] === 'd') {
    s6['09'] += 2;
  }

  // Paso 8 — Consolidación y ranking con criterios de desempate
  const preferTechOrWork = answers['P6.6'] === 'c' || answers['P6.5'] === 'c';
  const preferMilitary = answers['P6.6'] === 'd';

  const unsortedRows = AREAS_CATALOG.map((area) => {
    const ptosS1 = s1[area.codigo];
    const ptosS3 = s3[area.codigo];
    const ptosS4 = s4[area.codigo];
    const ptosS5 = s5[area.codigo];
    const bonusS6 = s6[area.codigo];
    return {
      areaCodigo: area.codigo,
      areaNombre: area.nombre,
      ptosS1,
      ptosS3,
      ptosS4,
      ptosS5,
      bonusS6,
      totalArea: ptosS1 + ptosS3 + ptosS4 + ptosS5 + bonusS6,
    };
  });

  unsortedRows.sort((a, b) => {
    if (b.totalArea !== a.totalArea) return b.totalArea - a.totalArea;

    const aBoost =
      (preferTechOrWork && a.areaCodigo === '10') || (preferMilitary && a.areaCodigo === '09')
        ? 1
        : 0;
    const bBoost =
      (preferTechOrWork && b.areaCodigo === '10') || (preferMilitary && b.areaCodigo === '09')
        ? 1
        : 0;
    if (bBoost !== aBoost) return bBoost - aBoost;

    if (b.ptosS4 !== a.ptosS4) return b.ptosS4 - a.ptosS4;
    return a.areaCodigo.localeCompare(b.areaCodigo);
  });

  const sumaTotalPositiva = unsortedRows.reduce(
    (acc, row) => acc + Math.max(row.totalArea, 0),
    0,
  );

  const detalleAreas: AreaScoreRow[] = unsortedRows.map((row, idx) => ({
    ...row,
    porcentajeOrientacion:
      sumaTotalPositiva > 0
        ? Math.round((Math.max(row.totalArea, 0) / sumaTotalPositiva) * 10000) / 100
        : 0,
    ordenPrioridad: idx + 1,
  }));

  const primera = detalleAreas[0];
  const segunda = detalleAreas[1];
  const primeraCatalog = AREAS_CATALOG.find((a) => a.codigo === primera.areaCodigo)!;

  return {
    primeraOpcionCodigo: primera.areaCodigo,
    primeraOpcionNombre: primera.areaNombre,
    primeraOpcionPuntaje: primera.totalArea,
    primeraOpcionPorcentaje: primera.porcentajeOrientacion,
    segundaOpcionCodigo: segunda.areaCodigo,
    segundaOpcionNombre: segunda.areaNombre,
    segundaOpcionPuntaje: segunda.totalArea,
    segundaOpcionPorcentaje: segunda.porcentajeOrientacion,
    requiereRevisionEmpateDual:
      primera.totalArea === segunda.totalArea && primera.ptosS4 === segunda.ptosS4,
    carrerasRecomendadasPrimeraOpcion: primeraCatalog.carrerasAfines,
    seccion1Detalle: {
      p1_1Opciones: answers['P1.1'],
      p1_2Opciones: answers['P1.2'],
      p1_3Matematica: answers['P1.3'],
      p1_4Ciencias: answers['P1.4'],
      p1_5Humanidades: answers['P1.5'],
      p1_6Arte: answers['P1.6'],
    },
    seccion2: {
      grupoAAutoeficacia,
      grupoBResiliencia,
      grupoCEstres,
      totalS2,
      nivelPsicometrico: s2Eval.nivel,
      interpretacionS2: s2Eval.interpretacion,
    },
    seccion3: {
      puntaje3aLogicoMatematico: puntaje3a,
      puntaje3bComprensionVerbal: puntaje3b,
      puntaje3cEspacialVisual: puntaje3c,
    },
    seccion4Riasec: {
      rRealista,
      iInvestigador,
      aArtistico,
      sSocial,
      eEmprendedor,
      cConvencional,
    },
    seccion5Detalle: {
      p5_1: answers['P5.1'],
      p5_2: answers['P5.2'],
      p5_3: answers['P5.3'],
    },
    seccion6Detalle: {
      bonusArea09: s6['09'],
    },
    indicadoresApoyo: {
      p1_7Dedicacion: answers['P1.7'],
      p1_7Interpretacion: interpretP17(answers['P1.7']),
      p5_4Opcion: answers['P5.4'],
      p5_4Interpretacion: interpretP54(answers['P5.4']),
      p6_3Internet: answers['P6.3'],
      p6_4Computadora: answers['P6.4'],
      p6_5PlanPrincipal: answers['P6.5'],
      p6_6TipoInstitucion: answers['P6.6'],
    },
    detalleAreas,
  };
}
