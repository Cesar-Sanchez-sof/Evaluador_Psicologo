import {
  AlertCircle,
  AlertTriangle,
  Check,
  ChevronRight,
  Info,
  NotebookPen,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { QuestionnaireAlert } from '../../services/observationsHelper';

interface ObservationsDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  alerts: QuestionnaireAlert[];
  observations: string;
  onObservationsChange: (value: string) => void;
  evaluatorName: string;
  onEvaluatorNameChange: (value: string) => void;
  cpspNumber: string;
  onCpspNumberChange: (value: string) => void;
  onNavigateToVerdict?: () => void;
}

export function ObservationsDrawer({
  isOpen,
  onToggle,
  alerts,
  observations,
  onObservationsChange,
  evaluatorName,
  onEvaluatorNameChange,
  cpspNumber,
  onCpspNumberChange,
  onNavigateToVerdict,
}: ObservationsDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAppendObservation = (text: string, alertId?: string) => {
    const trimmed = observations.trim();
    if (!trimmed) {
      onObservationsChange(text);
    } else if (!trimmed.includes(text)) {
      onObservationsChange(`${trimmed}\n• ${text}`);
    }
    if (alertId) {
      setCopiedId(alertId);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const handleAppendAllAlerts = () => {
    if (alerts.length === 0) return;
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

  const alertCount = alerts.filter((a) => a.level === 'alerta').length;
  const warningCount = alerts.filter((a) => a.level === 'advertencia').length;

  return (
    <>
      {/* Botón flotante para abrir el panel */}
      <div className="fixed right-5 bottom-5 z-40">
        <button
          type="button"
          onClick={onToggle}
          title="Abrir cuaderno de observaciones psicopedagógicas"
          className="group relative flex items-center gap-2.5 rounded-full bg-blue-900 px-4 py-3 text-sm font-semibold text-white shadow-xl ring-4 ring-blue-900/20 transition-all hover:bg-blue-800 hover:shadow-2xl hover:scale-105 active:scale-95"
        >
          <NotebookPen className="h-5 w-5 text-blue-200 transition group-hover:rotate-6" />
          <span>Observaciones</span>
          {alerts.length > 0 && (
            <span
              className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                alertCount > 0
                  ? 'bg-rose-500 text-white animate-pulse'
                  : warningCount > 0
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-blue-600 text-white'
              }`}
            >
              {alerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Drawer / Panel lateral deslizable */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Fondo oscuro traslúcido */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onToggle}
          />

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md bg-white shadow-2xl flex flex-col">
              {/* Encabezado */}
              <div className="border-b border-blue-900/10 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 px-5 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <NotebookPen className="h-5 w-5 text-blue-300" />
                    <h2 className="text-base font-bold">Observaciones del Evaluador</h2>
                  </div>
                  <button
                    type="button"
                    onClick={onToggle}
                    className="rounded-lg p-1.5 text-blue-200 hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-blue-100/90">
                  Anota observaciones durante el cuestionario. Se trasladan automáticamente al
                  <strong> Veredicto del Experto (Sección 7)</strong>.
                </p>
              </div>

              {/* Contenido scrolleable */}
              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                {/* 1. Alertas de la Plantilla de Corrección */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-700 uppercase">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      Alertas de la Plantilla ({alerts.length})
                    </h3>
                    {alerts.length > 0 && (
                      <button
                        type="button"
                        onClick={handleAppendAllAlerts}
                        className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                      >
                        Añadir todas
                      </button>
                    )}
                  </div>

                  {alerts.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-center text-xs text-slate-500">
                      Sin alertas por el momento. Conforme respondas preguntas clave (como P1.7,
                      Sección 2, P5.4 o Sección 6), la Plantilla sugerirá observaciones aquí.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {alerts.map((alert) => {
                        const isCopied =
                          copiedId === alert.id ||
                          observations.includes(alert.suggestedObservation);
                        return (
                          <div
                            key={alert.id}
                            className={`rounded-xl border p-3 text-xs transition ${
                              alert.level === 'alerta'
                                ? 'border-rose-300 bg-rose-50/80 text-rose-950'
                                : alert.level === 'advertencia'
                                  ? 'border-amber-300 bg-amber-50/80 text-amber-950'
                                  : 'border-blue-200 bg-blue-50/70 text-blue-950'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5 font-bold">
                                {alert.level === 'alerta' ? (
                                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                                ) : alert.level === 'advertencia' ? (
                                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                                ) : (
                                  <Info className="h-4 w-4 shrink-0 text-blue-600" />
                                )}
                                <span>{alert.source}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleAppendObservation(alert.suggestedObservation, alert.id)
                                }
                                disabled={isCopied}
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                                  isCopied
                                    ? 'bg-slate-200 text-slate-600 cursor-default'
                                    : 'bg-white text-slate-800 shadow-xs hover:bg-slate-100'
                                }`}
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-600" />
                                    Añadida
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-3 w-3" />
                                    Añadir
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="mt-1 font-semibold">{alert.title}</p>
                            <p className="mt-0.5 text-[11px] text-slate-600">{alert.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Área de observaciones libres */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="drawer-observations"
                      className="text-xs font-bold tracking-wider text-slate-700 uppercase"
                    >
                      Anotaciones y Observaciones del Evaluador
                    </label>
                    {observations && (
                      <button
                        type="button"
                        onClick={() => onObservationsChange('')}
                        className="text-[11px] text-slate-400 hover:text-rose-600"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <textarea
                    id="drawer-observations"
                    rows={7}
                    value={observations}
                    onChange={(e) => onObservationsChange(e.target.value)}
                    placeholder="Escribe aquí las observaciones clínicas, pedagógicas o sugerencias que vayas identificando durante la prueba..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs leading-relaxed text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Se almacena automáticamente en el estado y se consolidará en el veredicto final.
                  </p>
                </div>

                {/* 3. Datos del evaluador (opcionales) */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">
                    Datos del Evaluador (Opcional)
                  </h4>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      Psicólogo / Evaluador Responsable
                    </label>
                    <input
                      type="text"
                      value={evaluatorName}
                      onChange={(e) => onEvaluatorNameChange(e.target.value)}
                      placeholder="Ej. Lic. César Sánchez"
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600">
                      N.° Colegiatura CPSP
                    </label>
                    <input
                      type="text"
                      value={cpspNumber}
                      onChange={(e) => onCpspNumberChange(e.target.value)}
                      placeholder="Ej. CPSP 12345"
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Pie del drawer */}
              <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {observations.trim().length > 0
                    ? `${observations.trim().length} caracteres`
                    : 'Sin observaciones'}
                </span>
                {onNavigateToVerdict && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggle();
                      onNavigateToVerdict();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                  >
                    Ir a Sección 7 (Veredicto)
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
