import { Calculator, Loader2, NotebookPen, Save, Sparkles } from 'lucide-react';
import type { QuestionnaireAlert } from '../../services/observationsHelper';
import type { EvaluationScoringPreview } from '../../types/questionnaire';
import { mapPreviewToScoringDisplay, ScoringSummaryCard } from '../results/ScoringSummaryCard';

interface PsychologistVerdictViewProps {
  scoringPreview: EvaluationScoringPreview | null;
  loadingPreview?: boolean;
  previewError?: string | null;
  missingQuestionsCount?: number;
  alerts?: QuestionnaireAlert[];
  observations?: string;
  onObservationsChange?: (value: string) => void;
  evaluatorName?: string;
  onEvaluatorNameChange?: (value: string) => void;
  cpspNumber?: string;
  onCpspNumberChange?: (value: string) => void;
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
  alerts = [],
  observations = '',
  onObservationsChange,
  evaluatorName = '',
  onEvaluatorNameChange,
  cpspNumber = '',
  onCpspNumberChange,
  onSave,
  saveButtonLabel = 'Guardar Encuesta y Resultados en PostgreSQL',
  saving = false,
  saveDisabledReason = null,
  submitError = null,
}: PsychologistVerdictViewProps) {
  const handleAppendObservation = (text: string) => {
    if (!onObservationsChange) return;
    const trimmed = observations.trim();
    if (!trimmed) {
      onObservationsChange(text);
    } else if (!trimmed.includes(text)) {
      onObservationsChange(`${trimmed}\n• ${text}`);
    }
  };

  const handleAppendAllAlerts = () => {
    if (!onObservationsChange || alerts.length === 0) return;
    const existing = observations.trim();
    const newItems = alerts
      .map((a) => a.suggestedObservation)
      .filter((obs) => !existing.includes(obs));

    if (newItems.length === 0) return;

    if (!existing) {
      onObservationsChange(newItems.map((item) => `• ${item}`).join('\n'));
    } else {
      onObservationsChange(`${existing}\n${newItems.map((item) => `• ${item}`).join('\n')}`);
    }
  };

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
          Esta ficha consolida las sumatorias (S1–S6), los puntajes del Paso 8, el porcentaje de
          orientación hacia cada una de las 10 áreas vocacionales y las observaciones psicopedagógicas
          recogidas durante la evaluación.
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

        {/* Apartado Oficial: Observaciones Psicopedagógicas y Sugerencias Vocacionales */}
        <div className="rounded-2xl border border-indigo-200/90 bg-slate-50/60 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-900/10 text-indigo-900">
                <NotebookPen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  OBSERVACIONES PSICOPEDAGÓGICAS Y SUGERENCIAS VOCACIONALES
                </h3>
                <p className="text-xs text-slate-500">
                  Plantilla de Corrección Oficial (IE Francisco Lizarzaburu — UPAO 2026, Pág. 9)
                </p>
              </div>
            </div>
            {alerts.length > 0 && (
              <span className="rounded-full bg-amber-100 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-900">
                {alerts.length} observación(es) levantada(s)
              </span>
            )}
          </div>

          {/* Hallazgos automáticos según respuestas */}
          {alerts.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950">
                  Hallazgos automáticos detectados según la Plantilla:
                </span>
                <button
                  type="button"
                  onClick={handleAppendAllAlerts}
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:underline"
                >
                  Insertar todas en el texto
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start justify-between gap-2 rounded-lg border border-amber-300/80 bg-white p-2.5 text-xs shadow-2xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{alert.source}:</span>{' '}
                      <span className="text-slate-700">{alert.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAppendObservation(alert.suggestedObservation)}
                      className="shrink-0 rounded-md bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-200 transition"
                    >
                      + Añadir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editor de Observaciones */}
          <div>
            <label
              htmlFor="verdict-observations-text"
              className="block text-xs font-bold tracking-wider text-slate-700 uppercase"
            >
              Observaciones Psicopedagógicas:
            </label>
            <textarea
              id="verdict-observations-text"
              rows={4}
              value={observations}
              onChange={(e) => onObservationsChange?.(e.target.value)}
              placeholder="Escribe aquí las observaciones clínicas, sugerencias vocacionales o consideraciones socioemocionales para el estudiante..."
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs leading-relaxed text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
            />
          </div>

          {/* Datos del evaluador responsable */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-slate-200/80">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Evaluador Responsable (Psicólogo)
              </label>
              <input
                type="text"
                value={evaluatorName}
                onChange={(e) => onEvaluatorNameChange?.(e.target.value)}
                placeholder="Ej. Lic. César Sánchez"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                N.° Colegiatura CPSP (Opcional)
              </label>
              <input
                type="text"
                value={cpspNumber}
                onChange={(e) => onCpspNumberChange?.(e.target.value)}
                placeholder="Ej. CPSP 25890"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {submitError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800">
            {submitError}
          </div>
        )}

        {onSave && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-600">
              {saveDisabledReason ??
                'Se guardarán las respuestas del estudiante, las sumatorias (S1–S6), el porcentaje de orientación vocacional y las observaciones en PostgreSQL.'}
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
