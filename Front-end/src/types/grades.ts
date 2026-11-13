/**
 * Catálogo de Notas Académicas Oficiales (11 cursos del nivel secundaria).
 *
 * Reglas de conversión definidas por la institución:
 *   AD = 19 | A = 16 | B = 12 | C = 8
 *
 * El promedio horizontal de cada competencia es (T1 + T2) / 2.
 * Si falta una de las dos notas, se promedia solo la nota presente.
 * El promedio vertical del curso es la suma de los promedios de sus
 * competencias dividida entre el total de competencias del curso.
 */

export const GRADE_VALUES = {
  AD: 19,
  A: 16,
  B: 12,
  C: 8,
} as const;

export type GradeLetter = keyof typeof GRADE_VALUES;
export type GradePeriod = 'T1' | 'T2';

export type CourseId =
  | 'dpcc'
  | 'ccss'
  | 'er'
  | 'ept'
  | 'ef'
  | 'com'
  | 'arte'
  | 'csl'
  | 'ing'
  | 'mat'
  | 'cyt';

export interface GradeCompetency {
  id: string;
  name: string;
}

export interface GradeCourse {
  id: CourseId;
  name: string;
  competencies: GradeCompetency[];
}

export interface GradeEntry {
  T1?: GradeLetter;
  T2?: GradeLetter;
}

/** Clave: `${courseId}:${competencyIndex}`. */
export type GradesState = Record<string, GradeEntry>;

export type OfficialGrades = Record<CourseId, number>;

export const GRADE_LETTERS: GradeLetter[] = ['AD', 'A', 'B', 'C'];

export const GRADE_COURSES: GradeCourse[] = [
  {
    id: 'dpcc',
    name: 'Desarrollo Personal, Ciudadanía y Cívica',
    competencies: [
      { id: 'dpcc-1', name: 'Construye su identidad' },
      {
        id: 'dpcc-2',
        name: 'Convive y participa democráticamente en la búsqueda del bien común',
      },
    ],
  },
  {
    id: 'ccss',
    name: 'Ciencias Sociales',
    competencies: [
      { id: 'ccss-1', name: 'Construye interpretaciones históricas' },
      {
        id: 'ccss-2',
        name: 'Gestiona responsablemente el espacio y el ambiente',
      },
      {
        id: 'ccss-3',
        name: 'Gestiona responsablemente los recursos económicos',
      },
    ],
  },
  {
    id: 'er',
    name: 'Educación Religiosa',
    competencies: [
      {
        id: 'er-1',
        name: 'Construye su identidad como persona humana, amada por Dios, digna, libre y trascendente',
      },
      {
        id: 'er-2',
        name: 'Asume la experiencia del encuentro personal y comunitario con Dios en su proyecto de vida',
      },
    ],
  },
  {
    id: 'ept',
    name: 'Educación para el Trabajo',
    competencies: [
      {
        id: 'ept-1',
        name: 'Gestiona proyectos de emprendimiento económico o social',
      },
    ],
  },
  {
    id: 'ef',
    name: 'Educación Física',
    competencies: [
      {
        id: 'ef-1',
        name: 'Se desenvuelve de manera autónoma a través de su motricidad',
      },
      { id: 'ef-2', name: 'Asume una vida saludable' },
      {
        id: 'ef-3',
        name: 'Interactúa a través de sus habilidades sociomotrices',
      },
    ],
  },
  {
    id: 'com',
    name: 'Comunicación',
    competencies: [
      { id: 'com-1', name: 'Se comunica oralmente en su lengua materna' },
      {
        id: 'com-2',
        name: 'Lee diversos tipos de textos escritos en su lengua materna',
      },
      {
        id: 'com-3',
        name: 'Escribe diversos tipos de textos en su lengua materna',
      },
    ],
  },
  {
    id: 'arte',
    name: 'Arte y Cultura',
    competencies: [
      {
        id: 'arte-1',
        name: 'Aprecia de manera crítica manifestaciones artístico-culturales',
      },
      { id: 'arte-2', name: 'Crea proyectos desde los lenguajes artísticos' },
    ],
  },
  {
    id: 'csl',
    name: 'Castellano como Segunda Lengua',
    competencies: [
      {
        id: 'csl-1',
        name: 'Se comunica oralmente en castellano como segunda lengua',
      },
      {
        id: 'csl-2',
        name: 'Lee diversos tipos de textos escritos en castellano como segunda lengua',
      },
      {
        id: 'csl-3',
        name: 'Escribe diversos tipos de textos en castellano como segunda lengua',
      },
    ],
  },
  {
    id: 'ing',
    name: 'Inglés',
    competencies: [
      {
        id: 'ing-1',
        name: 'Se comunica oralmente en inglés como lengua extranjera',
      },
      {
        id: 'ing-2',
        name: 'Lee diversos tipos de textos escritos en inglés como lengua extranjera',
      },
      {
        id: 'ing-3',
        name: 'Escribe diversos tipos de textos en inglés como lengua extranjera',
      },
    ],
  },
  {
    id: 'mat',
    name: 'Matemática',
    competencies: [
      { id: 'mat-1', name: 'Resuelve problemas de cantidad' },
      {
        id: 'mat-2',
        name: 'Resuelve problemas de regularidad, equivalencia y cambio',
      },
      {
        id: 'mat-3',
        name: 'Resuelve problemas de forma, movimiento y localización',
      },
      {
        id: 'mat-4',
        name: 'Resuelve problemas de gestión de datos e incertidumbre',
      },
    ],
  },
  {
    id: 'cyt',
    name: 'Ciencia y Tecnología',
    competencies: [
      {
        id: 'cyt-1',
        name: 'Indaga mediante métodos científicos para construir conocimientos',
      },
      {
        id: 'cyt-2',
        name: 'Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo',
      },
      {
        id: 'cyt-3',
        name: 'Diseña y construye soluciones tecnológicas para resolver problemas de su entorno',
      },
    ],
  },
];

export const TOTAL_GRADE_SELECTORS = GRADE_COURSES.reduce(
  (total, course) => total + course.competencies.length * 2,
  0,
);

export function gradeKey(courseId: CourseId, competencyIndex: number): string {
  return `${courseId}:${competencyIndex}`;
}

function roundGrade(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getCompetencyAverage(entry: GradeEntry | undefined): number | null {
  if (!entry) return null;
  const values = [entry.T1, entry.T2]
    .filter((letter): letter is GradeLetter => letter !== undefined)
    .map((letter) => GRADE_VALUES[letter]);
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Promedio vertical del curso. Se usa el total de competencias del curso como
 * denominador (regla solicitada), por lo que mientras falten notas la vista
 * previa irá variando hasta completar todos los selectores.
 */
export function getCourseFinalGrade(
  course: GradeCourse,
  values: GradesState,
): number | null {
  const averages = course.competencies.map((_, index) =>
    getCompetencyAverage(values[gradeKey(course.id, index)]),
  );
  if (averages.every((average) => average === null)) return null;
  const sum = averages.reduce<number>(
    (total, average) => total + (average ?? 0),
    0,
  );
  return roundGrade(sum / course.competencies.length);
}

export function countMissingGradeSelectors(values: GradesState): number {
  let missing = 0;
  for (const course of GRADE_COURSES) {
    course.competencies.forEach((_, index) => {
      const entry = values[gradeKey(course.id, index)];
      if (!entry?.T1) missing += 1;
      if (!entry?.T2) missing += 1;
    });
  }
  return missing;
}

export function areGradesComplete(values: GradesState): boolean {
  return countMissingGradeSelectors(values) === 0;
}

export function buildOfficialGrades(values: GradesState): OfficialGrades {
  return GRADE_COURSES.reduce((grades, course) => {
    const finalGrade = getCourseFinalGrade(course, values) ?? 0;
    grades[course.id] = roundGrade(finalGrade);
    return grades;
  }, {} as OfficialGrades);
}

export function formatGrade(value: number | null): string {
  if (value === null) return '—';
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
