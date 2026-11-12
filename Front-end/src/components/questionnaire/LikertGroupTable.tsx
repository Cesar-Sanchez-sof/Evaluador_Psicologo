import { LIKERT_SCALE } from '../../data/questionnaireData';
import type { LikertGroupBlock, LikertValue, StudentAnswers } from '../../types/questionnaire';

interface LikertGroupTableProps {
  group: LikertGroupBlock;
  answers: StudentAnswers;
  onSelect: (questionId: string, value: LikertValue) => void;
}

export function LikertGroupTable({ group, answers, onSelect }: LikertGroupTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3.5 sm:px-6">
        <p className="text-sm font-semibold text-slate-800">{group.prompt}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
          {LIKERT_SCALE.map((scale) => (
            <span key={scale.value}>
              <strong className="font-bold text-blue-900">{scale.value}</strong> = {scale.label}
            </span>
          ))}
        </div>
      </div>

      {/* Cabecera de columnas en escritorio */}
      <div className="hidden border-b border-slate-200 bg-blue-950 px-6 py-2.5 text-xs font-semibold text-white md:grid md:grid-cols-[1fr_280px] md:items-center md:gap-4">
        <div className="flex items-center gap-3">
          <span className="w-14">N.°</span>
          <span>Afirmación / Enunciado</span>
        </div>
        <div className="grid grid-cols-5 text-center">
          {LIKERT_SCALE.map((scale) => (
            <span key={scale.value} title={scale.label}>
              {scale.value}
            </span>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {group.subgroups.map((subgroup) => (
          <div key={subgroup.id}>
            {subgroup.title && (
              <div className="border-b border-indigo-100/80 bg-indigo-50/60 px-5 py-2.5 sm:px-6">
                <h4 className="text-xs font-bold tracking-wide text-indigo-950 uppercase sm:text-sm sm:normal-case">
                  {subgroup.title}
                </h4>
              </div>
            )}

            <div className="divide-y divide-slate-100">
              {subgroup.items.map((item) => {
                const currentValue = answers[item.id] as LikertValue | undefined;

                return (
                  <div
                    key={item.id}
                    className={`px-5 py-4 transition sm:px-6 md:grid md:grid-cols-[1fr_280px] md:items-center md:gap-4 ${
                      currentValue ? 'bg-blue-50/25' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex w-14 shrink-0 items-center justify-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-blue-900">
                        {item.code}
                      </span>
                      <p className="text-sm leading-relaxed text-slate-800">{item.statement}</p>
                    </div>

                    <div
                      className="mt-3 grid grid-cols-5 gap-2 md:mt-0 md:gap-1.5"
                      role="radiogroup"
                      aria-label={`${item.code}: ${item.statement}`}
                    >
                      {LIKERT_SCALE.map((scale) => {
                        const isSelected = currentValue === scale.value;
                        return (
                          <button
                            key={scale.value}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            title={`${scale.value} — ${scale.label}`}
                            onClick={() => onSelect(item.id, scale.value)}
                            className={`flex h-9 items-center justify-center rounded-lg border text-xs font-bold transition sm:h-10 ${
                              isSelected
                                ? 'border-blue-700 bg-blue-700 text-white shadow-xs'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-900'
                            }`}
                          >
                            {scale.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
