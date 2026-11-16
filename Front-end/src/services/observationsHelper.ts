import type { EvaluationScoringPreview, StudentAnswers } from '../types/questionnaire';

export type AlertLevel = 'alerta' | 'advertencia' | 'info';

export interface QuestionnaireAlert {
  id: string;
  source: string;
  level: AlertLevel;
  title: string;
  description: string;
  suggestedObservation: string;
}

/**
 * Detecta situaciones que levantan observaciones según las pautas de la
 * Plantilla de Corrección Oficial (IE Francisco Lizarzaburu — UPAO 2026).
 */
export function detectQuestionnaireAlerts(
  answers: StudentAnswers,
  preview?: EvaluationScoringPreview | null,
): QuestionnaireAlert[] {
  const alerts: QuestionnaireAlert[] = [];

  // 1. P1.7 Indicador de Dedicación y Organización (Plantilla pág. 2)
  const p1_7 = answers['P1.7'];
  if (typeof p1_7 === 'number') {
    if (p1_7 <= 2) {
      alerts.push({
        id: 'p1_7_bajo',
        source: 'P1.7 (Dedicación)',
        level: 'advertencia',
        title: 'Posible potencial desaprovechado o dificultad de estudio',
        description:
          'Marcó 1 o 2 en organización y dedicación. La Plantilla oficial indica anotar en observaciones.',
        suggestedObservation:
          'P1.7: Presenta bajo nivel de dedicación y organización del tiempo de estudio (puntaje 1–2); posible potencial desaprovechado o dificultad de hábitos.',
      });
    } else if (p1_7 >= 4) {
      alerts.push({
        id: 'p1_7_alto',
        source: 'P1.7 (Dedicación)',
        level: 'info',
        title: 'Estudiante organizado / perfil de respuestas sólido',
        description: 'Marcó 4 o 5. Sus respuestas reflejan un perfil sólido y confiable.',
        suggestedObservation:
          'P1.7: Hábitos de estudio organizados y perfil de respuestas consistente y maduro (puntaje 4–5).',
      });
    }
  }

  // 2. Sección 2: Perfil Psicométrico (Plantilla pág. 2 y 3)
  const s2Keys = ['P2.1', 'P2.2', 'P2.3', 'P2.4', 'P2.5', 'P2.6', 'P2.7', 'P2.8', 'P2.9'];
  const s2Values = s2Keys.map((k) =>
    typeof answers[k] === 'number' ? (answers[k] as number) : null,
  );
  if (s2Values.every((v) => v !== null)) {
    const totalS2 = (s2Values as number[]).reduce((sum, v) => sum + v, 0);
    if (totalS2 >= 9 && totalS2 <= 17) {
      alerts.push({
        id: 's2_muy_bajo',
        source: 'Sección 2 (Psicométrico)',
        level: 'alerta',
        title: 'Alerta psicopedagógica (Perfil Emocional Muy Bajo: 9–17 pts)',
        description:
          'Priorizar apoyo socioemocional escolar antes de la decisión vocacional final (Plantilla pág. 3).',
        suggestedObservation: `S2: Alerta psicopedagógica — Perfil emocional Muy Bajo (${totalS2}/45). Priorizar apoyo socioemocional y tutoría escolar antes de la decisión vocacional definitiva.`,
      });
    } else if (totalS2 >= 18 && totalS2 <= 26) {
      alerts.push({
        id: 's2_bajo',
        source: 'Sección 2 (Psicométrico)',
        level: 'advertencia',
        title: 'Perfil Emocional Bajo (18–26 pts)',
        description:
          'Suele abrumarse ante exámenes y presión. Puede requerir acompañamiento o tutoría vocacional.',
        suggestedObservation: `S2: Perfil emocional Bajo (${totalS2}/45). Manifiesta tendencia a abrumarse ante exámenes y situaciones de presión académica; requiere acompañamiento vocacional.`,
      });
    }
  }

  // 3. P5.4 Exploración extracurricular (Plantilla pág. 5)
  const p5_4 = answers['P5.4'];
  if (p5_4 === 'a') {
    alerts.push({
      id: 'p5_4_bajo',
      source: 'P5.4 (Extracurricular)',
      level: 'info',
      title: 'Poca exploración de intereses vocacionales (< 2 h)',
      description: 'Dedicación extracurricular mínima; perfil vocacional aún en desarrollo inicial.',
      suggestedObservation:
        'P5.4: Baja dedicación a actividades extracurriculares (<2 h semanales); se sugiere propiciar mayor exploración práctica de intereses vocacionales.',
    });
  } else if (p5_4 === 'd') {
    alerts.push({
      id: 'p5_4_alto',
      source: 'P5.4 (Extracurricular)',
      level: 'info',
      title: 'Muy alta dedicación extracurricular (> 10 h)',
      description: 'Alto compromiso y vocación temprana definida.',
      suggestedObservation:
        'P5.4: Muy alta dedicación extracurricular (>10 h semanales); vocación temprana consolidada y alto compromiso práctico.',
    });
  }

  // 4. Sección 6: Contexto socioeconómico y viabilidad (Plantilla pág. 5)
  const p6_3 = answers['P6.3'];
  if (p6_3 === 'b') {
    alerts.push({
      id: 'p6_3_no_internet',
      source: 'P6.3 (Internet)',
      level: 'advertencia',
      title: 'Sin conexión a internet en el hogar',
      description: 'Condición de conectividad limitada para estudios superiores o modalidades híbridas.',
      suggestedObservation:
        'S6: Sin acceso a internet en el hogar; considerar disponibilidad de centros de cómputo y bibliotecas.',
    });
  }

  const p6_4 = answers['P6.4'];
  if (p6_4 === 'c') {
    alerts.push({
      id: 'p6_4_no_pc',
      source: 'P6.4 (Computadora)',
      level: 'advertencia',
      title: 'Sin computadora disponible en casa',
      description:
        'Factor crítico de viabilidad si se orienta hacia carreras de tecnología, sistemas o diseño.',
      suggestedObservation:
        'S6: No cuenta con computadora propia ni compartida en casa; evaluar requerimientos técnicos de equipamiento si opta por carreras tecnológicas.',
    });
  }

  const p6_5 = answers['P6.5'];
  if (p6_5 === 'c') {
    alerts.push({
      id: 'p6_5_trabajar',
      source: 'P6.5 (Plan de vida)',
      level: 'info',
      title: 'Prioridad de trabajar de inmediato al culminar el colegio',
      description: 'Preferencia o necesidad de inserción laboral temprana.',
      suggestedObservation:
        'S6: Prioriza trabajar tras culminar el colegio; orientar hacia carreras técnicas cortas (Área 10) o programas flexibles para trabajar y estudiar.',
    });
  } else if (p6_5 === 'd') {
    alerts.push({
      id: 'p6_5_indeciso',
      source: 'P6.5 (Plan de vida)',
      level: 'advertencia',
      title: 'Indecisión sobre el futuro post-secundaria',
      description: 'El estudiante manifiesta no tener decidido qué hacer al terminar el colegio.',
      suggestedObservation:
        'S6: Estudiante manifiesta indecisión sobre su plan de vida y estudios al culminar 5.° de secundaria.',
    });
  }

  // 5. Criterio de Selección del Veredicto: Empate en 1.° lugar (Plantilla pág. 6)
  if (preview?.requiereRevisionEmpateDual) {
    alerts.push({
      id: 'veredicto_empate',
      source: 'Paso 8 (Veredicto)',
      level: 'advertencia',
      title: 'Empate en primer lugar entre áreas dominantes',
      description:
        'Aplicar criterios de desempate de la pág. 6 (P6.6 tipo de institución, P6.5 plan, o RIASEC S4) o consignar vocación dual válida.',
      suggestedObservation:
        'Veredicto: Se identificó empate técnico en el primer puesto entre opciones vocacionales; corroborar con la entrevista o validar vocación dual.',
    });
  }

  return alerts;
}
