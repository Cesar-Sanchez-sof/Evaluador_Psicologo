import { ArrowDown, ArrowUp, Info } from 'lucide-react';
import { getQuestionScoreImpact } from '../../services/liveScoreTracker';

interface QuestionScoreImpactBadgeProps {
  questionCode: string;
  selectedValue: string | string[] | number | undefined;
  showExplanation?: boolean;
}

export function QuestionScoreImpactBadge({
  questionCode,
  selectedValue,
  showExplanation = false,
}: QuestionScoreImpactBadgeProps) {
  const impact = getQuestionScoreImpact(questionCode, selectedValue);

  if (!impact.hasImpact && !impact.isContextOnly) {
    return null;
  }

  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
      {/* Puntos sumados */}
      {impact.additions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/90 px-2.5 py-1 text-emerald-950">
          <div className="flex items-center gap-1 font-bold text-emerald-800">
            <ArrowUp className="h-3.5 w-3.5" />
            <span>Suma:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {impact.additions.map((item, idx) => (
              <span
                key={`${item.areaCodigo}-${idx}`}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-900"
              >
                +{item.delta} pt{item.delta > 1 ? 's' : ''} a {item.areaCodigo} {item.areaNombre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Puntos restados */}
      {impact.subtractions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/90 px-2.5 py-1 text-rose-950">
          <div className="flex items-center gap-1 font-bold text-rose-800">
            <ArrowDown className="h-3.5 w-3.5" />
            <span>Disminuye:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {impact.subtractions.map((item, idx) => (
              <span
                key={`${item.areaCodigo}-${idx}`}
                className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-1.5 py-0.5 text-[11px] font-semibold text-rose-900"
              >
                {item.delta} pt a {item.areaCodigo} {item.areaNombre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pregunta moduladora / no cuantitativa */}
      {impact.isContextOnly && (
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
          <Info className="h-3.5 w-3.5 text-slate-400" />
          <span>Pregunta moduladora / contexto (no modifica puntajes de áreas)</span>
        </div>
      )}

      {showExplanation && (
        <span
          className="text-[11px] text-slate-400 italic"
          title={impact.ruleDescription}
        >
          {impact.ruleDescription}
        </span>
      )}
    </div>
  );
}
