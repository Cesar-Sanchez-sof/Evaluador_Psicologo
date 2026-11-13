import { AlertCircle, CheckCircle2, GraduationCap, Info } from 'lucide-react';
import {
  countMissingGradeSelectors,
  formatGrade,
  getCompetencyAverage,
  getCourseFinalGrade,
  gradeKey,
  GRADE_COURSES,
  GRADE_LETTERS,
  GRADE_VALUES,
  TOTAL_GRADE_SELECTORS,
  type CourseId,
  type GradeEntry,
  type GradeLetter,
  type GradePeriod,
  type GradesState,
} from '../../types/grades';

interface GradesFormProps {
  values: GradesState;
  onChange: (next: GradesState) => void;
}

const PERIODS: GradePeriod[] = ['T1', 'T2'];

export function GradesForm({ values, onChange }: GradesFormProps) {
  const missingSelectors = countMissingGradeSelectors(values);
  const completedSelectors = TOTAL_GRADE_SELECTORS - missingSelectors;
  const isComplete = missingSelectors === 0;

  const handleGradeChange = (
    courseId: CourseId,
    competencyIndex: number,
    period: GradePeriod,
    value: GradeLetter,
  ) => {
    const key = gradeKey(courseId, competencyIndex);
    const nextEntry: GradeEntry = { ...(values[key] ?? {}) };

    // Volver a pulsar la misma letra limpia la selección de ese periodo.
    if (nextEntry[period] === value) {
      delete nextEntry[period];
    } else {
      nextEntry[period] = value;
    }

    onChange({ ...values, [key]: nextEntry });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-900/10 text-indigo-900">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">NOTAS ACADÉMICAS</h3>
          <p className="text-xs text-slate-500">
            Registro oficial de calificaciones · 11 cursos · Periodos T1 y T2
          </p>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/70 p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-indigo-950">
                Leyenda de conversión de calificaciones
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {GRADE_LETTERS.map((letter) => (
                  <span
                    key={letter}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs font-semibold text-indigo-950"
                  >
                    <span className="rounded-md bg-indigo-900 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      {letter}
                    </span>
                    = {GRADE_VALUES[letter]} puntos
                  </span>
                ))}
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-indigo-900/80">
                <strong>Promedio horizontal:</strong> (T1 + T2) / 2 por competencia (si falta una
                nota, se usa la que esté registrada). <strong>Promedio vertical:</strong> suma de
                los promedios de las competencias / total de competencias del curso.
              </p>
              <p className="mt-1.5 rounded-lg bg-white/70 px-3 py-2 text-xs text-indigo-900/80">
                <strong>Ejemplo:</strong> un curso con 2 competencias y promedios 17.50 y 10.00
                obtiene una nota final de (17.50 + 10.00) / 2 ={' '}
                <strong className="text-indigo-950">13.75</strong>.
              </p>
              <p className="mt-1.5 text-[11px] text-indigo-900/70">
                Pulsa una letra para seleccionar. Vuelve a pulsar la misma letra para limpiar ese
                periodo.
              </p>
            </div>
          </div>
        </div>

        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
            isComplete
              ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
              : 'border-amber-200 bg-amber-50/80 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span className="font-semibold">
              {isComplete
                ? 'Todas las calificaciones están completas.'
                : `Faltan ${missingSelectors} calificación${missingSelectors === 1 ? '' : 'es'} por registrar.`}
            </span>
          </div>
          <span className="text-xs font-medium">
            {completedSelectors}/{TOTAL_GRADE_SELECTORS} calificaciones registradas
          </span>
        </div>

        <div className="space-y-4">
          {GRADE_COURSES.map((course, courseIndex) => {
            const finalGrade = getCourseFinalGrade(course, values);
            const courseComplete = course.competencies.every((_, index) => {
              const entry = values[gradeKey(course.id, index)];
              return Boolean(entry?.T1 && entry?.T2);
            });

            return (
              <div
                key={course.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        courseComplete
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {courseComplete ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        courseIndex + 1
                      )}
                    </span>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-bold text-slate-900">{course.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {course.competencies.length} competencia
                        {course.competencies.length === 1 ? '' : 's'} · 0–20
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                      Nota final
                    </span>
                    <span className="min-w-16 rounded-xl bg-indigo-950 px-3 py-1.5 text-center text-lg font-bold text-white tabular-nums">
                      {formatGrade(finalGrade)}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {course.competencies.map((competency, competencyIndex) => {
                    const key = gradeKey(course.id, competencyIndex);
                    const entry = values[key];
                    const average = getCompetencyAverage(entry);

                    return (
                      <div
                        key={competency.id}
                        className="grid grid-cols-1 gap-3 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_auto_92px] lg:items-center"
                      >
                        <div>
                          <p className="text-sm leading-snug text-slate-700">{competency.name}</p>
                        </div>

                        <div className="flex flex-wrap items-end gap-3">
                          {PERIODS.map((period) => (
                            <div key={period}>
                              <span className="mb-1 block text-[11px] font-semibold text-slate-500">
                                {period}
                              </span>
                              <div
                                role="group"
                                aria-label={`${period} · ${course.name} · ${competency.name}`}
                                className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs"
                              >
                                {GRADE_LETTERS.map((letter) => {
                                  const selected = entry?.[period] === letter;
                                  return (
                                    <button
                                      key={letter}
                                      type="button"
                                      aria-pressed={selected}
                                      title={`${period}: ${letter} (${GRADE_VALUES[letter]} puntos). Pulsa de nuevo para limpiar.`}
                                      onClick={() =>
                                        handleGradeChange(
                                          course.id,
                                          competencyIndex,
                                          period,
                                          letter,
                                        )
                                      }
                                      className={`border-r border-slate-200 px-3 py-2 text-xs font-bold transition last:border-r-0 focus:z-10 focus:ring-2 focus:ring-indigo-600/30 focus:outline-none focus:ring-inset ${
                                        selected
                                          ? 'bg-indigo-900 text-white'
                                          : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-900'
                                      }`}
                                    >
                                      {letter}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between gap-2 lg:block lg:text-right">
                          <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase lg:block">
                            Promedio
                          </span>
                          <span className="text-sm font-bold text-slate-700 tabular-nums">
                            {formatGrade(average)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Las competencias individuales no se almacenan en la base de datos: solo se envía y guarda
          la nota final calculada de cada uno de los 11 cursos.
        </p>
      </div>
    </section>
  );
}
