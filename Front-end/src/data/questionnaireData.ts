import type {
  LikertScaleItem,
  QuestionOption,
  QuestionnaireSection,
  VocationalAreaOption,
} from '../types/questionnaire';

export const QUESTIONNAIRE_META = {
  university: 'UNIVERSIDAD PRIVADA ANTENOR ORREGO',
  faculty: 'FACULTAD DE INGENIERÍA — ESCUELA PROFESIONAL DE INGENIERÍA DE SISTEMAS',
  title: 'CUESTIONARIO DE ORIENTACIÓN VOCACIONAL',
  subtitle: 'PARA ESTUDIANTES DE 5.° DE SECUNDARIA',
  school: 'IE - SPMA /A1-80819 FRANCISCO LIZARZABURU',
  targetPopulation: 'Estudiantes de 5.° de secundaria (16-17 años)',
  researchers: 'Cesar Diego Sanchez Chiroque & Renzo Daniel Ponce Evangelista',
  affiliation: 'Universidad Privada Antenor Orrego (UPAO)',
  estimatedTime: '25 – 30 minutos',
  purpose: 'Investigación académica de orientación vocacional',
  welcomeTitle: '¡BIENVENIDO(A)! — TU PARTICIPACIÓN ES MUY VALIOSA',
  welcomeIntro: [
    '¡Hola! Te damos la más cordial bienvenida a este cuestionario de orientación vocacional.',
    'Somos Cesar Diego Sanchez Chiroque y Renzo Daniel Ponce Evangelista, estudiantes e investigadores de la Universidad Privada Antenor Orrego (UPAO). Nos encontramos desarrollando este proyecto especialmente con la comunidad estudiantil de la IE - SPMA /A1-80819 FRANCISCO LIZARZABURU, con el propósito de acompañarte y brindarte un espacio de reflexión en una etapa tan crucial y emocionante como lo es culminar tu 5.° de secundaria.',
    'Sabemos que tomar una decisión sobre tu futuro profesional puede generar muchas preguntas y expectativas. Por ello, este cuestionario busca que conozcas mejor tus talentos, intereses y preferencias personales en un ambiente de total confianza y tranquilidad:',
  ],
  welcomeBullets: [
    'No existen respuestas correctas ni incorrectas: lo más importante es lo que piensas y sientes de manera sincera.',
    'Tus respuestas son estrictamente confidenciales: tus datos están protegidos y se utilizarán exclusivamente para fines académicos de investigación.',
    'Responde con calma y a tu propio ritmo: lee con atención cada pregunta. Marca una sola opción por ítem, salvo indicación expresa.',
    'En las preguntas con escala del 1 al 5: guíate de la tabla de valoración que encontrarás a continuación para indicar tu grado de acuerdo o identificación.',
  ],
  welcomeClosing:
    '¡Agradecemos sinceramente tu valioso tiempo y te deseamos los mayores éxitos en todos tus proyectos personales y académicos!',
  confidentialityTitle: 'Compromiso de Confidencialidad',
  confidentialityText:
    'Tus datos personales están protegidos por el principio de confidencialidad académica. Se emplearán únicamente para vincular tus resultados con fines de investigación educativa y no serán divulgados de forma individual.',
};

export const LIKERT_SCALE: LikertScaleItem[] = [
  { value: 1, label: 'Totalmente en desacuerdo / Nada identificado(a)' },
  { value: 2, label: 'En desacuerdo / Poco identificado(a)' },
  { value: 3, label: 'Ni de acuerdo ni en desacuerdo / Moderadamente identificado(a)' },
  { value: 4, label: 'De acuerdo / Bastante identificado(a)' },
  { value: 5, label: 'Totalmente de acuerdo / Completamente identificado(a)' },
];

export const AGE_OPTIONS = ['15 años', '16 años', '17 años', '18 años', 'Otro'];

export const SEX_OPTIONS = ['Masculino', 'Femenino'];

const ACADEMIC_AREAS_OPTIONS: QuestionOption[] = [
  { code: 'a', label: 'Arte y Cultura' },
  { code: 'b', label: 'Castellano como Segunda Lengua' },
  { code: 'c', label: 'Ciencias Sociales' },
  { code: 'd', label: 'Ciencia y Tecnología' },
  { code: 'e', label: 'Comunicación' },
  { code: 'f', label: 'Desarrollo Personal, Ciudadanía y Cívica' },
  { code: 'g', label: 'Educación Física' },
  { code: 'h', label: 'Educación Para el Trabajo' },
  { code: 'i', label: 'Educación Religiosa' },
  { code: 'j', label: 'Inglés' },
  { code: 'k', label: 'Matemática' },
];

const PARENT_EDUCATION_OPTIONS: QuestionOption[] = [
  { code: 'a', label: 'Primaria incompleta o completa' },
  { code: 'b', label: 'Secundaria incompleta o completa' },
  { code: 'c', label: 'Técnico / Instituto superior' },
  { code: 'd', label: 'Universidad completa (Bachiller o Licenciatura)' },
  { code: 'e', label: 'Posgrado (Maestría o Doctorado)' },
  { code: 'f', label: 'No lo sé' },
];

export const QUESTIONNAIRE_SECTIONS: QuestionnaireSection[] = [
  {
    id: 'section-1',
    number: 1,
    title: 'SECCIÓN 1: RENDIMIENTO ACADÉMICO — AUTOEVALUACIÓN',
    shortTitle: 'Rendimiento Académico',
    instruction:
      'En esta sección evaluamos tu percepción personal sobre tus fortalezas y dificultades académicas.',
    blocks: [
      {
        id: 'P1.1',
        code: 'P1.1',
        type: 'multiple_choice',
        prompt: '¿En cuál de las siguientes áreas consideras que aprendes con mayor facilidad?',
        note: 'Puedes marcar una o más opciones',
        options: ACADEMIC_AREAS_OPTIONS,
      },
      {
        id: 'P1.2',
        code: 'P1.2',
        type: 'multiple_choice',
        prompt: '¿Y en cuál de esas áreas sientes que tienes más dificultad?',
        note: 'Puedes marcar una o más opciones',
        options: ACADEMIC_AREAS_OPTIONS,
      },
      {
        id: 's1-likert',
        type: 'likert_group',
        prompt: 'Indica tu grado de acuerdo con las siguientes afirmaciones (del 1 al 5):',
        subgroups: [
          {
            id: 's1-general',
            items: [
              {
                id: 'P1.3',
                code: 'P1.3',
                statement: 'Me resulta fácil entender temas de Matemática cuando los estudio.',
              },
              {
                id: 'P1.4',
                code: 'P1.4',
                statement: 'Me resulta fácil entender temas de Ciencias (Biología, Química, Física).',
              },
              {
                id: 'P1.5',
                code: 'P1.5',
                statement: 'Me resulta fácil entender temas de Humanidades (Historia, Literatura, Filosofía).',
              },
              {
                id: 'P1.6',
                code: 'P1.6',
                statement: 'Me resulta fácil expresarme a través del Arte (dibujo, música, teatro, danza).',
              },
              {
                id: 'P1.7',
                code: 'P1.7',
                statement:
                  'En general, me considero un(a) estudiante dedicado(a) y organizado(a) con mis tareas.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'section-2',
    number: 2,
    title: 'SECCIÓN 2: PERFIL PSICOMÉTRICO — CONDUCTUAL Y EMOCIONAL',
    shortTitle: 'Perfil Psicométrico',
    instruction:
      'Esta sección evalúa cómo te sientes y reaccionas frente a situaciones de estudio y exámenes. No mide inteligencia ni conocimientos. Responde con qué frecuencia o grado te identificas (escala del 1 al 5).',
    blocks: [
      {
        id: 's2-likert',
        type: 'likert_group',
        prompt: 'Afirmaciones / Enunciados (escala del 1 al 5):',
        subgroups: [
          {
            id: '2A',
            badge: '2A',
            title: '2A — Autoeficacia Académica',
            items: [
              {
                id: 'P2.1',
                code: 'P2.1',
                statement: 'Confío en que puedo aprobar cualquier curso si me esfuerzo lo suficiente.',
              },
              {
                id: 'P2.2',
                code: 'P2.2',
                statement: 'Cuando me propongo una meta académica, creo que soy capaz de alcanzarla.',
              },
              {
                id: 'P2.3',
                code: 'P2.3',
                statement:
                  'Siento que mi esfuerzo personal influye más en mis notas que la suerte o el profesor.',
              },
            ],
          },
          {
            id: '2B',
            badge: '2B',
            title: '2B — Resiliencia frente a la Frustración Académica',
            items: [
              {
                id: 'P2.4',
                code: 'P2.4',
                statement: 'Cuando saco una mala nota, me motivo a estudiar más en vez de rendirme.',
              },
              {
                id: 'P2.5',
                code: 'P2.5',
                statement:
                  'Si un tema me cuesta mucho, busco otra forma de entenderlo (videos, preguntar, practicar).',
              },
              {
                id: 'P2.6',
                code: 'P2.6',
                statement: 'Después de un fracaso académico, me recupero emocionalmente con relativa rapidez.',
              },
            ],
          },
          {
            id: '2C',
            badge: '2C',
            title: '2C — Tolerancia al Estrés bajo Presión',
            items: [
              {
                id: 'P2.7',
                code: 'P2.7',
                statement: 'Puedo concentrarme bien en un examen aunque esté nervioso(a).',
              },
              {
                id: 'P2.8',
                code: 'P2.8',
                statement:
                  'Cuando tengo varias tareas con fecha límite, logro organizarme sin sentirme abrumado(a).',
              },
              {
                id: 'P2.9',
                code: 'P2.9',
                statement: 'Mantengo la calma cuando un trabajo se complica o no sale como esperaba.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'section-3',
    number: 3,
    title: 'SECCIÓN 3: APTITUDES COGNITIVAS AUTOPERCIBIDAS',
    shortTitle: 'Aptitudes Cognitivas',
    instruction:
      'Aquí deseamos conocer cómo percibes tus habilidades mentales cotidianas. Responde con sinceridad marcando del 1 al 5 según tu grado de identificación.',
    blocks: [
      {
        id: 's3-likert',
        type: 'likert_group',
        prompt: 'Afirmaciones / Enunciados (escala del 1 al 5):',
        subgroups: [
          {
            id: '3A',
            badge: '3A',
            title: '3A — Razonamiento Lógico-Matemático',
            items: [
              {
                id: 'P3.1',
                code: 'P3.1',
                statement: 'Me resulta natural resolver problemas que requieren pasos lógicos o cálculos.',
              },
              {
                id: 'P3.2',
                code: 'P3.2',
                statement: 'Disfruto encontrar patrones o secuencias en números o figuras.',
              },
              {
                id: 'P3.3',
                code: 'P3.3',
                statement: 'Se me facilita analizar datos y sacar conclusiones a partir de ellos.',
              },
            ],
          },
          {
            id: '3B',
            badge: '3B',
            title: '3B — Comprensión y Fluidez Verbal',
            items: [
              {
                id: 'P3.4',
                code: 'P3.4',
                statement: 'Puedo explicar ideas complejas con mis propias palabras de forma clara.',
              },
              {
                id: 'P3.5',
                code: 'P3.5',
                statement: 'Cuando leo un texto largo, entiendo su mensaje principal sin dificultad.',
              },
              {
                id: 'P3.6',
                code: 'P3.6',
                statement: 'Me siento cómodo(a) expresándome en público o escribiendo ensayos.',
              },
            ],
          },
          {
            id: '3C',
            badge: '3C',
            title: '3C — Abstracción y Razonamiento Espacial/Visual',
            items: [
              {
                id: 'P3.7',
                code: 'P3.7',
                statement: 'Puedo imaginar objetos en 3D o rotarlos mentalmente sin dificultad.',
              },
              {
                id: 'P3.8',
                code: 'P3.8',
                statement: 'Se me facilita leer mapas, planos o diagramas y entender lo que representan.',
              },
              {
                id: 'P3.9',
                code: 'P3.9',
                statement: 'Me resulta sencillo pensar en conceptos abstractos (ej. teorías o modelos).',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'section-4',
    number: 4,
    title: 'SECCIÓN 4: PERSONALIDAD Y PREFERENCIAS VOCACIONALES — MODELO RIASEC',
    shortTitle: 'Modelo RIASEC',
    instruction:
      "Indica qué tanto te identificas con cada una de las siguientes afirmaciones (del 1 al 5). No pienses en lo que 'deberías' responder, sino en lo que realmente disfrutas y sientes.",
    blocks: [
      {
        id: 's4-likert',
        type: 'likert_group',
        prompt: 'Dimensiones del Modelo RIASEC (escala del 1 al 5):',
        subgroups: [
          {
            id: 'R',
            badge: 'R',
            title: 'R — Dimensión Realista (Orientación práctica, manual y técnica)',
            items: [
              {
                id: 'P4.1',
                code: 'P4.1',
                statement:
                  'Disfruto armar, reparar o construir cosas con mis manos (aparatos, maquetas, circuitos).',
              },
              {
                id: 'P4.2',
                code: 'P4.2',
                statement: 'Prefiero las actividades al aire libre o que impliquen esfuerzo físico.',
              },
              {
                id: 'P4.3',
                code: 'P4.3',
                statement: 'Me gusta usar herramientas, máquinas o equipos en vez de solo leer o escribir.',
              },
            ],
          },
          {
            id: 'I',
            badge: 'I',
            title: 'I — Dimensión Investigadora (Orientación científica y analítica)',
            items: [
              {
                id: 'P4.4',
                code: 'P4.4',
                statement:
                  'Me llama la atención investigar por qué ocurren las cosas (fenómenos, experimentos).',
              },
              {
                id: 'P4.5',
                code: 'P4.5',
                statement: 'Disfruto buscar información a fondo sobre temas que me interesan.',
              },
              {
                id: 'P4.6',
                code: 'P4.6',
                statement:
                  'Me considero una persona curiosa que siempre quiere entender el "por qué" de las cosas.',
              },
            ],
          },
          {
            id: 'A',
            badge: 'A',
            title: 'A — Dimensión Artística (Orientación creativa y expresiva)',
            items: [
              {
                id: 'P4.7',
                code: 'P4.7',
                statement:
                  'Me gusta crear cosas originales (dibujar, escribir historias, componer música, diseñar).',
              },
              {
                id: 'P4.8',
                code: 'P4.8',
                statement: 'Valoro la estética y la belleza en las cosas que me rodean.',
              },
              {
                id: 'P4.9',
                code: 'P4.9',
                statement:
                  'Me siento más cómodo(a) en ambientes donde puedo expresarme libremente sin reglas rígidas.',
              },
            ],
          },
          {
            id: 'S',
            badge: 'S',
            title: 'S — Dimensión Social (Orientación de ayuda, docencia y servicio)',
            items: [
              {
                id: 'P4.10',
                code: 'P4.10',
                statement:
                  'Me motiva ayudar a los demás a resolver sus problemas o a aprender algo nuevo.',
              },
              {
                id: 'P4.11',
                code: 'P4.11',
                statement: 'Me llevo bien con diferentes tipos de personas y me gusta trabajar en equipo.',
              },
              {
                id: 'P4.12',
                code: 'P4.12',
                statement: 'Me interesa participar en actividades de voluntariado o apoyo comunitario.',
              },
            ],
          },
          {
            id: 'E',
            badge: 'E',
            title: 'E — Dimensión Emprendedora (Orientación de liderazgo, negocios y persuasión)',
            items: [
              {
                id: 'P4.13',
                code: 'P4.13',
                statement: 'Me gusta liderar proyectos o grupos y tomar decisiones importantes.',
              },
              {
                id: 'P4.14',
                code: 'P4.14',
                statement: 'Me atrae la idea de crear mi propio negocio o emprendimiento algún día.',
              },
              {
                id: 'P4.15',
                code: 'P4.15',
                statement: 'Soy bueno(a) convenciendo o motivando a otros para lograr un objetivo.',
              },
            ],
          },
          {
            id: 'C',
            badge: 'C',
            title: 'C — Dimensión Convencional (Orientación metódica, organizativa y de control)',
            items: [
              {
                id: 'P4.16',
                code: 'P4.16',
                statement:
                  'Me siento cómodo(a) realizando tareas que siguen instrucciones claras y un orden definido.',
              },
              {
                id: 'P4.17',
                code: 'P4.17',
                statement:
                  'Disfruto organizar información: clasificar archivos, hacer listas, completar formularios.',
              },
              {
                id: 'P4.18',
                code: 'P4.18',
                statement: 'Me gusta que las cosas estén bien estructuradas y sin ambigüedades.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'section-5',
    number: 5,
    title: 'SECCIÓN 5: INTERESES Y HOBBIES',
    shortTitle: 'Intereses y Hobbies',
    instruction:
      'Esta sección explora tus intereses y actividades fuera del horario de clases. Responde considerando lo que haces o te gustaría hacer por agrado personal en tu tiempo libre.',
    blocks: [
      {
        id: 'P5.1',
        code: 'P5.1',
        type: 'single_choice',
        prompt: '¿Cuál de las siguientes actividades disfrutas más en tu tiempo libre?',
        note: 'Marca solo una',
        options: [
          { code: 'a', label: 'Deportes, trabajos manuales, mecánica, jardinería o cocina' },
          { code: 'b', label: 'Leer sobre ciencia, ver documentales, experimentar o programar' },
          { code: 'c', label: 'Dibujar, pintar, tocar música, escribir, fotografía o diseño' },
          { code: 'd', label: 'Hacer voluntariado, enseñar a otros, participar en grupos sociales' },
          { code: 'e', label: 'Vender cosas, organizar eventos, crear contenido en redes sociales' },
          {
            code: 'f',
            label: 'Organizar mis cosas, llevar cuentas, coleccionar, crear bases de datos',
          },
        ],
      },
      {
        id: 'P5.2',
        code: 'P5.2',
        type: 'single_choice',
        prompt:
          '¿Cuál de estos temas te llama más la atención para curiosear, leer o aprender por tu cuenta en tu tiempo libre?',
        note: 'Marca solo una',
        options: [
          {
            code: 'a',
            label:
              'Cómo funcionan o se arreglan las cosas prácticas: máquinas, motores, herramientas o la naturaleza',
          },
          {
            code: 'b',
            label:
              'La ciencia y los nuevos descubrimientos: tecnología, experimentos, la salud del cuerpo o el espacio',
          },
          {
            code: 'c',
            label:
              'El arte y la creatividad: música, dibujo, creación de videos, historias, diseño o fotos',
          },
          {
            code: 'd',
            label:
              'Las personas y la ayuda social: cómo pensamos y sentimos, la educación o apoyar a quienes lo necesitan',
          },
          {
            code: 'e',
            label:
              'Los negocios y las ventas: cómo crear una marca propia, hacer publicidad por internet o dirigir un grupo',
          },
          {
            code: 'f',
            label:
              'El orden y las cuentas: cómo administrar el dinero, ordenar documentos o clasificar información en la computadora',
          },
        ],
      },
      {
        id: 'P5.3',
        code: 'P5.3',
        type: 'single_choice',
        prompt:
          'Si en el colegio te dieran libertad total para realizar un proyecto grupal de fin de año, ¿cuál preferirías hacer?',
        note: 'Marca solo una',
        options: [
          {
            code: 'a',
            label:
              'Diseñar y construir una maqueta práctica, un modelo a escala o un invento usando herramientas y materiales reales',
          },
          {
            code: 'b',
            label:
              'Realizar un experimento de ciencias y explicar paso a paso lo que descubriste y cómo sucedió',
          },
          {
            code: 'c',
            label:
              'Grabar un video o película corta, pintar un mural en el colegio o preparar una presentación de teatro o música',
          },
          {
            code: 'd',
            label:
              'Organizar una campaña de ayuda solidaria, una colecta o una actividad para apoyar a personas de la comunidad',
          },
          {
            code: 'e',
            label:
              'Organizar una feria escolar de venta de productos o comida preparados por ustedes para generar ganancias',
          },
          {
            code: 'f',
            label:
              'Poner en orden los libros de la biblioteca del colegio o elaborar un inventario detallado de los materiales del aula',
          },
        ],
      },
      {
        id: 'P5.4',
        code: 'P5.4',
        type: 'single_choice',
        prompt: '¿Cuántas horas a la semana dedicas aproximadamente a actividades extracurriculares?',
        note: 'deportes, academias, talleres, hobbies — Marca solo una',
        options: [
          { code: 'a', label: 'Menos de 2 horas' },
          { code: 'b', label: 'De 2 a 5 horas' },
          { code: 'c', label: 'De 6 a 10 horas' },
          { code: 'd', label: 'Más de 10 horas' },
        ],
      },
    ],
  },
  {
    id: 'section-6',
    number: 6,
    title: 'SECCIÓN 6: ENTORNO SOCIOECONÓMICO',
    shortTitle: 'Entorno Socioeconómico',
    instruction:
      'Estas preguntas nos ayudan a contextualizar tu entorno de aprendizaje. Recuerda que no existen respuestas buenas ni malas y que toda la información brindada es confidencial.',
    blocks: [
      {
        id: 'P6.1',
        code: 'P6.1',
        type: 'single_choice',
        prompt: '¿Cuál es el nivel educativo más alto alcanzado por tu madre o tutora?',
        note: 'Marca solo una',
        options: PARENT_EDUCATION_OPTIONS,
      },
      {
        id: 'P6.2',
        code: 'P6.2',
        type: 'single_choice',
        prompt: '¿Cuál es el nivel educativo más alto alcanzado por tu padre o tutor?',
        note: 'Marca solo una',
        options: PARENT_EDUCATION_OPTIONS,
      },
      {
        id: 'P6.3',
        code: 'P6.3',
        type: 'single_choice',
        prompt: '¿Cuentas con acceso a internet en tu hogar?',
        note: 'Marca solo una',
        options: [
          { code: 'a', label: 'Sí, conexión fija (WiFi / cable de fibra)' },
          { code: 'b', label: 'Sí, únicamente mediante datos móviles (plan de celular)' },
          { code: 'c', label: 'No cuento con acceso a internet en casa' },
        ],
      },
      {
        id: 'P6.4',
        code: 'P6.4',
        type: 'single_choice',
        prompt: '¿Dispones de una computadora o laptop de uso personal para tus estudios?',
        note: 'Marca solo una',
        options: [
          { code: 'a', label: 'Sí, de uso exclusivo para mí' },
          { code: 'b', label: 'Sí, pero la comparto con otros miembros de mi familia' },
          { code: 'c', label: 'No, utilizo la de una cabina de internet, biblioteca u otro lugar' },
          { code: 'd', label: 'No dispongo de computadora ni laptop' },
        ],
      },
      {
        id: 'P6.5',
        code: 'P6.5',
        type: 'single_choice',
        prompt: 'Al terminar el colegio, ¿cuál es tu plan principal?',
        note: 'Marca solo una',
        options: [
          { code: 'a', label: 'Estudiar una carrera a tiempo completo (universidad o instituto)' },
          { code: 'b', label: 'Estudiar y trabajar al mismo tiempo' },
          { code: 'c', label: 'Trabajar a tiempo completo' },
          { code: 'd', label: 'Tomarme un tiempo (año sabático) para decidir mi vocación' },
          { code: 'e', label: 'Aún no lo tengo claro' },
        ],
      },
      {
        id: 'P6.6',
        code: 'P6.6',
        type: 'single_choice',
        prompt: 'Si piensas estudiar, ¿qué tipo de institución prefieres?',
        note: 'Marca solo una',
        options: [
          { code: 'a', label: 'Universidad pública' },
          { code: 'b', label: 'Universidad privada' },
          { code: 'c', label: 'Instituto técnico / tecnológico superior' },
          { code: 'd', label: 'Escuela militar / policial' },
          { code: 'e', label: 'Aún no lo decido' },
        ],
      },
    ],
  },
];

export const VOCATIONAL_AREAS: VocationalAreaOption[] = [
  {
    code: '01',
    name: 'Ciencias de la Salud',
    examples: 'Medicina, Enfermería, Odontología, Nutrición, Farmacia',
  },
  {
    code: '02',
    name: 'Ingenierías y Tecnología',
    examples: 'Ing. Civil, Sistemas, Industrial, Mecánica, Electrónica, Ambiental',
  },
  {
    code: '03',
    name: 'Ciencias Básicas y Naturales',
    examples: 'Biología, Química, Física, Matemáticas',
  },
  {
    code: '04',
    name: 'Ciencias Sociales y Humanidades',
    examples: 'Derecho, Psicología, Sociología, Historia, Filosofía',
  },
  {
    code: '05',
    name: 'Ciencias Económicas y Empresariales',
    examples: 'Administración, Contabilidad, Economía, Marketing',
  },
  {
    code: '06',
    name: 'Comunicación, Arte y Diseño',
    examples: 'Periodismo, Publicidad, Diseño Gráfico, Audiovisuales, Arquitectura',
  },
  {
    code: '07',
    name: 'Educación y Pedagogía',
    examples: 'Educación Inicial, Primaria, Secundaria, Educación Física',
  },
  {
    code: '08',
    name: 'Ciencias Agrarias y Ambientales',
    examples: 'Agronomía, Veterinaria, Ing. Ambiental, Zootecnia',
  },
  {
    code: '09',
    name: 'Fuerzas Armadas y Orden',
    examples: 'Carrera militar, Policía, Bomberos',
  },
  {
    code: '10',
    name: 'Oficios Técnicos y Tecnológicos',
    examples: 'Mecánica automotriz, Gastronomía, Electricidad, Computación técnica',
  },
];

/** Helper para contar las preguntas de una sección y las respondidas */
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

export const ALL_STUDENT_QUESTION_IDS: string[] = QUESTIONNAIRE_SECTIONS.flatMap(
  getSectionQuestionIds,
);
