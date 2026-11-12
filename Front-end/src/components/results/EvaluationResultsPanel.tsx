import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchEvaluationDetail, fetchEvaluations } from '../../services/api';
import type { EvaluationDetail, EvaluationListItem } from '../../types/questionnaire';
import { mapDetailToScoringDisplay, ScoringSummaryCard } from './ScoringSummaryCard';

interface EvaluationResultsPanelProps {
  initialSelectedEvaluationId?: number | string | null;
}

export function EvaluationResultsPanel({
  initialSelectedEvaluationId = null,
}: EvaluationResultsPanelProps) {
  const [evaluations, setEvaluations] = useState<EvaluationListItem[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<EvaluationDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadList = async (selectId?: number | string | null) => {
    setLoadingList(true);
    setError(null);
    try {
      const list = await fetchEvaluations();
      setEvaluations(list);
      const targetId = selectId ?? list[0]?.evaluacion_id;
      if (targetId !== undefined && targetId !== null) {
        await loadDetail(targetId);
      } else {
        setSelectedDetail(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las evaluaciones');
    } finally {
      setLoadingList(false);
    }
  };

  const loadDetail = async (id: number | string) => {
    setLoadingDetail(true);
    setError(null);
    try {
      const detail = await fetchEvaluationDetail(id);
      setSelectedDetail(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el detalle');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    void loadList(initialSelectedEvaluationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelectedEvaluationId]);

  const hoja = selectedDetail?.hojaCorreccion;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Evaluaciones Registradas en PostgreSQL
            </h2>
            <p className="text-xs text-slate-500">
              Selecciona un estudiante para visualizar sus sumatorias (S1–S6), puntajes y
              porcentaje de orientación vocacional almacenados
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadList(hoja?.evaluacion_id)}
            disabled={loadingList}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingList ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {evaluations.length === 0 && !loadingList && (
            <div className="p-8 text-center text-sm text-slate-500">
              Aún no hay evaluaciones guardadas en la base de datos.
            </div>
          )}

          {evaluations.map((ev) => {
            const isSelected = String(hoja?.evaluacion_id) === String(ev.evaluacion_id);
            return (
              <button
                key={String(ev.evaluacion_id)}
                type="button"
                onClick={() => void loadDetail(ev.evaluacion_id)}
                className={`flex w-full flex-wrap items-center justify-between gap-4 px-6 py-3.5 text-left transition ${
                  isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      #{ev.evaluacion_id}
                    </span>
                    <p className="text-sm font-bold text-slate-900">{ev.nombres_apellidos}</p>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {ev.edad_opcion} · Sec. {ev.seccion}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    1.ª Opción:{' '}
                    <strong className="text-blue-900">
                      {ev.primera_opcion_codigo} — {ev.primera_opcion_nombre}
                    </strong>{' '}
                    ({ev.primera_opcion_puntaje} pts) · S2: {ev.total_s2} ({ev.nivel_psicometrico})
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${
                    ev.estado === 'revisada'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {ev.estado}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {loadingDetail && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Cargando hoja de corrección...
        </div>
      )}

      {hoja && selectedDetail && !loadingDetail && (
        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <div className="border-b border-blue-900/10 bg-gradient-to-r from-blue-950 to-indigo-900 px-6 py-5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-semibold tracking-widest text-blue-200 uppercase">
                  Sección 7 — Hoja de Corrección Automatizada · Evaluación #{hoja.evaluacion_id}
                </span>
                <h3 className="mt-0.5 text-xl font-bold">{hoja.estudiante}</h3>
                <p className="text-xs text-blue-100">
                  {hoja.edad_opcion} · {hoja.sexo} · {hoja.grado} — Sección {hoja.seccion}
                </p>
              </div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase">
                Estado: {hoja.estado}
              </span>
            </div>
          </div>

          <div className="p-6">
            <ScoringSummaryCard
              data={mapDetailToScoringDisplay(hoja, selectedDetail.detalleAreas)}
            />
          </div>
        </section>
      )}
    </div>
  );
}
