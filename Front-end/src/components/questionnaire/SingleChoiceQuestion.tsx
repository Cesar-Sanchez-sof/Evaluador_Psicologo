import { Check } from 'lucide-react';
import type { ChoiceQuestion } from '../../types/questionnaire';

interface SingleChoiceQuestionProps {
  question: ChoiceQuestion;
  selectedValue?: string | string[];
  onSelect: (questionId: string, value: string | string[]) => void;
}

export function SingleChoiceQuestion({
  question,
  selectedValue,
  onSelect,
}: SingleChoiceQuestionProps) {
  const isMultiple = question.type === 'multiple_choice';
  const selectedList = Array.isArray(selectedValue)
    ? selectedValue
    : selectedValue
      ? [selectedValue]
      : [];

  // Usar dos columnas cuando hay muchas opciones breves (como áreas académicas P1.1 y P1.2)
  const useTwoColumns =
    question.options.length > 6 && question.options.every((opt) => opt.label.length < 48);

  const handleOptionClick = (optionCode: string) => {
    if (!isMultiple) {
      onSelect(question.id, optionCode);
      return;
    }

    const exists = selectedList.includes(optionCode);
    const next = exists
      ? selectedList.filter((code) => code !== optionCode)
      : [...selectedList, optionCode];
    onSelect(question.id, next);
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex shrink-0 items-center rounded-lg bg-blue-900 px-2.5 py-1 text-xs font-bold tracking-wide text-white">
            {question.code}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-900 sm:text-base">
                {question.prompt}
              </h4>
              {isMultiple && (
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-600/15">
                  Selección múltiple
                </span>
              )}
            </div>
            {question.note && (
              <p className="mt-1 text-xs font-medium text-slate-500 italic">({question.note})</p>
            )}
          </div>
        </div>
      </div>

      <div
        className={`mt-4 grid gap-2.5 ${useTwoColumns ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
        role={isMultiple ? 'group' : 'radiogroup'}
        aria-label={question.prompt}
      >
        {question.options.map((option) => {
          const isSelected = selectedList.includes(option.code);
          return (
            <button
              key={option.code}
              type="button"
              role={isMultiple ? 'checkbox' : 'radio'}
              aria-checked={isSelected}
              onClick={() => handleOptionClick(option.code)}
              className={`group flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                isSelected
                  ? 'border-blue-700 bg-blue-50/80 text-blue-950 ring-1 ring-blue-700/20'
                  : 'border-slate-200 bg-slate-50/40 text-slate-700 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold uppercase transition ${
                  isMultiple ? 'rounded-md' : 'rounded-full'
                } ${
                  isSelected
                    ? 'bg-blue-700 text-white'
                    : 'border border-slate-300 bg-white text-slate-600 group-hover:border-blue-400'
                }`}
              >
                {isSelected ? <Check className="h-3.5 w-3.5" /> : option.code}
              </span>
              <span className="text-sm leading-snug">
                <span className="mr-1.5 font-semibold text-slate-500">{option.code})</span>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
