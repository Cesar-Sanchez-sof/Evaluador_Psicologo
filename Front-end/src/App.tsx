import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Database,
  Loader2,
  RefreshCw,
  SearchX,
  Send,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Header } from './components/layout/Header';
import { SidebarNav } from './components/layout/SidebarNav';
import { GeneralDataForm } from './components/questionnaire/GeneralDataForm';
import { PsychologistVerdictView } from './components/questionnaire/PsychologistVerdictView';
import { SectionView } from './components/questionnaire/SectionView';
import { WelcomeCard } from './components/questionnaire/WelcomeCard';
import { EvaluationResultsPanel } from './components/results/EvaluationResultsPanel';
import {
  fetchQuestionnaireStructure,
  previewEvaluation,
  submitEvaluation,
} from './services/api';
import {
  getSectionQuestionIds,
  isQuestionAnswered,
  type ActiveStepId,
  type EvaluationScoringPreview,
  type GeneralDataState,
  type LikertValue,
  type QuestionnaireStructure,
  type StudentAnswers,
  type ViewMode,
} from './types/questionnaire';

const ORDERED_STEPS: ActiveStepId[] = [
  'welcome',
  'section-1',
  'section-2',
  'section-3',
  'section-4',
  'section-5',
  'section-6',
  'section-7',
];

const INITIAL_GENERAL_DATA: GeneralDataState = {
  fullName: '',
  ageOption: '',
  ageOther: '',
  sex: '',
  sectionName: '',
};

export function App() {
  const [structure, setStructure] = useState<QuestionnaireStructure | null>(null);
  const [loadingStructure, setLoadingStructure] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('step');
  const [activeStep, setActiveStep] = useState<ActiveStepId>('welcome');
  const [searchQuery, setSearchQuery] = useState('');

  const [generalData, setGeneralData] = useState<GeneralDataState>(INITIAL_GENERAL_DATA);
  const [answers, setAnswers] = useState<StudentAnswers>({});

  const [scoringPreview, setScoringPreview] = useState<EvaluationScoringPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastCreatedEvalId, setLastCreatedEvalId] = useState<number | string | null>(null);

  const loadStructure = async () => {
    setLoadingStructure(true);
    setLoadError(null);
    try {
      const data = await fetchQuestionnaireStructure();
      setStructure(data);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : 'No se pudo conectar con el servidor Back-end.',
      );
    } finally {
      setLoadingStructure(false);
    }
  };

  useEffect(() => {
    void loadStructure();
  }, []);

  const allStudentQuestionIds = useMemo(
    () => (structure ? structure.sections.flatMap(getSectionQuestionIds) : []),
    [structure],
  );

  const answeredCount = useMemo(
    () => allStudentQuestionIds.filter((id) => isQuestionAnswered(answers[id])).length,
    [allStudentQuestionIds, answers],
  );

  const missingQuestionsCount = Math.max(0, allStudentQuestionIds.length - answeredCount);

  const isGeneralDataComplete =
    generalData.fullName.trim().length >= 3 &&
    generalData.ageOption !== '' &&
    generalData.sex !== '' &&
    generalData.sectionName.trim().length >= 1;

  const isReadyToSubmit =
    isGeneralDataComplete &&
    allStudentQuestionIds.length > 0 &&
    answeredCount === allStudentQuestionIds.length;

  // Calcula automáticamente el resultado de la Plantilla de Corrección cuando las 53 preguntas están completas
  useEffect(() => {
    if (!structure || allStudentQuestionIds.length === 0 || missingQuestionsCount > 0) {
      setScoringPreview(null);
      setPreviewError(null);
      return;
    }

    let cancelled = false;
    setLoadingPreview(true);
    setPreviewError(null);

    previewEvaluation(answers)
      .then((result) => {
        if (cancelled) return;
        setScoringPreview(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setPreviewError(
          err instanceof Error ? err.message : 'No se pudo calcular el resultado automático.',
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingPreview(false);
      });

    return () => {
      cancelled = true;
    };
  }, [structure, allStudentQuestionIds.length, missingQuestionsCount, answers]);

  const handleSelectAnswer = (questionId: string, value: string | string[] | LikertValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSelectStep = (step: ActiveStepId) => {
    setViewMode('step');
    setActiveStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode !== 'all') {
      setSearchQuery('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetAll = () => {
    setGeneralData(INITIAL_GENERAL_DATA);
    setAnswers({});
    setScoringPreview(null);
    setPreviewError(null);
    setSubmitError(null);
  };

  const handleSubmitQuestionnaire = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const detail = await submitEvaluation(generalData, answers);
      const evalId = detail.hojaCorreccion.evaluacion_id;

      setLastCreatedEvalId(evalId);
      setGeneralData(INITIAL_GENERAL_DATA);
      setAnswers({});
      setScoringPreview(null);
      setViewMode('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Ocurrió un error al guardar la evaluación.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasAnySearchMatch = useMemo(() => {
    if (!structure) return false;
    if (!normalizedQuery) return true;
    return structure.sections.some((section) => {
      if (
        section.title.toLowerCase().includes(normalizedQuery) ||
        section.instruction.toLowerCase().includes(normalizedQuery)
      ) {
        return true;
      }
      return section.blocks.some((block) => {
        if (block.type !== 'likert_group') {
          return (
            block.code.toLowerCase().includes(normalizedQuery) ||
            block.prompt.toLowerCase().includes(normalizedQuery) ||
            block.options.some((opt) => opt.label.toLowerCase().includes(normalizedQuery))
          );
        }
        return block.subgroups.some(
          (sg) =>
            (sg.title?.toLowerCase().includes(normalizedQuery) ?? false) ||
            sg.items.some(
              (item) =>
                item.code.toLowerCase().includes(normalizedQuery) ||
                item.statement.toLowerCase().includes(normalizedQuery),
            ),
        );
      });
    });
  }, [structure, normalizedQuery]);

  if (loadingStructure) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <Loader2 className="h-9 w-9 animate-spin text-blue-800" />
        <h2 className="mt-4 text-base font-bold text-slate-900">
          Cargando cuestionario desde el servidor...
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Conectando con el Back-end y PostgreSQL (Evaluador_Psicologo)
        </p>
      </div>
    );
  }

  if (loadError || !structure) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-xs">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-600" />
          <h2 className="mt-3 text-lg font-bold text-slate-900">
            No se pudo conectar con el Back-end
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            {loadError ?? 'Verifica que el servidor Node.js y PostgreSQL estén activos.'}
          </p>
          <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs text-slate-700">
            npm --prefix Back-end run dev
          </p>
          <button
            type="button"
            onClick={() => void loadStructure()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar conexión
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = ORDERED_STEPS.indexOf(activeStep);
  const prevStep = currentStepIndex > 0 ? ORDERED_STEPS[currentStepIndex - 1] : null;
  const nextStep =
    currentStepIndex < ORDERED_STEPS.length - 1 ? ORDERED_STEPS[currentStepIndex + 1] : null;
  const activeSection = structure.sections.find((sec) => sec.id === activeStep);

  const saveDisabledReason = !isReadyToSubmit
    ? `Completa los Datos Generales y los ${allStudentQuestionIds.length} ítems antes de guardar en la base de datos.`
    : null;

  const submitBox = (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-emerald-950">
            Finalizar y Evaluar en PostgreSQL
          </h3>
          <p className="mt-0.5 text-xs text-emerald-900/80">
            {isReadyToSubmit
              ? 'Todos los datos generales y los 53 ítems están listos para guardarse y evaluarse (o continúa a Sección 7 para revisar las sumatorias y orientación antes de guardar).'
              : `Completa los Datos Generales y los ${allStudentQuestionIds.length} ítems (${answeredCount}/${allStudentQuestionIds.length} respondidos).`}
          </p>
        </div>

        <button
          type="button"
          disabled={!isReadyToSubmit || submitting}
          onClick={() => void handleSubmitQuestionnaire()}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {submitting ? 'Guardando y evaluando...' : 'Guardar y Evaluar Test'}
        </button>
      </div>

      {submitError && (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
          {submitError}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header
        meta={structure.meta}
        viewMode={viewMode}
        onChangeViewMode={handleChangeViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        answeredCount={answeredCount}
        totalCount={allStudentQuestionIds.length}
        onResetAll={handleResetAll}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-2.5 text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 shrink-0 text-emerald-700" />
            <span>
              <strong>Conectado al Back-end:</strong> Catálogo cargado desde PostgreSQL (
              {allStudentQuestionIds.length} ítems · 10 áreas vocacionales).
            </span>
          </div>
          <span className="font-medium text-emerald-800">
            {viewMode === 'step'
              ? 'Modo: Por secciones'
              : viewMode === 'all'
                ? 'Modo: Todas las preguntas'
                : 'Modo: Resultados y Revisión BD'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[290px_1fr]">
          <SidebarNav
            sections={structure.sections}
            activeStep={activeStep}
            viewMode={viewMode}
            onSelectStep={handleSelectStep}
            answers={answers}
            totalQuestions={allStudentQuestionIds.length}
            answeredCount={answeredCount}
          />

          <div className="min-w-0 space-y-6">
            {viewMode === 'results' ? (
              <EvaluationResultsPanel initialSelectedEvaluationId={lastCreatedEvalId} />
            ) : viewMode === 'step' ? (
              <>
                {activeStep === 'welcome' && (
                  <div className="space-y-6">
                    <WelcomeCard meta={structure.meta} likertScale={structure.likertScale} />
                    <GeneralDataForm
                      data={generalData}
                      ageOptions={structure.ageOptions}
                      sexOptions={structure.sexOptions}
                      onChange={setGeneralData}
                    />
                  </div>
                )}

                {activeSection && (
                  <SectionView
                    section={activeSection}
                    likertScale={structure.likertScale}
                    answers={answers}
                    onSelectAnswer={handleSelectAnswer}
                  />
                )}

                {activeStep === 'section-6' && submitBox}

                {activeStep === 'section-7' && (
                  <PsychologistVerdictView
                    scoringPreview={scoringPreview}
                    loadingPreview={loadingPreview}
                    previewError={previewError}
                    missingQuestionsCount={missingQuestionsCount}
                    onSave={() => void handleSubmitQuestionnaire()}
                    saveButtonLabel="Guardar Encuesta y Resultados en PostgreSQL"
                    saving={submitting}
                    saveDisabledReason={saveDisabledReason}
                    submitError={submitError}
                  />
                )}

                <div className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white px-5 py-4 shadow-xs">
                  <button
                    type="button"
                    disabled={!prevStep}
                    onClick={() => prevStep && handleSelectStep(prevStep)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Anterior
                  </button>

                  <span className="text-xs font-medium text-slate-500">
                    Paso {currentStepIndex + 1} de {ORDERED_STEPS.length}
                  </span>

                  <button
                    type="button"
                    disabled={!nextStep}
                    onClick={() => nextStep && handleSelectStep(nextStep)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Siguiente
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-8">
                {!normalizedQuery && (
                  <>
                    <WelcomeCard meta={structure.meta} likertScale={structure.likertScale} />
                    <GeneralDataForm
                      data={generalData}
                      ageOptions={structure.ageOptions}
                      sexOptions={structure.sexOptions}
                      onChange={setGeneralData}
                    />
                  </>
                )}

                {hasAnySearchMatch ? (
                  structure.sections.map((section) => (
                    <SectionView
                      key={section.id}
                      section={section}
                      likertScale={structure.likertScale}
                      answers={answers}
                      onSelectAnswer={handleSelectAnswer}
                      searchQuery={searchQuery}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                    <SearchX className="h-10 w-10 text-slate-400" />
                    <h3 className="mt-3 text-base font-bold text-slate-800">
                      No se encontraron preguntas
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      No hay ítems que coincidan con «{searchQuery}». Prueba con otro término o
                      código (por ejemplo, P4.10 o RIASEC).
                    </p>
                  </div>
                )}

                {!normalizedQuery && (
                  <>
                    {submitBox}
                    <PsychologistVerdictView
                      scoringPreview={scoringPreview}
                      loadingPreview={loadingPreview}
                      previewError={previewError}
                      missingQuestionsCount={missingQuestionsCount}
                      onSave={() => void handleSubmitQuestionnaire()}
                      saveButtonLabel="Guardar Encuesta y Resultados en PostgreSQL"
                      saving={submitting}
                      saveDisabledReason={saveDisabledReason}
                      submitError={submitError}
                    />
                  </>
                )}
              </div>
            )}

            <footer className="pb-6 text-center text-xs text-slate-500">
              Investigadores: {structure.meta.researchers} · {structure.meta.affiliation}
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
