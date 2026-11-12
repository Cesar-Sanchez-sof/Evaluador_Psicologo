import { AlertTriangle, Check, ClipboardCheck, Stethoscope } from 'lucide-react';
import { VOCATIONAL_AREAS } from '../../data/questionnaireData';
import type { PsychologistVerdictState } from '../../types/questionnaire';

interface PsychologistVerdictViewProps {
  verdict: PsychologistVerdictState;
  onChange: (updated: PsychologistVerdictState) => void;
}

export function PsychologistVerdictView({ verdict, onChange }: PsychologistVerdictViewProps) {
  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-amber-300/80 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-widest text-amber-300 uppercase">
                Sección 7 · Apartado Profesional
              </span>
              <h2 className="text-base font-bold tracking-tight sm:text-lg">
                SECCIÓN 7: VEREDICTO DEL EXPERTO — FICHA DE EVALUACIÓN PROFESIONAL
              </h2>
            </div>
          </div>
          <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200 ring-1 ring-amber-300/30">
            Solo Psicólogo Evaluador
          </span>
        </div>

        {/* Aviso importante */}
        <div className="border-b border-amber-200 bg-amber-50/80 px-6 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="text-xs font-extrabold tracking-wide text-amber-950 uppercase">
                AVISO IMPORTANTE — DE USO EXCLUSIVO PARA EL PSICÓLOGO EVALUADOR
              </p>
              <p className="mt-1 text-sm text-amber-900/90">
                Este apartado no debe ser completado por el estudiante. Es llenado por el
                profesional responsable de la orientación vocacional tras analizar los resultados
                de las secciones anteriores.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Datos de la Evaluación Profesional */}
          <div>
            <h3 className="text-sm font-bold tracking-wide text-slate-900 uppercase">
              Datos de la Evaluación Profesional
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label
                  htmlFor="psychologist-name"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Psicólogo(a) evaluador(a):
                </label>
                <input
                  id="psychologist-name"
                  type="text"
                  value={verdict.evaluatorName}
                  onChange={(e) => onChange({ ...verdict, evaluatorName: e.target.value })}
                  placeholder="Nombres y apellidos del psicólogo(a)"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="evaluation-date"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Fecha de evaluación:
                </label>
                <input
                  id="evaluation-date"
                  type="date"
                  value={verdict.evaluationDate}
                  onChange={(e) => onChange({ ...verdict, evaluationDate: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tabla de Áreas Vocacionales Recomendadas */}
          <div>
            <p className="text-sm text-slate-700">
              Tras la revisión integral de las secciones 1 a 6 del presente cuestionario y la
              aplicación de su criterio profesional, indique el área vocacional recomendada para
              este estudiante:
            </p>

            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
              <div className="grid grid-cols-[70px_1fr_70px] bg-blue-950 px-4 py-2.5 text-xs font-semibold text-white">
                <span>Código</span>
                <span>Área Vocacional Recomendada</span>
                <span className="text-center">Marca</span>
              </div>

              <div className="divide-y divide-slate-100">
                {VOCATIONAL_AREAS.map((area) => {
                  const isSelected = verdict.recommendedAreaCode === area.code;
                  return (
                    <button
                      key={area.code}
                      type="button"
                      onClick={() => onChange({ ...verdict, recommendedAreaCode: area.code })}
                      className={`grid w-full grid-cols-[70px_1fr_70px] items-center px-4 py-3 text-left transition ${
                        isSelected ? 'bg-amber-50/80' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-mono text-xs font-bold text-blue-900">{area.code}</span>
                      <div className="pr-3">
                        <p className="text-sm font-semibold text-slate-900">{area.name}</p>
                        <p className="text-xs text-slate-500">({area.examples})</p>
                      </div>
                      <div className="flex justify-center">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-md border transition ${
                            isSelected
                              ? 'border-amber-700 bg-amber-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="h-4 w-4" />}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Observaciones y C.Ps.P. */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label
                htmlFor="psychologist-observations"
                className="block text-xs font-semibold text-slate-700"
              >
                Observaciones psicopedagógicas adicionales:
              </label>
              <textarea
                id="psychologist-observations"
                rows={4}
                value={verdict.observations}
                onChange={(e) => onChange({ ...verdict, observations: e.target.value })}
                placeholder="Anotaciones clínicas, fortalezas detectadas o recomendaciones complementarias..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
              />
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4">
              <div>
                <div className="flex items-center gap-2 text-slate-700">
                  <ClipboardCheck className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-bold uppercase">Firma y Sello</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Psicólogo(a) Evaluador(a) Colegiado(a)
                </p>
              </div>
              <div className="mt-4">
                <label htmlFor="cpsp-number" className="block text-xs font-semibold text-slate-700">
                  C.Ps.P. N.°:
                </label>
                <input
                  id="cpsp-number"
                  type="text"
                  value={verdict.cpspNumber}
                  onChange={(e) => onChange({ ...verdict, cpspNumber: e.target.value })}
                  placeholder="Ej. 12345"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
