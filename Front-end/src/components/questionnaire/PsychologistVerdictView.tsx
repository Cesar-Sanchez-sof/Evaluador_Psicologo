import { Calculator, Loader2, Save, Sparkles } from 'lucide-react';
import type { EvaluationScoringPreview } from '../../types/questionnaire';
import { mapPreviewToScoringDisplay, ScoringSummaryCard } from '../results/ScoringSummaryCard';

interface PsychologistVerdictViewProps {
  scoringPreview: EvaluationScoringPreview | null;
  loadingPreview?: boolean;
  previewError?: string | null;
  missingQuestionsCount?: number;
  onSave?: () => void;
  saveButtonLabel?: string;
  saving?: boolean;
  saveDisabledReason?: string | null;
  submitError?: string | null;
}

export function PsychologistVerdictView({
  scoringPreview,
  loadingPreview = false,
  previewError = null,
  missingQuestionsCount = 0,
  onSave,
  saveButtonLabel = 'Guardar Encuesta y Resultados en PostgreSQL',
  saving = false,
  saveDisabledReason = null,
  submitError = null,
}: PsychologistVerdictViewProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <div className="border-b border-blue-900/10 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 px-6 py-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-200 uppercase">
            <Calculator className="h-4 w-4" />
            Evaluación Automatizada — Plantilla de Corrección Oficial
          </div>
          {scoringPreview && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
              <Sparkles className="h-3.5 w-3.5" />
              Área #1: {scoringPreview.primeraOpcionCodigo} (
              {scoringPreview.primeraOpcionPorcentaje.toFixed(1)}%)
            </span>
          )}
        </div>
        <h2 className="mt-1 text-xl font-bold">
          SECCIÓN 7: VEREDICTO DEL EXPERTO — FICHA DE EVALUACIÓN AUTOMÁTICA
        </h2>
        <p className="mt-1 text-sm text-blue-100/90">
          Esta ficha no requiere llenado manual. Todas las sumatorias (S1–S6), los puntajes
          consolidados del Paso 8 y el porcentaje de orientación hacia cada una de las 10 áreas
          vocacionales se calculan automáticamente a partir de la Plantilla de Corrección.
        </p>
      </div>

      <div className="space-y-6 p-6">
        {loadingPreview && (
          <div className="flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-4 text-sm text-blue-950">
            <Loader2 className="h-4 w-4 animate-spin text-blue-700" />
            Calculando sumatorias y porcentaje de orientación por área vocacional...
          </div>
        )}

        {previewError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {previewError}
          </div>
        )}

        {!loadingPreview && !scoringPreview && missingQuestionsCount > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-amber-950">
            Aún faltan <strong>{missingQuestionsCount}</strong> preguntas por responder en las
            Secciones 1 a 6 para generar automáticamente las sumatorias por sección y el porcentaje
            de orientación de las 10 áreas vocacionales en esta Sección 7.
          </div>
        )}

        {scoringPreview && !loadingPreview && (
          <ScoringSummaryCard data={mapPreviewToScoringDisplay(scoringPreview)} />
        )}

        {submitError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800">
            {submitError}
          </div>
        )}

        {onSave && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-600">
              {saveDisabledReason ??
                'Se guardarán las respuestas del estudiante, todas las sumatorias (S1–S6) y el porcentaje de orientación por área en PostgreSQL.'}
            </p>
            <button
              type="button"
              disabled={Boolean(saveDisabledReason) || saving}
              onClick={onSave}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Guardando resultados...' : saveButtonLabel}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
