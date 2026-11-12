import { CheckCircle2, ClipboardCheck, Home, ShieldAlert } from 'lucide-react';
import { getSectionQuestionIds, QUESTIONNAIRE_SECTIONS } from '../../data/questionnaireData';
import {
  isQuestionAnswered,
  type ActiveStepId,
  type StudentAnswers,
  type ViewMode,
} from '../../types/questionnaire';
import { ProgressBar } from '../common/ProgressBar';

interface SidebarNavProps {
  activeStep: ActiveStepId;
  viewMode: ViewMode;
  onSelectStep: (step: ActiveStepId) => void;
  answers: StudentAnswers;
  totalQuestions: number;
  answeredCount: number;
}

export function SidebarNav({
  activeStep,
  viewMode,
  onSelectStep,
  answers,
  totalQuestions,
  answeredCount,
}: SidebarNavProps) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="border-b border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Estructura del Test
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
              {totalQuestions} ítems
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar
              current={answeredCount}
              total={totalQuestions}
              label="Progreso vista previa"
            />
          </div>
        </div>

        <nav className="space-y-1 p-2.5" aria-label="Secciones del cuestionario">
          <button
            type="button"
            onClick={() => onSelectStep('welcome')}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
              viewMode === 'step' && activeStep === 'welcome'
                ? 'bg-blue-50 font-semibold text-blue-900 ring-1 ring-blue-200/80'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Home className="h-4 w-4 shrink-0 text-blue-700" />
            <div className="min-w-0 flex-1">
              <p className="truncate">Portada y Datos Generales</p>
              <p className="text-[11px] font-normal text-slate-500">Escala 1–5 y filiación</p>
            </div>
          </button>

          <div className="my-1.5 border-t border-slate-100" />

          {QUESTIONNAIRE_SECTIONS.map((section) => {
            const ids = getSectionQuestionIds(section);
            const sectionAnswered = ids.filter((id) => isQuestionAnswered(answers[id])).length;
            const isComplete = sectionAnswered === ids.length && ids.length > 0;
            const isActive = viewMode === 'step' && activeStep === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelectStep(section.id as ActiveStepId)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  isActive
                    ? 'bg-blue-50 font-semibold text-blue-900 ring-1 ring-blue-200/80'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    isComplete
                      ? 'bg-emerald-100 text-emerald-700'
                      : isActive
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : section.number}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate">{section.shortTitle}</p>
                  <p className="text-[11px] font-normal text-slate-500">
                    {sectionAnswered}/{ids.length} preguntas
                  </p>
                </div>
              </button>
            );
          })}

          <div className="my-1.5 border-t border-slate-100" />

          <button
            type="button"
            onClick={() => onSelectStep('section-7')}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
              viewMode === 'step' && activeStep === 'section-7'
                ? 'bg-amber-50 font-semibold text-amber-950 ring-1 ring-amber-300/80'
                : 'text-slate-700 hover:bg-amber-50/60'
            }`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <ShieldAlert className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate">Veredicto del Experto</p>
              </div>
              <p className="text-[11px] font-medium text-amber-700">Sección 7 · Solo Psicólogo</p>
            </div>
            <ClipboardCheck className="h-4 w-4 shrink-0 text-amber-600/80" />
          </button>
        </nav>
      </div>
    </aside>
  );
}
