import { Info } from 'lucide-react';
import { getSectionQuestionIds } from '../../data/questionnaireData';
import {
  isQuestionAnswered,
  type LikertGroupBlock,
  type LikertValue,
  type QuestionnaireSection,
  type SectionBlock,
  type StudentAnswers,
} from '../../types/questionnaire';
import { LikertGroupTable } from './LikertGroupTable';
import { SingleChoiceQuestion } from './SingleChoiceQuestion';

interface SectionViewProps {
  section: QuestionnaireSection;
  answers: StudentAnswers;
  onSelectAnswer: (questionId: string, value: string | string[] | LikertValue) => void;
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
  answers,
  onSelectAnswer,
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
    </section>
  );
}
