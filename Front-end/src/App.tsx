import { ArrowLeft, ArrowRight, Eye, SearchX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Header } from './components/layout/Header';
import { SidebarNav } from './components/layout/SidebarNav';
import { GeneralDataForm } from './components/questionnaire/GeneralDataForm';
import { PsychologistVerdictView } from './components/questionnaire/PsychologistVerdictView';
import { SectionView } from './components/questionnaire/SectionView';
import { WelcomeCard } from './components/questionnaire/WelcomeCard';
import {
  ALL_STUDENT_QUESTION_IDS,
  QUESTIONNAIRE_META,
  QUESTIONNAIRE_SECTIONS,
} from './data/questionnaireData';
import {
  isQuestionAnswered,
  type ActiveStepId,
  type GeneralDataState,
  type LikertValue,
  type PsychologistVerdictState,
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

const INITIAL_VERDICT: PsychologistVerdictState = {
  evaluatorName: '',
  evaluationDate: '',
  recommendedAreaCode: '',
  observations: '',
  cpspNumber: '',
};

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('step');
  const [activeStep, setActiveStep] = useState<ActiveStepId>('welcome');
  const [searchQuery, setSearchQuery] = useState('');

  const [generalData, setGeneralData] = useState<GeneralDataState>(INITIAL_GENERAL_DATA);
  const [answers, setAnswers] = useState<StudentAnswers>({});
  const [verdict, setVerdict] = useState<PsychologistVerdictState>(INITIAL_VERDICT);

  const answeredCount = useMemo(
    () => ALL_STUDENT_QUESTION_IDS.filter((id) => isQuestionAnswered(answers[id])).length,
    [answers],
  );

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
    if (mode === 'step') {
      setSearchQuery('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetAll = () => {
    setGeneralData(INITIAL_GENERAL_DATA);
    setAnswers({});
    setVerdict(INITIAL_VERDICT);
  };

  const currentStepIndex = ORDERED_STEPS.indexOf(activeStep);
  const prevStep = currentStepIndex > 0 ? ORDERED_STEPS[currentStepIndex - 1] : null;
  const nextStep =
    currentStepIndex < ORDERED_STEPS.length - 1 ? ORDERED_STEPS[currentStepIndex + 1] : null;

  const activeSection = QUESTIONNAIRE_SECTIONS.find((sec) => sec.id === activeStep);

  // Detectar si alguna sección coincide con la búsqueda en modo 'all'
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasAnySearchMatch = useMemo(() => {
    if (!normalizedQuery) return true;
    return QUESTIONNAIRE_SECTIONS.some((section) => {
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
  }, [normalizedQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header
        viewMode={viewMode}
        onChangeViewMode={handleChangeViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        answeredCount={answeredCount}
        totalCount={ALL_STUDENT_QUESTION_IDS.length}
        onResetAll={handleResetAll}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Banner informativo de vista previa */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200/80 bg-blue-50/70 px-4 py-2.5 text-xs text-blue-950">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 shrink-0 text-blue-700" />
            <span>
              <strong>Vista Previa del Cuestionario:</strong> Visualización completa de todas las
              preguntas del instrumento (Secciones 1–6 + Ficha Profesional Sección 7).
            </span>
          </div>
          <span className="font-medium text-blue-800">
            {viewMode === 'step' ? 'Modo: Por secciones' : 'Modo: Todas las preguntas'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[290px_1fr]">
          <SidebarNav
            activeStep={activeStep}
            viewMode={viewMode}
            onSelectStep={handleSelectStep}
            answers={answers}
            totalQuestions={ALL_STUDENT_QUESTION_IDS.length}
            answeredCount={answeredCount}
          />

          <div className="min-w-0 space-y-6">
            {viewMode === 'step' ? (
              <>
                {activeStep === 'welcome' && (
                  <div className="space-y-6">
                    <WelcomeCard />
                    <GeneralDataForm data={generalData} onChange={setGeneralData} />
                  </div>
                )}

                {activeSection && (
                  <SectionView
                    section={activeSection}
                    answers={answers}
                    onSelectAnswer={handleSelectAnswer}
                  />
                )}

                {activeStep === 'section-7' && (
                  <PsychologistVerdictView verdict={verdict} onChange={setVerdict} />
                )}

                {/* Controles de navegación entre secciones */}
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
                    <WelcomeCard />
                    <GeneralDataForm data={generalData} onChange={setGeneralData} />
                  </>
                )}

                {hasAnySearchMatch ? (
                  QUESTIONNAIRE_SECTIONS.map((section) => (
                    <SectionView
                      key={section.id}
                      section={section}
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
                  <PsychologistVerdictView verdict={verdict} onChange={setVerdict} />
                )}
              </div>
            )}

            <footer className="pb-6 text-center text-xs text-slate-500">
              Investigadores: {QUESTIONNAIRE_META.researchers} · {QUESTIONNAIRE_META.affiliation}
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
