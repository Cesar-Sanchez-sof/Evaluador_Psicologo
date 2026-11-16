import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  NotebookPen,
  RefreshCw,
  Save,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  buildExportUrl,
  buildGradesExportUrl,
  fetchEvaluationDetail,
  fetchEvaluations,
  fetchSections,
  savePsychologistVerdict,
} from '../../services/api';
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
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('todas');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editObservations, setEditObservations] = useState('');
  const [editEvaluator, setEditEvaluator] = useState('');
  const [editCpsp, setEditCpsp] = useState('');
  const [savingVerdict, setSavingVerdict] = useState(false);
  const [verdictSuccess, setVerdictSuccess] = useState<string | null>(null);
  const [verdictError, setVerdictError] = useState<string | null>(null);

  const loadSections = async () => {
    try {
      const list = await fetchSections();
      setAvailableSections(list);
    } catch {
      // Si falla, se conservan las secciones disponibles en la lista de evaluaciones
    }
  };

  const loadList = async (selectId?: number | string | null) => {
    setLoadingList(true);
    setError(null);
    try {
      const [list] = await Promise.all([fetchEvaluations(), loadSections()]);
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
    setVerdictSuccess(null);
    setVerdictError(null);
    try {
      const detail = await fetchEvaluationDetail(id);
      setSelectedDetail(detail);
      setEditObservations(detail.hojaCorreccion.observaciones_psicopedagogicas ?? '');
      setEditEvaluator(detail.hojaCorreccion.psicologo_evaluador ?? '');
      setEditCpsp(detail.hojaCorreccion.cpsp_numero ?? '');
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

  const handleExportGradesExcel = () => {
    window.open(
      buildGradesExportUrl(selectedSectionFilter, 'xlsx'),
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleExportGradesCsv = () => {
    window.open(
      buildGradesExportUrl(selectedSectionFilter, 'csv'),
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleExportDataset = (format: 'csv' | 'json') => {
    window.open(
      buildExportUrl(format, selectedSectionFilter),
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleSaveVerdict = async () => {
    if (!selectedDetail) return;
    const evalId = selectedDetail.hojaCorreccion.evaluacion_id;
    const firstArea = selectedDetail.hojaCorreccion.primera_opcion_codigo;
    if (!firstArea) {
      setVerdictError('No se encontró el código del área vocacional recomendada.');
      return;
    }
    setSavingVerdict(true);
    setVerdictSuccess(null);
    setVerdictError(null);
    try {
      const updated = await savePsychologistVerdict(evalId, {
        evaluatorName: editEvaluator.trim() || 'Psicólogo / Evaluador',
        cpspNumber: editCpsp.trim(),
        evaluationDate: new Date().toISOString().slice(0, 10),
        recommendedAreaCode: firstArea,
        secondAreaCode: selectedDetail.hojaCorreccion.segunda_opcion_codigo ?? undefined,
        observations: editObservations.trim(),
      });
      setSelectedDetail(updated);
      setVerdictSuccess(
        'Observaciones psicopedagógicas y veredicto guardados con éxito en PostgreSQL.',
      );
      const list = await fetchEvaluations();
      setEvaluations(list);
    } catch (err) {
      setVerdictError(err instanceof Error ? err.message : 'Error al guardar el veredicto');
    } finally {
      setSavingVerdict(false);
    }
  };

  const hoja = selectedDetail?.hojaCorreccion;

  const allSections = Array.from(
    new Set([
      ...availableSections,
      ...evaluations.map((e) => e.seccion).filter((s): s is string => Boolean(s && s.trim())),
    ]),
  ).sort();

  const filteredEvaluations =
    selectedSectionFilter === 'todas'
      ? evaluations
      : evaluations.filter(
          (ev) =>
            ev.seccion?.trim().toLowerCase() === selectedSectionFilter.trim().toLowerCase(),
        );

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Evaluaciones Registradas en PostgreSQL
            </h2>
            <p className="text-xs text-slate-500">
              Selecciona un estudiante para visualizar sus sumatorias (S1–S6), notas y
              orientación vocacional
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filtro por Sección */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs shadow-2xs">
              <span className="font-semibold text-slate-600">Sección:</span>
              <select
                aria-label="Filtrar por sección escolar"
                value={selectedSectionFilter}
                onChange={(e) => setSelectedSectionFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-hidden"
              >
                <option value="todas">Todas ({evaluations.length})</option>
                {allSections.map((sec) => {
                  const count = evaluations.filter(
                    (e) => e.seccion?.trim().toLowerCase() === sec.trim().toLowerCase(),
                  ).length;
                  return (
                    <option key={sec} value={sec}>
                      Sección {sec} {count > 0 ? `(${count})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Exportar a Excel (.xlsx) */}
            <button
              type="button"
              onClick={handleExportGradesExcel}
              title={`Exportar notas oficiales a Excel (.xlsx) — ${
                selectedSectionFilter === 'todas'
                  ? 'Todas las secciones'
                  : `Sección ${selectedSectionFilter}`
              }`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar Notas (Excel)
            </button>

            {/* Exportar Notas CSV */}
            <button
              type="button"
              onClick={handleExportGradesCsv}
              title="Descargar notas oficiales en CSV con BOM UTF-8 para Excel"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              <Download className="h-3.5 w-3.5" />
              Notas CSV
            </button>

            {/* Exportar Dataset ML */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => handleExportDataset('csv')}
                title="Descargar dataset ML para Pandas (CSV plano de 53 ítems)"
                className="inline-flex items-center gap-1 rounded-l-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <Download className="h-3.5 w-3.5" />
                Dataset ML (CSV)
              </button>
              <span className="h-4 w-px bg-slate-200" />
              <button
                type="button"
                onClick={() => handleExportDataset('json')}
                title="Descargar dataset ML en JSON"
                className="inline-flex items-center gap-1 rounded-r-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                JSON
              </button>
            </div>

            {/* Actualizar lista */}
            <button
              type="button"
              onClick={() => void loadList(hoja?.evaluacion_id)}
              disabled={loadingList}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingList ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredEvaluations.length === 0 && !loadingList && (
            <div className="p-8 text-center text-sm text-slate-500">
              {evaluations.length === 0
                ? 'Aún no hay evaluaciones guardadas en la base de datos.'
                : `No se encontraron evaluaciones registradas para la Sección "${selectedSectionFilter}".`}
            </div>
          )}

          {filteredEvaluations.map((ev) => {
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

          <div className="space-y-6 p-6">
            <ScoringSummaryCard
              data={mapDetailToScoringDisplay(hoja, selectedDetail.detalleAreas)}
            />

            {/* Editor de Veredicto y Observaciones Psicopedagógicas */}
            <div className="rounded-2xl border border-indigo-200/90 bg-slate-50/70 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-900/10 text-indigo-900">
                  <NotebookPen className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Dictamen y Observaciones Psicopedagógicas (Veredicto Oficial)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Actualiza o registra las observaciones cualitativas para esta evaluación en PostgreSQL
                  </p>
                </div>
              </div>

              {verdictSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{verdictSuccess}</span>
                </div>
              )}

              {verdictError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800">
                  {verdictError}
                </div>
              )}

              <div>
                <label
                  htmlFor="result-observations"
                  className="block text-xs font-bold tracking-wider text-slate-700 uppercase"
                >
                  Observaciones Psicopedagógicas y Recomendaciones Vocacionales:
                </label>
                <textarea
                  id="result-observations"
                  rows={4}
                  value={editObservations}
                  onChange={(e) => setEditObservations(e.target.value)}
                  placeholder="Escribe las observaciones del caso, alertas socioemocionales o sugerencias de carreras..."
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-relaxed text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-slate-200/80">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Psicólogo / Evaluador Responsable
                  </label>
                  <input
                    type="text"
                    value={editEvaluator}
                    onChange={(e) => setEditEvaluator(e.target.value)}
                    placeholder="Ej. Lic. César Sánchez"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    N.° Colegiatura CPSP
                  </label>
                  <input
                    type="text"
                    value={editCpsp}
                    onChange={(e) => setEditCpsp(e.target.value)}
                    placeholder="Ej. CPSP 25890"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => void handleSaveVerdict()}
                  disabled={savingVerdict}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-800 disabled:opacity-50"
                >
                  {savingVerdict ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  {savingVerdict ? 'Guardando...' : 'Guardar Observaciones y Veredicto'}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
