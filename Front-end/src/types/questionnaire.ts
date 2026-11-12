export type LikertValue = 1 | 2 | 3 | 4 | 5;

export interface LikertScaleItem {
  value: LikertValue;
  label: string;
}

export interface QuestionnaireMeta {
  university: string;
  faculty: string;
  title: string;
  subtitle: string;
  school: string;
  targetPopulation: string;
  researchers: string;
  affiliation: string;
  estimatedTime: string;
  purpose: string;
  welcomeTitle: string;
  welcomeIntro: string[];
  welcomeBullets: string[];
  welcomeClosing: string;
  confidentialityTitle: string;
  confidentialityText: string;
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
  careers?: string;
}

export interface QuestionnaireStructure {
  meta: QuestionnaireMeta;
  likertScale: LikertScaleItem[];
  ageOptions: string[];
  sexOptions: string[];
  sections: QuestionnaireSection[];
  vocationalAreas: VocationalAreaOption[];
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
  secondAreaCode?: string;
  isDualVocation?: boolean;
  dualAreaCode?: string;
  observations: string;
  cpspNumber: string;
}

export type StudentAnswers = Record<string, string | string[] | LikertValue>;

export type ActiveStepId =
  | 'welcome'
  | 'section-1'
  | 'section-2'
  | 'section-3'
  | 'section-4'
  | 'section-5'
  | 'section-6'
  | 'section-7';

export type ViewMode = 'step' | 'all' | 'results';

export interface EvaluationListItem {
  evaluacion_id: string | number;
  fecha_aplicacion: string;
  estado: string;
  tiempo_llenado_min: number | null;
  estudiante_id: string | number;
  nombres_apellidos: string;
  edad_opcion: string;
  edad_exacta: number | null;
  sexo: string;
  grado: string;
  seccion: string;
  primera_opcion_codigo: string | null;
  primera_opcion_nombre: string | null;
  primera_opcion_puntaje: number | null;
  segunda_opcion_codigo: string | null;
  segunda_opcion_nombre: string | null;
  segunda_opcion_puntaje: number | null;
  total_s2: number | null;
  nivel_psicometrico: string | null;
  psicologo_evaluador: string | null;
  veredicto_area_codigo: string | null;
}

export interface AreaScoreDetailRow {
  area_codigo: string;
  area_nombre: string;
  ptos_s1: number;
  ptos_s3: number;
  ptos_s4: number;
  ptos_s5: number;
  bonus_s6: number;
  total_area: number;
  porcentaje_orientacion: number | string;
  orden_prioridad: number;
}

export interface HojaCorreccionFinal {
  evaluacion_id: string | number;
  fecha_aplicacion: string;
  estado: string;
  estudiante: string;
  edad_opcion: string;
  edad_exacta: number | null;
  sexo: string;
  grado: string;
  seccion: string;
  primera_opcion_codigo: string | null;
  primera_opcion_nombre: string | null;
  primera_opcion_puntaje: number | null;
  primera_opcion_porcentaje?: number | string | null;
  carreras_recomendadas_primera_opcion: string | null;
  segunda_opcion_codigo: string | null;
  segunda_opcion_nombre: string | null;
  segunda_opcion_puntaje: number | null;
  segunda_opcion_porcentaje?: number | string | null;
  requiere_revision_empate_dual: boolean | null;
  grupo_a_autoeficacia: number | null;
  grupo_b_resiliencia: number | null;
  grupo_c_estres: number | null;
  total_s2: number | null;
  nivel_psicometrico: string | null;
  interpretacion_s2: string | null;
  puntaje_3a_logico_matematico?: number | null;
  puntaje_3b_comprension_verbal?: number | null;
  puntaje_3c_espacial_visual?: number | null;
  puntaje_r_realista?: number | null;
  puntaje_i_investigador?: number | null;
  puntaje_a_artistico?: number | null;
  puntaje_s_social?: number | null;
  puntaje_e_emprendedor?: number | null;
  puntaje_c_convencional?: number | null;
  p1_7_dedicacion: number | null;
  p1_7_interpretacion: string | null;
  p5_4_opcion: string | null;
  p5_4_interpretacion: string | null;
  p6_3_internet: string | null;
  p6_4_computadora: string | null;
  p6_5_plan_principal: string | null;
  p6_6_tipo_institucion: string | null;
  psicologo_evaluador: string | null;
  cpsp_numero: string | null;
  fecha_evaluacion: string | null;
  veredicto_psicologo_area_codigo: string | null;
  es_vocacion_dual: boolean | null;
  area_dual_codigo: string | null;
  observaciones_psicopedagogicas: string | null;
}

export interface EvaluationResponseRow {
  codigo: string;
  seccion_id: number;
  subgrupo_codigo: string | null;
  enunciado: string;
  tipo_respuesta: string;
  codigo_opcion: string | null;
  texto_opcion: string | null;
  valor_likert: number | null;
}

export interface EvaluationDetail {
  hojaCorreccion: HojaCorreccionFinal;
  detalleAreas: AreaScoreDetailRow[];
  respuestas: EvaluationResponseRow[];
  veredictoPsicologo: {
    psicologo_evaluador: string;
    cpsp_numero: string | null;
    fecha_evaluacion: string;
    area_primera_opcion_codigo: string;
    area_segunda_opcion_codigo: string | null;
    es_vocacion_dual: boolean;
    area_dual_codigo: string | null;
    observaciones_psicopedagogicas: string | null;
  } | null;
}

export interface PreviewAreaScoreRow {
  areaCodigo: string;
  areaNombre: string;
  ptosS1: number;
  ptosS3: number;
  ptosS4: number;
  ptosS5: number;
  bonusS6: number;
  totalArea: number;
  porcentajeOrientacion: number;
  ordenPrioridad: number;
}

export interface EvaluationScoringPreview {
  primeraOpcionCodigo: string;
  primeraOpcionNombre: string;
  primeraOpcionPuntaje: number;
  primeraOpcionPorcentaje: number;
  segundaOpcionCodigo: string;
  segundaOpcionNombre: string;
  segundaOpcionPuntaje: number;
  segundaOpcionPorcentaje: number;
  requiereRevisionEmpateDual: boolean;
  carrerasRecomendadasPrimeraOpcion: string;
  seccion1Detalle?: {
    p1_1Opciones: string[];
    p1_2Opciones: string[];
    p1_3Matematica: number;
    p1_4Ciencias: number;
    p1_5Humanidades: number;
    p1_6Arte: number;
  };
  seccion2: {
    grupoAAutoeficacia: number;
    grupoBResiliencia: number;
    grupoCEstres: number;
    totalS2: number;
    nivelPsicometrico: string;
    interpretacionS2: string;
  };
  seccion3: {
    puntaje3aLogicoMatematico: number;
    puntaje3bComprensionVerbal: number;
    puntaje3cEspacialVisual: number;
  };
  seccion4Riasec: {
    rRealista: number;
    iInvestigador: number;
    aArtistico: number;
    sSocial: number;
    eEmprendedor: number;
    cConvencional: number;
  };
  seccion5Detalle?: {
    p5_1: string;
    p5_2: string;
    p5_3: string;
  };
  seccion6Detalle?: {
    bonusArea09: number;
  };
  indicadoresApoyo: {
    p1_7Dedicacion: number;
    p1_7Interpretacion: string;
    p5_4Opcion: string;
    p5_4Interpretacion: string;
    p6_3Internet: string;
    p6_4Computadora: string;
    p6_5PlanPrincipal: string;
    p6_6TipoInstitucion: string;
  };
  detalleAreas: PreviewAreaScoreRow[];
}

export function isQuestionAnswered(value: string | string[] | LikertValue | undefined): boolean {
  if (value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  return value !== '';
}

export function getSectionQuestionIds(section: QuestionnaireSection): string[] {
  const ids: string[] = [];
  for (const block of section.blocks) {
    if (block.type === 'likert_group') {
      for (const subgroup of block.subgroups) {
        for (const item of subgroup.items) {
          ids.push(item.id);
        }
      }
    } else {
      ids.push(block.id);
    }
  }
  return ids;
}
