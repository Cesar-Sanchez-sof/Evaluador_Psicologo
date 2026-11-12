export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface LikertScaleItem {
  value: LikertValue;
  label: string;
}

export interface QuestionOption {
  code: string;
  label: string;
}

export interface ChoiceQuestion {
  id: string;
  code: string;
  type: 'single_choice' | 'multiple_choice';
  prompt: string;
  note?: string;
  options: QuestionOption[];
}

export interface LikertItem {
  id: string;
  code: string;
  statement: string;
}

export interface LikertSubgroup {
  id: string;
  title?: string;
  badge?: string;
  items: LikertItem[];
}

export interface LikertGroupBlock {
  id: string;
  type: 'likert_group';
  prompt: string;
  subgroups: LikertSubgroup[];
}

export type SectionBlock = ChoiceQuestion | LikertGroupBlock;

export interface QuestionnaireSection {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  instruction: string;
  blocks: SectionBlock[];
}

export interface VocationalAreaOption {
  code: string;
  name: string;
  examples: string;
}

export interface GeneralDataState {
  fullName: string;
  ageOption: string;
  ageOther: string;
  sex: string;
  sectionName: string;
}

export interface PsychologistVerdictState {
  evaluatorName: string;
  evaluationDate: string;
  recommendedAreaCode: string;
  observations: string;
  cpspNumber: string;
}

export type StudentAnswers = Record<string, string | string[] | LikertValue>;

export function isQuestionAnswered(value: string | string[] | LikertValue | undefined): boolean {
  if (value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  return value !== '';
}

export type ActiveStepId =
  | 'welcome'
  | 'section-1'
  | 'section-2'
  | 'section-3'
  | 'section-4'
  | 'section-5'
  | 'section-6'
  | 'section-7';

export type ViewMode = 'step' | 'all';
