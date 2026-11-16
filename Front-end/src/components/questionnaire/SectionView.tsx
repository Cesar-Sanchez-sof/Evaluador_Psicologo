import { AlertCircle, AlertTriangle, CheckCircle2, Info, Plus } from 'lucide-react';
import {
  getSectionQuestionIds,
  isQuestionAnswered,
  type LikertGroupBlock,
  type LikertScaleItem,
  type LikertValue,
  type QuestionnaireSection,
  type SectionBlock,
  type StudentAnswers,
} from '../../types/questionnaire';
import { LikertGroupTable } from './LikertGroupTable';
import { SingleChoiceQuestion } from './SingleChoiceQuestion';

interface SectionViewProps {
  section: QuestionnaireSection;
  likertScale: LikertScaleItem[];
  answers: StudentAnswers;
  onSelectAnswer: (questionId: string, value: string | string[] | LikertValue) => void;
  onAddObservation?: (text: string) => void;
  searchQuery?: string;
}

function filterBlock(block: SectionBlock, normalizedQuery: string): SectionBlock | null {
  if (!normalizedQuery) return block;

  if (block.type !== 'likert_group') {
    const matchesPrompt =
      block.code.toLowerCase().includes(normalizedQuery) ||
      block.prompt.toLowerCase().includes(normalizedQuery) ||
      block.options.some((opt) => opt.label.toLowerCase().includes(normalizedQuery));
    return matchesPrompt ? block : null;
  }

  const filteredSubgroups = block.subgroups
    .map((subgroup) => {
      const titleMatches = subgroup.title?.toLowerCase().includes(normalizedQuery) ?? false;
      if (titleMatches) return subgroup;

      const matchingItems = subgroup.items.filter(
        (item) =>
          item.code.toLowerCase().includes(normalizedQuery) ||
          item.statement.toLowerCase().includes(normalizedQuery),
      );
      if (matchingItems.length === 0) return null;
      return { ...subgroup, items: matchingItems };
    })
    .filter((sg): sg is NonNullable<typeof sg> => sg !== null);

  if (filteredSubgroups.length === 0) return null;

  const result: LikertGroupBlock = {
    ...block,
    subgroups: filteredSubgroups,
  };
  return result;
}

export function SectionView({
  section,
  likertScale,
  answers,
  onSelectAnswer,
  onAddObservation,
  searchQuery = '',
}: SectionViewProps) {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const sectionMatchesDirectly =
    normalizedQuery !== '' &&
    (section.title.toLowerCase().includes(normalizedQuery) ||
      section.instruction.toLowerCase().includes(normalizedQuery));

  const visibleBlocks = sectionMatchesDirectly
    ? section.blocks
    : section.blocks
        .map((block) => filterBlock(block, normalizedQuery))
        .filter((b): b is SectionBlock => b !== null);

  if (normalizedQuery && visibleBlocks.length === 0) {
    return null;
  }

  const allQuestionIds = getSectionQuestionIds(section);
  const answeredInSection = allQuestionIds.filter((id) => isQuestionAnswered(answers[id])).length;

  // Alertas específicas de la Plantilla de Corrección (UPAO 2026)
  const p1_7 = answers['P1.7'];
  const s2Keys = ['P2.1', 'P2.2', 'P2.3', 'P2.4', 'P2.5', 'P2.6', 'P2.7', 'P2.8', 'P2.9'];
  const s2Values = s2Keys.map((k) =>
    typeof answers[k] === 'number' ? (answers[k] as number) : null,
  );
  const isS2Complete = s2Values.every((v) => v !== null);
  const totalS2 = isS2Complete
    ? (s2Values as number[]).reduce((sum, v) => sum + v, 0)
    : 0;

  const p5_4 = answers['P5.4'];

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-900/10 bg-gradient-to-r from-blue-950 to-indigo-900 px-6 py-4 text-white">
          <div>
            <span className="text-[11px] font-semibold tracking-widest text-blue-200 uppercase">
              Sección {section.number} de 6
            </span>
            <h2 className="mt-0.5 text-base font-bold tracking-tight sm:text-lg">
              {section.title}
            </h2>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs">
            {answeredInSection} / {allQuestionIds.length} respondidas
          </span>
        </div>

        <div className="flex items-start gap-3 bg-indigo-50/40 px-6 py-3.5 text-sm text-slate-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-800" />
          <p>
            <strong className="font-semibold text-blue-950">Instrucción:</strong>{' '}
            {section.instruction}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {visibleBlocks.map((block) =>
          block.type === 'likert_group' ? (
            <LikertGroupTable
              key={block.id}
              group={block}
              likertScale={likertScale}
              answers={answers}
              onSelect={(qId, value) => onSelectAnswer(qId, value)}
            />
          ) : (
            <SingleChoiceQuestion
              key={block.id}
              question={block}
              selectedValue={answers[block.id] as string | string[] | undefined}
              onSelect={(qId, value) => onSelectAnswer(qId, value)}
            />
          ),
        )}
      </div>

      {/* Banner contextual de la Plantilla para P1.7 en Sección 1 */}
      {section.number === 1 && typeof p1_7 === 'number' && (
        <>
          {p1_7 <= 2 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-950 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Plantilla Oficial (P1.7 = {p1_7}):</strong> «Puede tener potencial
                  desaprovechado o dificultad de estudio. Anotar en observaciones.»
                </span>
              </div>
              {onAddObservation && (
                <button
                  type="button"
                  onClick={() =>
                    onAddObservation(
                      'P1.7: Presenta bajo nivel de organización y dedicación al estudio (puntaje 1–2); posible potencial desaprovechado o dificultad de hábitos.',
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-md bg-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-300 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Añadir a observaciones
                </button>
              )}
            </div>
          )}
          {p1_7 >= 4 && (
            <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-900">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
              <span>
                <strong>Plantilla Oficial (P1.7 = {p1_7}):</strong> El estudiante es organizado y sus
                respuestas reflejan un perfil sólido y confiable.
              </span>
            </div>
          )}
        </>
      )}

      {/* Banner contextual de la Plantilla para Sección 2 (Perfil Psicométrico) */}
      {section.number === 2 && isS2Complete && (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-xs shadow-2xs ${
            totalS2 <= 17
              ? 'border-rose-300 bg-rose-50/90 text-rose-950'
              : totalS2 <= 26
                ? 'border-amber-300 bg-amber-50/90 text-amber-950'
                : 'border-emerald-200 bg-emerald-50/80 text-emerald-950'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {totalS2 <= 17 ? (
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            ) : totalS2 <= 26 ? (
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            ) : (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            )}
            <div>
              <p className="font-bold">
                Total Sección 2: {totalS2} / 45 puntos — Nivel{' '}
                {totalS2 <= 17
                  ? 'MUY BAJO'
                  : totalS2 <= 26
                    ? 'BAJO'
                    : totalS2 <= 35
                      ? 'MEDIO'
                      : 'ALTO'}
              </p>
              <p className="mt-0.5 text-[11px]">
                {totalS2 <= 17
                  ? '🚨 Alerta psicopedagógica: Priorizar apoyo socioemocional escolar antes de la decisión vocacional final.'
                  : totalS2 <= 26
                    ? '⚠️ Suele abrumarse ante exámenes. Puede requerir acompañamiento o tutoría vocacional.'
                    : totalS2 <= 35
                      ? 'Nivel normal y adecuado. Sin dificultades emocionales relevantes frente a los estudios.'
                      : 'Perfil emocional sólido. Puede afrontar carreras de alta exigencia académica.'}
              </p>
            </div>
          </div>
          {onAddObservation && totalS2 <= 26 && (
            <button
              type="button"
              onClick={() =>
                onAddObservation(
                  totalS2 <= 17
                    ? `S2: Alerta psicopedagógica — Perfil emocional Muy Bajo (${totalS2}/45). Priorizar apoyo socioemocional y tutoría escolar antes de la decisión vocacional final.`
                    : `S2: Perfil emocional Bajo (${totalS2}/45). Suele experimentar ansiedad o abrumamiento ante exámenes; requiere acompañamiento vocacional.`,
                )
              }
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                totalS2 <= 17
                  ? 'bg-rose-200 text-rose-900 hover:bg-rose-300'
                  : 'bg-amber-200 text-amber-900 hover:bg-amber-300'
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              Añadir a observaciones
            </button>
          )}
        </div>
      )}

      {/* Banner contextual de la Plantilla para P5.4 en Sección 5 */}
      {section.number === 5 && p5_4 === 'a' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-950">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-blue-600" />
            <span>
              <strong>P5.4 (Dedicación Extracurricular):</strong> Menos de 2 h semanales. Indica
              poca exploración de intereses vocacionales (perfil en desarrollo).
            </span>
          </div>
          {onAddObservation && (
            <button
              type="button"
              onClick={() =>
                onAddObservation(
                  'P5.4: Baja dedicación a actividades extracurriculares (<2 h semanales); se sugiere propiciar mayor exploración práctica de intereses vocacionales.',
                )
              }
              className="inline-flex items-center gap-1 rounded-md bg-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-900 hover:bg-blue-300 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Añadir
            </button>
          )}
        </div>
      )}
    </section>
  );
}
