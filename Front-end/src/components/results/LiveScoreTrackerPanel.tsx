import {
  Activity,
  AlertTriangle,
  Award,
  ChevronDown,
  ChevronUp,
  Trophy,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { LiveAreaScoresResult } from '../../services/liveScoreTracker';

interface LiveScoreTrackerPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  scoreData: LiveAreaScoresResult;
}

export function LiveScoreTrackerPanel({
  isOpen,
  onToggle,
  scoreData,
}: LiveScoreTrackerPanelProps) {
  const [showSectionBreakdown, setShowSectionBreakdown] = useState(true);

  const { areas, totalPuntosGeneral, primeraOpcion, segundaOpcion, hayEmpatePrimero, preguntasRespondidasCount } =
    scoreData;

  const maxTotal = areas[0]?.total > 0 ? areas[0].total : 1;

  return (
    <>
      {/* Botón flotante para abrir el panel de puntuación */}
      <div className="fixed left-5 bottom-5 z-40">
        <button
          type="button"
          onClick={onToggle}
          title="Ver cómo van sumando y disminuyendo puntos las 10 áreas vocacionales en vivo"
          className="group relative flex items-center gap-2.5 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl ring-4 ring-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-2xl hover:scale-105 active:scale-95"
        >
          <Activity className="h-5 w-5 text-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">Puntuación en Vivo</span>
          <span className="sm:hidden">Puntos</span>
          {primeraOpcion ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-xs font-bold text-emerald-300">
              #{primeraOpcion.codigo} ({primeraOpcion.total} pts)
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">
              0 pts
            </span>
          )}
        </button>
      </div>

      {/* Drawer / Modal de Puntuación en Vivo */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onToggle}
          />

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
            <div className="pointer-events-auto w-screen max-w-2xl bg-white shadow-2xl flex flex-col">
              {/* Header */}
              <div className="border-b border-blue-900/10 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-6 py-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold sm:text-lg">
                        Monitor de Puntuación en Vivo — 10 Áreas
                      </h2>
                      <p className="text-xs text-slate-300">
                        Cálculo y desglose en tiempo real según la Plantilla Oficial de Corrección (UPAO 2026)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggle}
                    className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Resumen de líderes en vivo */}
                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-xl bg-white/10 border border-white/10 p-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">
                          1.ª Opción Proyectada
                        </span>
                        <p className="text-xs font-bold text-white truncate max-w-[180px]">
                          {primeraOpcion
                            ? `${primeraOpcion.codigo} ${primeraOpcion.nombre}`
                            : 'Pendiente de respuestas'}
                        </p>
                      </div>
                    </div>
                    {primeraOpcion && (
                      <span className="rounded-lg bg-emerald-500/20 border border-emerald-400/40 px-2 py-1 text-xs font-extrabold text-emerald-300">
                        {primeraOpcion.total} pts ({primeraOpcion.porcentaje}%)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white/10 border border-white/10 p-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-indigo-300 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">
                          2.ª Opción Proyectada
                        </span>
                        <p className="text-xs font-bold text-white truncate max-w-[180px]">
                          {segundaOpcion
                            ? `${segundaOpcion.codigo} ${segundaOpcion.nombre}`
                            : 'Pendiente de respuestas'}
                        </p>
                      </div>
                    </div>
                    {segundaOpcion && (
                      <span className="rounded-lg bg-indigo-500/20 border border-indigo-400/40 px-2 py-1 text-xs font-extrabold text-indigo-200">
                        {segundaOpcion.total} pts ({segundaOpcion.porcentaje}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Contador de preguntas */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                  <span>
                    Preguntas con respuestas registradas:{' '}
                    <strong className="text-white">{preguntasRespondidasCount}</strong> de 53
                  </span>
                  <span>
                    Total puntos acumulados en áreas:{' '}
                    <strong className="text-emerald-400">{totalPuntosGeneral} pts</strong>
                  </span>
                </div>
              </div>

              {/* Alerta de empate */}
              {hayEmpatePrimero && (
                <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-xs text-amber-900">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>
                    <strong>Empate técnico en el 1.° puesto:</strong> Se aplica el desempate por mayor puntaje en RIASEC (Sección 4), preferencia institucional o vocación dual.
                  </span>
                </div>
              )}

              {/* Controles y Tabla */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                  Ranking Promocional por Área (1 al 10)
                </span>
                <button
                  type="button"
                  onClick={() => setShowSectionBreakdown((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                >
                  {showSectionBreakdown ? (
                    <>
                      <span>Ocultar desglose S1–S6</span>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Ver desglose por secciones</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Tabla de Puntuaciones */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3 text-center">#</th>
                        <th className="py-2.5 px-3">Área Vocacional</th>
                        {showSectionBreakdown && (
                          <>
                            <th className="py-2.5 px-2 text-right text-slate-500" title="Sección 1: Rendimiento">S1</th>
                            <th className="py-2.5 px-2 text-right text-slate-500" title="Sección 3: Cognitiva">S3</th>
                            <th className="py-2.5 px-2 text-right text-slate-500" title="Sección 4: RIASEC">S4</th>
                            <th className="py-2.5 px-2 text-right text-slate-500" title="Sección 5: Hobbies (+3)">S5</th>
                            <th className="py-2.5 px-2 text-right text-slate-500" title="Bonus Sección 6 Militar (+2)">S6</th>
                          </>
                        )}
                        <th className="py-2.5 px-3 text-right font-bold text-slate-900">Total</th>
                        <th className="py-2.5 px-3 text-right">% Final Promocional</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {areas.map((row) => {
                        const isFirst = row.orden === 1 && row.total > 0;
                        const isSecond = row.orden === 2 && row.total > 0;
                        const pctBarWidth = Math.max(
                          2,
                          Math.round((row.total / maxTotal) * 100),
                        );

                        return (
                          <tr
                            key={row.codigo}
                            className={`transition ${
                              isFirst
                                ? 'bg-emerald-50/70 font-semibold text-emerald-950'
                                : isSecond
                                  ? 'bg-blue-50/60 font-medium text-blue-950'
                                  : 'hover:bg-slate-50/70'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center">
                              {isFirst ? (
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-900 text-[11px] font-extrabold shadow-xs">
                                  1
                                </span>
                              ) : isSecond ? (
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-300 text-slate-800 text-[11px] font-extrabold">
                                  2
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono text-xs">{row.orden}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-mono text-xs font-bold text-slate-500 mr-1.5">
                                {row.codigo}
                              </span>
                              <span className="font-semibold text-slate-900">{row.nombre}</span>
                            </td>
                            {showSectionBreakdown && (
                              <>
                                <td className="py-2.5 px-2 text-right tabular-nums text-slate-600 font-mono">
                                  {row.ptosS1 > 0 ? `+${row.ptosS1}` : row.ptosS1 < 0 ? row.ptosS1 : '0'}
                                </td>
                                <td className="py-2.5 px-2 text-right tabular-nums text-slate-600 font-mono">
                                  {row.ptosS3}
                                </td>
                                <td className="py-2.5 px-2 text-right tabular-nums text-slate-600 font-mono">
                                  {row.ptosS4}
                                </td>
                                <td className="py-2.5 px-2 text-right tabular-nums text-slate-600 font-mono">
                                  {row.ptosS5}
                                </td>
                                <td className="py-2.5 px-2 text-right tabular-nums text-slate-600 font-mono">
                                  {row.bonusS6 > 0 ? `+${row.bonusS6}` : '0'}
                                </td>
                              </>
                            )}
                            <td className="py-2.5 px-3 text-right tabular-nums font-extrabold text-sm text-slate-900">
                              {row.total}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center justify-end gap-2">
                                <div className="h-2 w-16 sm:w-24 overflow-hidden rounded-full bg-slate-200">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      isFirst
                                        ? 'bg-emerald-600'
                                        : isSecond
                                          ? 'bg-blue-600'
                                          : 'bg-slate-400'
                                    }`}
                                    style={{ width: `${pctBarWidth}%` }}
                                  />
                                </div>
                                <span className="w-12 text-right font-mono font-bold text-xs tabular-nums text-slate-700">
                                  {row.porcentaje.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  <p className="font-bold text-slate-800">
                    💡 ¿Cómo se calcula la puntuación en cada pregunta?
                  </p>
                  <p>
                    • <strong>P1.1 y P1.2:</strong> Cada materia seleccionada suma (+1) o resta (−1) punto a sus áreas vinculadas.
                  </p>
                  <p>
                    • <strong>P1.3 a P1.6:</strong> El valor marcado (1–5) se suma directamente a las áreas correspondientes.
                  </p>
                  <p>
                    • <strong>Sección 3 y 4 (Aptitudes y RIASEC):</strong> Cada punto escala (1–5) alimenta los buckets de las áreas según la matriz de Holland y Gardner.
                  </p>
                  <p>
                    • <strong>Sección 5:</strong> Cada interés elegido otorga una bonificación de <strong>+3 puntos</strong>.
                  </p>
                  <p>
                    • <strong>Sección 6:</strong> P6.6 opción militar otorga <strong>+2 puntos</strong> al Área 09.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Actualizado en tiempo real por cada respuesta marcada
                </span>
                <button
                  type="button"
                  onClick={onToggle}
                  className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
