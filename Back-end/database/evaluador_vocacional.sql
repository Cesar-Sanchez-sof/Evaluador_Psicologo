-- =============================================================================
-- SISTEMA DE ORIENTACIÓN VOCACIONAL — IE - SPMA /A1-80819 FRANCISCO LIZARZABURU
-- Base de Datos y Motor de Corrección Automática (PostgreSQL 14+)
--
-- Fuentes de referencia:
--   1. Cuestionario_Orientacion_Vocacional.pdf (Secciones 1 a 7, 53 ítems)
--      * Nota de diseño: P1.1 y P1.2 admiten respuestas múltiples.
--   2. Plantilla_Correccion_Cuestionario_OV.pdf (Reglas de puntaje, S2, desempate)
--
-- Flujo de uso con Back-end (Node.js):
--   1. Registrar estudiante en `estudiantes` y crear fila en `evaluaciones`.
--   2. Guardar respuestas del alumno en `respuestas_cuestionario`
--      (en P1.1 y P1.2 se inserta una fila por cada opción marcada).
--   3. Ejecutar `SELECT fn_calcular_y_guardar_evaluacion(<evaluacion_id>);`
--      para calcular según la Plantilla de Corrección y persistir el resultado
--      en `resultados_evaluacion` y `resultados_detalle_area`.
--   4. Opcionalmente, el psicólogo registra su veredicto final en `veredictos_psicologo`.
--
-- Investigadores: Cesar Diego Sanchez Chiroque & Renzo Daniel Ponce Evangelista
-- Filiación: Universidad Privada Antenor Orrego (UPAO)
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 0. LIMPIEZA PARA RE-EJECUCIÓN EN DESARROLLO
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS fn_calcular_y_guardar_evaluacion(BIGINT) CASCADE;

DROP VIEW IF EXISTS vw_hoja_correccion_final CASCADE;
DROP VIEW IF EXISTS vw_consolidado_puntajes_area CASCADE;
DROP VIEW IF EXISTS vw_indicadores_apoyo CASCADE;
DROP VIEW IF EXISTS vw_puntajes_riasec_s4 CASCADE;
DROP VIEW IF EXISTS vw_puntajes_cognitivos_s3 CASCADE;
DROP VIEW IF EXISTS vw_resumen_seccion2_psicometrico CASCADE;

DROP TABLE IF EXISTS notas_oficiales CASCADE;
DROP TABLE IF EXISTS veredictos_psicologo CASCADE;
DROP TABLE IF EXISTS resultados_detalle_area CASCADE;
DROP TABLE IF EXISTS resultados_evaluacion CASCADE;
DROP TABLE IF EXISTS respuestas_cuestionario CASCADE;
DROP TABLE IF EXISTS evaluaciones CASCADE;
DROP TABLE IF EXISTS estudiantes CASCADE;
DROP TABLE IF EXISTS reglas_puntuacion CASCADE;
DROP TABLE IF EXISTS opciones_pregunta CASCADE;
DROP TABLE IF EXISTS preguntas CASCADE;
DROP TABLE IF EXISTS secciones_cuestionario CASCADE;
DROP TABLE IF EXISTS areas_vocacionales CASCADE;

-- -----------------------------------------------------------------------------
-- 1. TABLAS MAESTRAS (CATÁLOGOS DEL INSTRUMENTO Y PLANTILLA DE CORRECCIÓN)
-- -----------------------------------------------------------------------------

CREATE TABLE areas_vocacionales (
    codigo          CHAR(2) PRIMARY KEY CHECK (codigo ~ '^(0[1-9]|10)$'),
    nombre          VARCHAR(100) NOT NULL UNIQUE,
    ejemplos_cortos TEXT NOT NULL,
    carreras_afines TEXT NOT NULL
);

CREATE TABLE secciones_cuestionario (
    id           SMALLINT PRIMARY KEY,
    numero       SMALLINT NOT NULL UNIQUE CHECK (numero BETWEEN 1 AND 7),
    codigo       VARCHAR(16) NOT NULL UNIQUE,
    titulo       VARCHAR(180) NOT NULL,
    instruccion  TEXT NOT NULL,
    suma_puntaje BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE preguntas (
    id                  SMALLINT PRIMARY KEY,
    seccion_id          SMALLINT NOT NULL REFERENCES secciones_cuestionario(id),
    codigo              VARCHAR(10) NOT NULL UNIQUE, -- Ej. P1.1 .. P6.6
    subgrupo_codigo     VARCHAR(10),                 -- Ej. 2A, 3A, R, I, A, S, E, C
    subgrupo_nombre     VARCHAR(140),
    enunciado           TEXT NOT NULL,
    tipo_respuesta      VARCHAR(20) NOT NULL
                        CHECK (tipo_respuesta IN ('opcion_unica', 'opcion_multiple', 'likert_1_5')),
    es_puntuable        BOOLEAN NOT NULL DEFAULT TRUE,
    es_indicador_apoyo  BOOLEAN NOT NULL DEFAULT FALSE,
    orden               SMALLINT NOT NULL
);

CREATE TABLE opciones_pregunta (
    id             SERIAL PRIMARY KEY,
    pregunta_id    SMALLINT NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
    codigo_opcion  VARCHAR(5) NOT NULL, -- 'a'..'k'
    texto_opcion   TEXT NOT NULL,
    orden          SMALLINT NOT NULL,
    UNIQUE (pregunta_id, codigo_opcion)
);

-- Reglas de puntuación según Plantilla_Correccion_Cuestionario_OV.pdf:
--   - tipo_calculo = 'fijo': suma/resta `peso_puntos` por cada opción marcada.
--   - tipo_calculo = 'likert_directo': suma `valor_likert * peso_puntos`.
CREATE TABLE reglas_puntuacion (
    id             SERIAL PRIMARY KEY,
    pregunta_id    SMALLINT NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
    codigo_opcion  VARCHAR(5), -- NULL cuando tipo_calculo = 'likert_directo'
    area_codigo    CHAR(2) NOT NULL REFERENCES areas_vocacionales(codigo),
    tipo_calculo   VARCHAR(20) NOT NULL CHECK (tipo_calculo IN ('fijo', 'likert_directo')),
    peso_puntos    SMALLINT NOT NULL,
    descripcion    VARCHAR(200)
);

CREATE INDEX idx_reglas_pregunta_opcion ON reglas_puntuacion(pregunta_id, codigo_opcion);

-- -----------------------------------------------------------------------------
-- 2. TABLAS TRANSACCIONALES (ENCUESTA, RESPUESTAS Y RESULTADOS ALMACENADOS)
-- -----------------------------------------------------------------------------

CREATE TABLE estudiantes (
    id                    BIGSERIAL PRIMARY KEY,
    nombres_apellidos     VARCHAR(200) NOT NULL,
    edad_opcion           VARCHAR(20) NOT NULL CHECK (edad_opcion IN ('15 años', '16 años', '17 años', '18 años', 'Otro')),
    edad_exacta           SMALLINT CHECK (edad_exacta BETWEEN 12 AND 25),
    sexo                  VARCHAR(15) NOT NULL CHECK (sexo IN ('Masculino', 'Femenino')),
    institucion_educativa VARCHAR(150) NOT NULL DEFAULT 'IE - SPMA /A1-80819 FRANCISCO LIZARZABURU',
    grado                 VARCHAR(40) NOT NULL DEFAULT '5.° de secundaria',
    seccion               VARCHAR(30) NOT NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Nueva tabla para las notas oficiales (Rendimiento Académico) en escala 0-20
CREATE TABLE IF NOT EXISTS notas_oficiales (
    id SERIAL PRIMARY KEY,
    estudiante_id BIGINT UNIQUE NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    nota_matematica DECIMAL(5,2),
    nota_comunicacion DECIMAL(5,2),
    nota_ciencia_tecnologia DECIMAL(5,2),
    nota_ciencias_sociales DECIMAL(5,2),
    nota_dpcc DECIMAL(5,2),
    nota_educacion_fisica DECIMAL(5,2),
    nota_arte_cultura DECIMAL(5,2),
    nota_ingles DECIMAL(5,2),
    nota_educacion_trabajo DECIMAL(5,2),
    nota_educacion_religiosa DECIMAL(5,2),
    nota_castellano_segunda_lengua DECIMAL(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE evaluaciones (
    id                 BIGSERIAL PRIMARY KEY,
    estudiante_id      BIGINT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    fecha_aplicacion   DATE NOT NULL DEFAULT CURRENT_DATE,
    estado             VARCHAR(20) NOT NULL DEFAULT 'completada'
                       CHECK (estado IN ('en_progreso', 'completada', 'evaluada', 'revisada')),
    tiempo_llenado_min SMALLINT CHECK (tiempo_llenado_min > 0),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE respuestas_cuestionario (
    id            BIGSERIAL PRIMARY KEY,
    evaluacion_id BIGINT NOT NULL REFERENCES evaluaciones(id) ON DELETE CASCADE,
    pregunta_id   SMALLINT NOT NULL REFERENCES preguntas(id),
    codigo_opcion VARCHAR(5),
    valor_likert  SMALLINT CHECK (valor_likert BETWEEN 1 AND 5),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Permite múltiples filas en preguntas de opción múltiple (P1.1 y P1.2)
    -- evitando duplicar la misma opción para una misma pregunta y evaluación:
    UNIQUE (evaluacion_id, pregunta_id, codigo_opcion),
    CHECK (
        (codigo_opcion IS NOT NULL AND valor_likert IS NULL)
        OR
        (codigo_opcion IS NULL AND valor_likert IS NOT NULL)
    )
);

-- Para preguntas Likert solo se admite un único valor por evaluación y pregunta
CREATE UNIQUE INDEX uq_respuesta_likert_item
    ON respuestas_cuestionario(evaluacion_id, pregunta_id)
    WHERE valor_likert IS NOT NULL;

CREATE INDEX idx_respuestas_evaluacion ON respuestas_cuestionario(evaluacion_id);

-- Almacenamiento persistente del resultado calculado según Plantilla_Correccion_Cuestionario_OV.pdf
CREATE TABLE resultados_evaluacion (
    evaluacion_id                   BIGINT PRIMARY KEY REFERENCES evaluaciones(id) ON DELETE CASCADE,
    -- Primera y segunda opción vocacional determinada
    primera_opcion_codigo           CHAR(2) NOT NULL REFERENCES areas_vocacionales(codigo),
    primera_opcion_puntaje          INTEGER NOT NULL,
    segunda_opcion_codigo           CHAR(2) NOT NULL REFERENCES areas_vocacionales(codigo),
    segunda_opcion_puntaje          INTEGER NOT NULL,
    requiere_revision_empate_dual   BOOLEAN NOT NULL DEFAULT FALSE,
    -- Sección 2: Perfil psicométrico (moduladora)
    grupo_a_autoeficacia            SMALLINT NOT NULL,
    grupo_b_resiliencia             SMALLINT NOT NULL,
    grupo_c_estres                  SMALLINT NOT NULL,
    total_s2                        SMALLINT NOT NULL,
    nivel_psicometrico              VARCHAR(20) NOT NULL,
    interpretacion_s2               TEXT NOT NULL,
    -- Sección 3: Aptitudes cognitivas
    puntaje_3a_logico_matematico    SMALLINT NOT NULL,
    puntaje_3b_comprension_verbal   SMALLINT NOT NULL,
    puntaje_3c_espacial_visual      SMALLINT NOT NULL,
    -- Sección 4: Personalidad RIASEC
    puntaje_r_realista              SMALLINT NOT NULL,
    puntaje_i_investigador          SMALLINT NOT NULL,
    puntaje_a_artistico             SMALLINT NOT NULL,
    puntaje_s_social                SMALLINT NOT NULL,
    puntaje_e_emprendedor           SMALLINT NOT NULL,
    puntaje_c_convencional          SMALLINT NOT NULL,
    -- Indicadores complementarios
    p1_7_dedicacion                 SMALLINT,
    p1_7_interpretacion             TEXT,
    p5_4_opcion                     VARCHAR(5),
    p5_4_interpretacion             TEXT,
    calculado_en                    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Desglose persistente de las 10 áreas vocacionales por evaluación (Tabla Paso 8 / Hoja pág. 9)
CREATE TABLE resultados_detalle_area (
    evaluacion_id          BIGINT NOT NULL REFERENCES evaluaciones(id) ON DELETE CASCADE,
    area_codigo            CHAR(2) NOT NULL REFERENCES areas_vocacionales(codigo),
    ptos_s1                INTEGER NOT NULL DEFAULT 0,
    ptos_s3                INTEGER NOT NULL DEFAULT 0,
    ptos_s4                INTEGER NOT NULL DEFAULT 0,
    ptos_s5                INTEGER NOT NULL DEFAULT 0,
    bonus_s6               INTEGER NOT NULL DEFAULT 0,
    total_area             INTEGER NOT NULL DEFAULT 0,
    porcentaje_orientacion NUMERIC(5,2) NOT NULL DEFAULT 0,
    orden_prioridad        SMALLINT NOT NULL,
    PRIMARY KEY (evaluacion_id, area_codigo)
);

-- Sección 7: Veredicto del Experto — Ficha de Evaluación Profesional (uso exclusivo psicólogo)
CREATE TABLE veredictos_psicologo (
    id                             BIGSERIAL PRIMARY KEY,
    evaluacion_id                  BIGINT NOT NULL UNIQUE REFERENCES evaluaciones(id) ON DELETE CASCADE,
    psicologo_evaluador            VARCHAR(180) NOT NULL,
    cpsp_numero                    VARCHAR(30),
    fecha_evaluacion               DATE NOT NULL DEFAULT CURRENT_DATE,
    area_primera_opcion_codigo     CHAR(2) NOT NULL REFERENCES areas_vocacionales(codigo),
    area_segunda_opcion_codigo     CHAR(2) REFERENCES areas_vocacionales(codigo),
    es_vocacion_dual               BOOLEAN NOT NULL DEFAULT FALSE,
    area_dual_codigo               CHAR(2) REFERENCES areas_vocacionales(codigo),
    observaciones_psicopedagogicas TEXT,
    created_at                     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. POBLADO DE CATÁLOGOS (ÁREAS, SECCIONES, 53 PREGUNTAS, OPCIONES Y REGLAS)
-- -----------------------------------------------------------------------------

INSERT INTO areas_vocacionales (codigo, nombre, ejemplos_cortos, carreras_afines) VALUES
('01', 'Ciencias de la Salud',
 'Medicina, Enfermería, Odontología, Nutrición, Farmacia',
 'Medicina Humana, Enfermería, Odontología, Obstetricia, Farmacia y Bioquímica, Nutrición y Dietética, Tecnología Médica, Psicología Clínica, Fisioterapia y Rehabilitación.'),
('02', 'Ingenierías y Tecnología',
 'Ing. Civil, Sistemas, Industrial, Mecánica, Electrónica, Ambiental',
 'Ingeniería de Sistemas y Computación, Ingeniería Civil, Ingeniería Industrial, Ingeniería Mecatrónica, Ingeniería Electrónica y Telecomunicaciones, Arquitectura y Urbanismo, Ingeniería Mecánica.'),
('03', 'Ciencias Básicas y Naturales',
 'Biología, Química, Física, Matemáticas',
 'Biología pura, Química, Física, Matemáticas, Estadística Aplicada, Biotecnología, Microbiología, Astronomía.'),
('04', 'Ciencias Sociales y Humanidades',
 'Derecho, Psicología, Sociología, Historia, Filosofía',
 'Derecho, Psicología Organizacional/Educativa, Sociología, Historia, Filosofía, Antropología, Arqueología, Trabajo Social, Ciencias Políticas, Relaciones Internacionales.'),
('05', 'Ciencias Económicas y Empresariales',
 'Administración, Contabilidad, Economía, Marketing',
 'Administración de Empresas, Contabilidad y Finanzas, Economía, Marketing y Publicidad Comercial, Negocios Internacionales, Gestión Pública, Comercio Exterior, Banca y Seguros.'),
('06', 'Comunicación, Arte y Diseño',
 'Periodismo, Publicidad, Diseño Gráfico, Audiovisuales, Arquitectura',
 'Ciencias de la Comunicación, Publicidad, Diseño Gráfico Digital, Producción Audiovisual, Cine y Televisión, Animación Digital, Artes Plásticas, Fotografía, Música, Diseño de Interiores.'),
('07', 'Educación y Pedagogía',
 'Educación Inicial, Primaria, Secundaria, Educación Física',
 'Educación Inicial, Educación Primaria, Educación Secundaria (en diversas especialidades), Educación Física, Educación Especial, Psicopedagogía, Docencia de Idiomas.'),
('08', 'Ciencias Agrarias y Ambientales',
 'Agronomía, Veterinaria, Ing. Ambiental, Zootecnia',
 'Ingeniería Agronómica, Medicina Veterinaria y Zootecnia, Ingeniería Ambiental, Ingeniería Forestal, Ingeniería Agroindustrial, Ingeniería Pesquera, Acuicultura.'),
('09', 'Fuerzas Armadas y Orden',
 'Carrera militar, Policía, Bomberos',
 'Escuela de Oficiales/Suboficiales de la Policía Nacional del Perú (PNP), Escuela Naval (Marina de Guerra), Escuela Militar de Chorrillos (Ejército), FAP (Fuerza Aérea), Cuerpo General de Bomberos.'),
('10', 'Oficios Técnicos y Tecnológicos',
 'Mecánica automotriz, Gastronomía, Electricidad, Computación técnica',
 'Mecánica Automotriz, Electricidad Industrial, Gastronomía y Arte Culinario, Computación e Informática Técnica, Redes y Conectividad, Soldadura y Construcciones Metálicas, Cosmetología.');

INSERT INTO secciones_cuestionario (id, numero, codigo, titulo, instruccion, suma_puntaje) VALUES
(1, 1, 'S1', 'SECCIÓN 1: RENDIMIENTO ACADÉMICO — AUTOEVALUACIÓN',
 'En esta sección evaluamos tu percepción personal sobre tus fortalezas y dificultades académicas.', TRUE),
(2, 2, 'S2', 'SECCIÓN 2: PERFIL PSICOMÉTRICO — CONDUCTUAL Y EMOCIONAL',
 'Esta sección evalúa cómo te sientes y reaccionas frente a situaciones de estudio y exámenes. No mide inteligencia ni conocimientos. Responde con qué frecuencia o grado te identificas (escala del 1 al 5).', FALSE),
(3, 3, 'S3', 'SECCIÓN 3: APTITUDES COGNITIVAS AUTOPERCIBIDAS',
 'Aquí deseamos conocer cómo percibes tus habilidades mentales cotidianas. Responde con sinceridad marcando del 1 al 5 según tu grado de identificación.', TRUE),
(4, 4, 'S4', 'SECCIÓN 4: PERSONALIDAD Y PREFERENCIAS VOCACIONALES — MODELO RIASEC',
 'Indica qué tanto te identificas con cada una de las siguientes afirmaciones (del 1 al 5). No pienses en lo que ''deberías'' responder, sino en lo que realmente disfrutas y sientes.', TRUE),
(5, 5, 'S5', 'SECCIÓN 5: INTERESES Y HOBBIES',
 'Esta sección explora tus intereses y actividades fuera del horario de clases. Responde considerando lo que haces o te gustaría hacer por agrado personal en tu tiempo libre.', TRUE),
(6, 6, 'S6', 'SECCIÓN 6: ENTORNO SOCIOECONÓMICO',
 'Estas preguntas nos ayudan a contextualizar tu entorno de aprendizaje. Recuerda que no existen respuestas buenas ni malas y que toda la información brindada es confidencial.', TRUE),
(7, 7, 'S7', 'SECCIÓN 7: VEREDICTO DEL EXPERTO — FICHA DE EVALUACIÓN PROFESIONAL',
 'AVISO IMPORTANTE: DE USO EXCLUSIVO PARA EL PSICÓLOGO EVALUADOR. Este apartado no debe ser completado por el estudiante.', FALSE);

-- Preguntas Sección 1 (P1.1 y P1.2 son de opción múltiple)
INSERT INTO preguntas (id, seccion_id, codigo, subgrupo_codigo, subgrupo_nombre, enunciado, tipo_respuesta, es_puntuable, es_indicador_apoyo, orden) VALUES
(1,  1, 'P1.1', NULL, NULL, '¿En cuál de las siguientes áreas consideras que aprendes con mayor facilidad?', 'opcion_multiple', TRUE, FALSE, 1),
(2,  1, 'P1.2', NULL, NULL, '¿Y en cuál de esas áreas sientes que tienes más dificultad?', 'opcion_multiple', TRUE, FALSE, 2),
(3,  1, 'P1.3', NULL, NULL, 'Me resulta fácil entender temas de Matemática cuando los estudio.', 'likert_1_5', TRUE, FALSE, 3),
(4,  1, 'P1.4', NULL, NULL, 'Me resulta fácil entender temas de Ciencias (Biología, Química, Física).', 'likert_1_5', TRUE, FALSE, 4),
(5,  1, 'P1.5', NULL, NULL, 'Me resulta fácil entender temas de Humanidades (Historia, Literatura, Filosofía).', 'likert_1_5', TRUE, FALSE, 5),
(6,  1, 'P1.6', NULL, NULL, 'Me resulta fácil expresarme a través del Arte (dibujo, música, teatro, danza).', 'likert_1_5', TRUE, FALSE, 6),
(7,  1, 'P1.7', NULL, NULL, 'En general, me considero un(a) estudiante dedicado(a) y organizado(a) con mis tareas.', 'likert_1_5', FALSE, TRUE, 7);

-- Preguntas Sección 2 (P2.1 - P2.9)
INSERT INTO preguntas (id, seccion_id, codigo, subgrupo_codigo, subgrupo_nombre, enunciado, tipo_respuesta, es_puntuable, es_indicador_apoyo, orden) VALUES
(8,  2, 'P2.1', '2A', '2A — Autoeficacia Académica', 'Confío en que puedo aprobar cualquier curso si me esfuerzo lo suficiente.', 'likert_1_5', FALSE, TRUE, 8),
(9,  2, 'P2.2', '2A', '2A — Autoeficacia Académica', 'Cuando me propongo una meta académica, creo que soy capaz de alcanzarla.', 'likert_1_5', FALSE, TRUE, 9),
(10, 2, 'P2.3', '2A', '2A — Autoeficacia Académica', 'Siento que mi esfuerzo personal influye más en mis notas que la suerte o el profesor.', 'likert_1_5', FALSE, TRUE, 10),
(11, 2, 'P2.4', '2B', '2B — Resiliencia frente a la Frustración Académica', 'Cuando saco una mala nota, me motivo a estudiar más en vez de rendirme.', 'likert_1_5', FALSE, TRUE, 11),
(12, 2, 'P2.5', '2B', '2B — Resiliencia frente a la Frustración Académica', 'Si un tema me cuesta mucho, busco otra forma de entenderlo (videos, preguntar, practicar).', 'likert_1_5', FALSE, TRUE, 12),
(13, 2, 'P2.6', '2B', '2B — Resiliencia frente a la Frustración Académica', 'Después de un fracaso académico, me recupero emocionalmente con relativa rapidez.', 'likert_1_5', FALSE, TRUE, 13),
(14, 2, 'P2.7', '2C', '2C — Tolerancia al Estrés bajo Presión', 'Puedo concentrarme bien en un examen aunque esté nervioso(a).', 'likert_1_5', FALSE, TRUE, 14),
(15, 2, 'P2.8', '2C', '2C — Tolerancia al Estrés bajo Presión', 'Cuando tengo varias tareas con fecha límite, logro organizarme sin sentirme abrumado(a).', 'likert_1_5', FALSE, TRUE, 15),
(16, 2, 'P2.9', '2C', '2C — Tolerancia al Estrés bajo Presión', 'Mantengo la calma cuando un trabajo se complica o no sale como esperaba.', 'likert_1_5', FALSE, TRUE, 16);

-- Preguntas Sección 3 (P3.1 - P3.9)
INSERT INTO preguntas (id, seccion_id, codigo, subgrupo_codigo, subgrupo_nombre, enunciado, tipo_respuesta, es_puntuable, es_indicador_apoyo, orden) VALUES
(17, 3, 'P3.1', '3A', '3A — Razonamiento Lógico-Matemático', 'Me resulta natural resolver problemas que requieren pasos lógicos o cálculos.', 'likert_1_5', TRUE, FALSE, 17),
(18, 3, 'P3.2', '3A', '3A — Razonamiento Lógico-Matemático', 'Disfruto encontrar patrones o secuencias en números o figuras.', 'likert_1_5', TRUE, FALSE, 18),
(19, 3, 'P3.3', '3A', '3A — Razonamiento Lógico-Matemático', 'Se me facilita analizar datos y sacar conclusiones a partir de ellos.', 'likert_1_5', TRUE, FALSE, 19),
(20, 3, 'P3.4', '3B', '3B — Comprensión y Fluidez Verbal', 'Puedo explicar ideas complejas con mis propias palabras de forma clara.', 'likert_1_5', TRUE, FALSE, 20),
(21, 3, 'P3.5', '3B', '3B — Comprensión y Fluidez Verbal', 'Cuando leo un texto largo, entiendo su mensaje principal sin dificultad.', 'likert_1_5', TRUE, FALSE, 21),
(22, 3, 'P3.6', '3B', '3B — Comprensión y Fluidez Verbal', 'Me siento cómodo(a) expresándome en público o escribiendo ensayos.', 'likert_1_5', TRUE, FALSE, 22),
(23, 3, 'P3.7', '3C', '3C — Abstracción y Razonamiento Espacial/Visual', 'Puedo imaginar objetos en 3D o rotarlos mentalmente sin dificultad.', 'likert_1_5', TRUE, FALSE, 23),
(24, 3, 'P3.8', '3C', '3C — Abstracción y Razonamiento Espacial/Visual', 'Se me facilita leer mapas, planos o diagramas y entender lo que representan.', 'likert_1_5', TRUE, FALSE, 24),
(25, 3, 'P3.9', '3C', '3C — Abstracción y Razonamiento Espacial/Visual', 'Me resulta sencillo pensar en conceptos abstractos (ej. teorías o modelos).', 'likert_1_5', TRUE, FALSE, 25);

-- Preguntas Sección 4 — Modelo RIASEC (P4.1 - P4.18)
INSERT INTO preguntas (id, seccion_id, codigo, subgrupo_codigo, subgrupo_nombre, enunciado, tipo_respuesta, es_puntuable, es_indicador_apoyo, orden) VALUES
(26, 4, 'P4.1',  'R', 'R — Dimensión Realista (Orientación práctica, manual y técnica)', 'Disfruto armar, reparar o construir cosas con mis manos (aparatos, maquetas, circuitos).', 'likert_1_5', TRUE, FALSE, 26),
(27, 4, 'P4.2',  'R', 'R — Dimensión Realista (Orientación práctica, manual y técnica)', 'Prefiero las actividades al aire libre o que impliquen esfuerzo físico.', 'likert_1_5', TRUE, FALSE, 27),
(28, 4, 'P4.3',  'R', 'R — Dimensión Realista (Orientación práctica, manual y técnica)', 'Me gusta usar herramientas, máquinas o equipos en vez de solo leer o escribir.', 'likert_1_5', TRUE, FALSE, 28),
(29, 4, 'P4.4',  'I', 'I — Dimensión Investigadora (Orientación científica y analítica)', 'Me llama la atención investigar por qué ocurren las cosas (fenómenos, experimentos).', 'likert_1_5', TRUE, FALSE, 29),
(30, 4, 'P4.5',  'I', 'I — Dimensión Investigadora (Orientación científica y analítica)', 'Disfruto buscar información a fondo sobre temas que me interesan.', 'likert_1_5', TRUE, FALSE, 30),
(31, 4, 'P4.6',  'I', 'I — Dimensión Investigadora (Orientación científica y analítica)', 'Me considero una persona curiosa que siempre quiere entender el "por qué" de las cosas.', 'likert_1_5', TRUE, FALSE, 31),
(32, 4, 'P4.7',  'A', 'A — Dimensión Artística (Orientación creativa y expresiva)', 'Me gusta crear cosas originales (dibujar, escribir historias, componer música, diseñar).', 'likert_1_5', TRUE, FALSE, 32),
(33, 4, 'P4.8',  'A', 'A — Dimensión Artística (Orientación creativa y expresiva)', 'Valoro la estética y la belleza en las cosas que me rodean.', 'likert_1_5', TRUE, FALSE, 33),
(34, 4, 'P4.9',  'A', 'A — Dimensión Artística (Orientación creativa y expresiva)', 'Me siento más cómodo(a) en ambientes donde puedo expresarme libremente sin reglas rígidas.', 'likert_1_5', TRUE, FALSE, 34),
(35, 4, 'P4.10', 'S', 'S — Dimensión Social (Orientación de ayuda, docencia y servicio)', 'Me motiva ayudar a los demás a resolver sus problemas o a aprender algo nuevo.', 'likert_1_5', TRUE, FALSE, 35),
(36, 4, 'P4.11', 'S', 'S — Dimensión Social (Orientación de ayuda, docencia y servicio)', 'Me llevo bien con diferentes tipos de personas y me gusta trabajar en equipo.', 'likert_1_5', TRUE, FALSE, 36),
(37, 4, 'P4.12', 'S', 'S — Dimensión Social (Orientación de ayuda, docencia y servicio)', 'Me interesa participar en actividades de voluntariado o apoyo comunitario.', 'likert_1_5', TRUE, FALSE, 37),
(38, 4, 'P4.13', 'E', 'E — Dimensión Emprendedora (Orientación de liderazgo, negocios y persuasión)', 'Me gusta liderar proyectos o grupos y tomar decisiones importantes.', 'likert_1_5', TRUE, FALSE, 38),
(39, 4, 'P4.14', 'E', 'E — Dimensión Emprendedora (Orientación de liderazgo, negocios y persuasión)', 'Me atrae la idea de crear mi propio negocio o emprendimiento algún día.', 'likert_1_5', TRUE, FALSE, 39),
(40, 4, 'P4.15', 'E', 'E — Dimensión Emprendedora (Orientación de liderazgo, negocios y persuasión)', 'Soy bueno(a) convenciendo o motivando a otros para lograr un objetivo.', 'likert_1_5', TRUE, FALSE, 40),
(41, 4, 'P4.16', 'C', 'C — Dimensión Convencional (Orientación metódica, organizativa y de control)', 'Me siento cómodo(a) realizando tareas que siguen instrucciones claras y un orden definido.', 'likert_1_5', TRUE, FALSE, 41),
(42, 4, 'P4.17', 'C', 'C — Dimensión Convencional (Orientación metódica, organizativa y de control)', 'Disfruto organizar información: clasificar archivos, hacer listas, completar formularios.', 'likert_1_5', TRUE, FALSE, 42),
(43, 4, 'P4.18', 'C', 'C — Dimensión Convencional (Orientación metódica, organizativa y de control)', 'Me gusta que las cosas estén bien estructuradas y sin ambigüedades.', 'likert_1_5', TRUE, FALSE, 43);

-- Preguntas Sección 5 (P5.1 - P5.4)
INSERT INTO preguntas (id, seccion_id, codigo, subgrupo_codigo, subgrupo_nombre, enunciado, tipo_respuesta, es_puntuable, es_indicador_apoyo, orden) VALUES
(44, 5, 'P5.1', NULL, NULL, '¿Cuál de las siguientes actividades disfrutas más en tu tiempo libre?', 'opcion_unica', TRUE, FALSE, 44),
(45, 5, 'P5.2', NULL, NULL, '¿Cuál de estos temas te llama más la atención para curiosear, leer o aprender por tu cuenta en tu tiempo libre?', 'opcion_unica', TRUE, FALSE, 45),
(46, 5, 'P5.3', NULL, NULL, 'Si en el colegio te dieran libertad total para realizar un proyecto grupal de fin de año, ¿cuál preferirías hacer?', 'opcion_unica', TRUE, FALSE, 46),
(47, 5, 'P5.4', NULL, NULL, '¿Cuántas horas a la semana dedicas aproximadamente a actividades extracurriculares? (deportes, academias, talleres, hobbies)', 'opcion_unica', FALSE, TRUE, 47);

-- Preguntas Sección 6 (P6.1 - P6.6)
INSERT INTO preguntas (id, seccion_id, codigo, subgrupo_codigo, subgrupo_nombre, enunciado, tipo_respuesta, es_puntuable, es_indicador_apoyo, orden) VALUES
(48, 6, 'P6.1', NULL, NULL, '¿Cuál es el nivel educativo más alto alcanzado por tu madre o tutora?', 'opcion_unica', FALSE, TRUE, 48),
(49, 6, 'P6.2', NULL, NULL, '¿Cuál es el nivel educativo más alto alcanzado por tu padre o tutor?', 'opcion_unica', FALSE, TRUE, 49),
(50, 6, 'P6.3', NULL, NULL, '¿Cuentas con acceso a internet en tu hogar?', 'opcion_unica', FALSE, TRUE, 50),
(51, 6, 'P6.4', NULL, NULL, '¿Dispones de una computadora o laptop de uso personal para tus estudios?', 'opcion_unica', FALSE, TRUE, 51),
(52, 6, 'P6.5', NULL, NULL, 'Al terminar el colegio, ¿cuál es tu plan principal?', 'opcion_unica', FALSE, TRUE, 52),
(53, 6, 'P6.6', NULL, NULL, 'Si piensas estudiar, ¿qué tipo de institución prefieres?', 'opcion_unica', TRUE, TRUE, 53);

-- Opciones de respuesta
INSERT INTO opciones_pregunta (pregunta_id, codigo_opcion, texto_opcion, orden)
SELECT p.id, opt.codigo, opt.texto, opt.ord
FROM preguntas p
CROSS JOIN (VALUES
    ('a', 'Arte y Cultura', 1),
    ('b', 'Castellano como Segunda Lengua', 2),
    ('c', 'Ciencias Sociales', 3),
    ('d', 'Ciencia y Tecnología', 4),
    ('e', 'Comunicación', 5),
    ('f', 'Desarrollo Personal, Ciudadanía y Cívica', 6),
    ('g', 'Educación Física', 7),
    ('h', 'Educación Para el Trabajo', 8),
    ('i', 'Educación Religiosa', 9),
    ('j', 'Inglés', 10),
    ('k', 'Matemática', 11)
) AS opt(codigo, texto, ord)
WHERE p.codigo IN ('P1.1', 'P1.2');

INSERT INTO opciones_pregunta (pregunta_id, codigo_opcion, texto_opcion, orden) VALUES
(44, 'a', 'Deportes, trabajos manuales, mecánica, jardinería o cocina', 1),
(44, 'b', 'Leer sobre ciencia, ver documentales, experimentar o programar', 2),
(44, 'c', 'Dibujar, pintar, tocar música, escribir, fotografía o diseño', 3),
(44, 'd', 'Hacer voluntariado, enseñar a otros, participar en grupos sociales', 4),
(44, 'e', 'Vender cosas, organizar eventos, crear contenido en redes sociales', 5),
(44, 'f', 'Organizar mis cosas, llevar cuentas, coleccionar, crear bases de datos', 6),

(45, 'a', 'Cómo funcionan o se arreglan las cosas prácticas: máquinas, motores, herramientas o la naturaleza', 1),
(45, 'b', 'La ciencia y los nuevos descubrimientos: tecnología, experimentos, la salud del cuerpo o el espacio', 2),
(45, 'c', 'El arte y la creatividad: música, dibujo, creación de videos, historias, diseño o fotos', 3),
(45, 'd', 'Las personas y la ayuda social: cómo pensamos y sentimos, la educación o apoyar a quienes lo necesitan', 4),
(45, 'e', 'Los negocios y las ventas: cómo crear una marca propia, hacer publicidad por internet o dirigir un grupo', 5),
(45, 'f', 'El orden y las cuentas: cómo administrar el dinero, ordenar documentos o clasificar información en la computadora', 6),

(46, 'a', 'Diseñar y construir una maqueta práctica, un modelo a escala o un invento usando herramientas y materiales reales', 1),
(46, 'b', 'Realizar un experimento de ciencias y explicar paso a paso lo que descubriste y cómo sucedió', 2),
(46, 'c', 'Grabar un video o película corta, pintar un mural en el colegio o preparar una presentación de teatro o música', 3),
(46, 'd', 'Organizar una campaña de ayuda solidaria, una colecta o una actividad para apoyar a personas de la comunidad', 4),
(46, 'e', 'Organizar una feria escolar de venta de productos o comida preparados por ustedes para generar ganancias', 5),
(46, 'f', 'Poner en orden los libros de la biblioteca del colegio o elaborar un inventario detallado de los materiales del aula', 6),

(47, 'a', 'Menos de 2 horas', 1),
(47, 'b', 'De 2 a 5 horas', 2),
(47, 'c', 'De 6 a 10 horas', 3),
(47, 'd', 'Más de 10 horas', 4);

INSERT INTO opciones_pregunta (pregunta_id, codigo_opcion, texto_opcion, orden)
SELECT p.id, opt.codigo, opt.texto, opt.ord
FROM preguntas p
CROSS JOIN (VALUES
    ('a', 'Primaria incompleta o completa', 1),
    ('b', 'Secundaria incompleta o completa', 2),
    ('c', 'Técnico / Instituto superior', 3),
    ('d', 'Universidad completa (Bachiller o Licenciatura)', 4),
    ('e', 'Posgrado (Maestría o Doctorado)', 5),
    ('f', 'No lo sé', 6)
) AS opt(codigo, texto, ord)
WHERE p.codigo IN ('P6.1', 'P6.2');

INSERT INTO opciones_pregunta (pregunta_id, codigo_opcion, texto_opcion, orden) VALUES
(50, 'a', 'Sí, conexión fija (WiFi / cable de fibra)', 1),
(50, 'b', 'Sí, únicamente mediante datos móviles (plan de celular)', 2),
(50, 'c', 'No cuento con acceso a internet en casa', 3),

(51, 'a', 'Sí, de uso exclusivo para mí', 1),
(51, 'b', 'Sí, pero la comparto con otros miembros de mi familia', 2),
(51, 'c', 'No, utilizo la de una cabina de internet, biblioteca u otro lugar', 3),
(51, 'd', 'No dispongo de computadora ni laptop', 4),

(52, 'a', 'Estudiar una carrera a tiempo completo (universidad o instituto)', 1),
(52, 'b', 'Estudiar y trabajar al mismo tiempo', 2),
(52, 'c', 'Trabajar a tiempo completo', 3),
(52, 'd', 'Tomarme un tiempo (año sabático) para decidir mi vocación', 4),
(52, 'e', 'Aún no lo tengo claro', 5),

(53, 'a', 'Universidad pública', 1),
(53, 'b', 'Universidad privada', 2),
(53, 'c', 'Instituto técnico / tecnológico superior', 3),
(53, 'd', 'Escuela militar / policial', 4),
(53, 'e', 'Aún no lo decido', 5);

-- =============================================================================
-- REGLAS DE PUNTUACIÓN SEGÚN PLANTILLA DE CORRECCIÓN
-- =============================================================================

-- Paso 2: P1.1 (+1 por cada opción marcada) y P1.2 (-1 por cada opción marcada)
INSERT INTO reglas_puntuacion (pregunta_id, codigo_opcion, area_codigo, tipo_calculo, peso_puntos, descripcion)
SELECT p.id, m.opcion, m.area, 'fijo', CASE WHEN p.codigo = 'P1.1' THEN 1 ELSE -1 END,
       CASE WHEN p.codigo = 'P1.1' THEN 'P1.1 Facilidad (+1)' ELSE 'P1.2 Dificultad (-1)' END
FROM preguntas p
CROSS JOIN (VALUES
    ('a', '06'),
    ('b', '04'), ('b', '07'),
    ('c', '04'), ('c', '05'),
    ('d', '01'), ('d', '02'), ('d', '03'), ('d', '08'),
    ('e', '04'), ('e', '06'),
    ('f', '04'), ('f', '07'),
    ('g', '09'), ('g', '01'),
    ('h', '02'), ('h', '05'), ('h', '10'),
    ('i', '04'), ('i', '07'),
    ('j', '04'), ('j', '06'), ('j', '05'),
    ('k', '02'), ('k', '03'), ('k', '05')
) AS m(opcion, area)
WHERE p.codigo IN ('P1.1', 'P1.2');

-- Paso 2: P1.3 a P1.6 (valor directo 1-5)
INSERT INTO reglas_puntuacion (pregunta_id, codigo_opcion, area_codigo, tipo_calculo, peso_puntos, descripcion) VALUES
(3, NULL, '02', 'likert_directo', 1, 'P1.3 Matemática -> Área 02'),
(3, NULL, '03', 'likert_directo', 1, 'P1.3 Matemática -> Área 03'),
(3, NULL, '05', 'likert_directo', 1, 'P1.3 Matemática -> Área 05'),
(4, NULL, '01', 'likert_directo', 1, 'P1.4 Ciencias -> Área 01'),
(4, NULL, '03', 'likert_directo', 1, 'P1.4 Ciencias -> Área 03'),
(4, NULL, '08', 'likert_directo', 1, 'P1.4 Ciencias -> Área 08'),
(5, NULL, '04', 'likert_directo', 1, 'P1.5 Humanidades -> Área 04'),
(5, NULL, '07', 'likert_directo', 1, 'P1.5 Humanidades -> Área 07'),
(6, NULL, '06', 'likert_directo', 1, 'P1.6 Arte -> Área 06');

-- Paso 4: Sección 3 — Aptitudes Cognitivas (3A, 3B, 3C)
INSERT INTO reglas_puntuacion (pregunta_id, codigo_opcion, area_codigo, tipo_calculo, peso_puntos, descripcion)
SELECT id, NULL, area, 'likert_directo', 1, 'S3 3A Lógico-Matemático'
FROM preguntas CROSS JOIN (VALUES ('02'), ('03'), ('05')) AS a(area)
WHERE subgrupo_codigo = '3A';

INSERT INTO reglas_puntuacion (pregunta_id, codigo_opcion, area_codigo, tipo_calculo, peso_puntos, descripcion)
SELECT id, NULL, area, 'likert_directo', 1, 'S3 3B Comprensión Verbal'
FROM preguntas CROSS JOIN (VALUES ('04'), ('06'), ('07')) AS a(area)
WHERE subgrupo_codigo = '3B';

INSERT INTO reglas_puntuacion (pregunta_id, codigo_opcion, area_codigo, tipo_calculo, peso_puntos, descripcion)
SELECT id, NULL, area, 'likert_directo', 1, 'S3 3C Espacial/Visual'
FROM preguntas CROSS JOIN (VALUES ('02'), ('06'), ('08')) AS a(area)
WHERE subgrupo_codigo = '3C';

-- Paso 5: Sección 4 — Personalidad RIASEC
INSERT INTO reglas_puntuacion (pregunta_id, codigo_opcion, area_codigo, tipo_calculo, peso_puntos, descripcion)
SELECT id, NULL, area, 'likert_directo', 1, 'S4 R Realista'
FROM preguntas CROSS JOIN (VALUES ('02'), ('08'), ('09'), ('10')) AS a(area)
WHERE subgrupo_codigo = 'R';

INSERT INTO reglas_puntuacion (pregunta_id, codigo_opcion, area_codigo, tipo_calculo, peso_puntos, descripcion)
SELECT id, NULL, area, 'likert_directo', 1, 'S4 I Investigador'
FROM preguntas CROSS JOIN (VALUES ('01'), ('02'), ('03')) AS a(area)
WHERE subgrupo_codigo = 'I';

INSERT INTO reglas_puntuacion (pregunta_id, codigo_opcion, area_codigo, tipo_calculo, peso_puntos, descripcion)
SELECT id, NULL, '06', 'likert_directo', 1, 'S4 A Artístico'
FROM preguntas WHERE subgrupo_codigo = 'A';

INSERT INTO reglas_puntuacion (pregunta_id, codigo_opcion, area_codigo, tipo_calculo, peso_puntos, descripcion)
SELECT id, NULL, area, 'likert_directo', 1, 'S4 S Social'
FROM preguntas CROSS JOIN (VALUES ('01'), ('04'), ('07')) AS a(area)
WHERE subgrupo_codigo = 'S';

INSERT INTO reglas_puntuacion (pregunta_id, codigo_opcion, area_codigo, tipo_calculo, peso_puntos, descripcion)
SELECT id, NULL, area, 'likert_directo', 1, 'S4 E Emprendedor'
FROM preguntas CROSS JOIN (VALUES ('05'), ('06')) AS a(area)
WHERE subgrupo_codigo = 'E';

INSERT INTO reglas_puntuacion (pregunta_id, codigo_opcion, area_codigo, tipo_calculo, peso_puntos, descripcion)
SELECT id, NULL, area, 'likert_directo', 1, 'S4 C Convencional'
FROM preguntas CROSS JOIN (VALUES ('05'), ('07'), ('09')) AS a(area)
WHERE subgrupo_codigo = 'C';

-- Paso 6: Sección 5 — Intereses y Hobbies (+3 puntos en P5.1, P5.2, P5.3)
INSERT INTO reglas_puntuacion (pregunta_id, codigo_opcion, area_codigo, tipo_calculo, peso_puntos, descripcion) VALUES
(44, 'a', '02', 'fijo', 3, 'P5.1 a -> +3'), (44, 'a', '08', 'fijo', 3, 'P5.1 a -> +3'), (44, 'a', '09', 'fijo', 3, 'P5.1 a -> +3'), (44, 'a', '10', 'fijo', 3, 'P5.1 a -> +3'),
(44, 'b', '01', 'fijo', 3, 'P5.1 b -> +3'), (44, 'b', '02', 'fijo', 3, 'P5.1 b -> +3'), (44, 'b', '03', 'fijo', 3, 'P5.1 b -> +3'),
(44, 'c', '06', 'fijo', 3, 'P5.1 c -> +3'),
(44, 'd', '01', 'fijo', 3, 'P5.1 d -> +3'), (44, 'd', '04', 'fijo', 3, 'P5.1 d -> +3'), (44, 'd', '07', 'fijo', 3, 'P5.1 d -> +3'),
(44, 'e', '05', 'fijo', 3, 'P5.1 e -> +3'), (44, 'e', '06', 'fijo', 3, 'P5.1 e -> +3'),
(44, 'f', '05', 'fijo', 3, 'P5.1 f -> +3'), (44, 'f', '07', 'fijo', 3, 'P5.1 f -> +3'),

(45, 'a', '02', 'fijo', 3, 'P5.2 a -> +3'), (45, 'a', '08', 'fijo', 3, 'P5.2 a -> +3'), (45, 'a', '10', 'fijo', 3, 'P5.2 a -> +3'),
(45, 'b', '01', 'fijo', 3, 'P5.2 b -> +3'), (45, 'b', '02', 'fijo', 3, 'P5.2 b -> +3'), (45, 'b', '03', 'fijo', 3, 'P5.2 b -> +3'),
(45, 'c', '06', 'fijo', 3, 'P5.2 c -> +3'),
(45, 'd', '01', 'fijo', 3, 'P5.2 d -> +3'), (45, 'd', '04', 'fijo', 3, 'P5.2 d -> +3'), (45, 'd', '07', 'fijo', 3, 'P5.2 d -> +3'),
(45, 'e', '05', 'fijo', 3, 'P5.2 e -> +3'), (45, 'e', '06', 'fijo', 3, 'P5.2 e -> +3'),
(45, 'f', '05', 'fijo', 3, 'P5.2 f -> +3'), (45, 'f', '07', 'fijo', 3, 'P5.2 f -> +3'),

(46, 'a', '02', 'fijo', 3, 'P5.3 a -> +3'), (46, 'a', '08', 'fijo', 3, 'P5.3 a -> +3'), (46, 'a', '10', 'fijo', 3, 'P5.3 a -> +3'),
(46, 'b', '01', 'fijo', 3, 'P5.3 b -> +3'), (46, 'b', '03', 'fijo', 3, 'P5.3 b -> +3'),
(46, 'c', '06', 'fijo', 3, 'P5.3 c -> +3'),
(46, 'd', '04', 'fijo', 3, 'P5.3 d -> +3'), (46, 'd', '07', 'fijo', 3, 'P5.3 d -> +3'),
(46, 'e', '05', 'fijo', 3, 'P5.3 e -> +3'),
(46, 'f', '05', 'fijo', 3, 'P5.3 f -> +3'), (46, 'f', '07', 'fijo', 3, 'P5.3 f -> +3');

-- Paso 7: Sección 6 — Excepción P6.6 = 'd' (+2 Área 09)
INSERT INTO reglas_puntuacion (pregunta_id, codigo_opcion, area_codigo, tipo_calculo, peso_puntos, descripcion) VALUES
(53, 'd', '09', 'fijo', 2, 'P6.6 d Escuela militar/policial -> +2 Área 09');

-- =============================================================================
-- 4. VISTAS SQL DE CORRECCIÓN Y ANÁLISIS PSICOPEDAGÓGICO
-- =============================================================================

CREATE OR REPLACE VIEW vw_resumen_seccion2_psicometrico AS
WITH s2 AS (
    SELECT
        e.id AS evaluacion_id,
        COALESCE(SUM(CASE WHEN p.subgrupo_codigo = '2A' THEN r.valor_likert END), 0) AS grupo_a_autoeficacia,
        COALESCE(SUM(CASE WHEN p.subgrupo_codigo = '2B' THEN r.valor_likert END), 0) AS grupo_b_resiliencia,
        COALESCE(SUM(CASE WHEN p.subgrupo_codigo = '2C' THEN r.valor_likert END), 0) AS grupo_c_estres,
        COALESCE(SUM(CASE WHEN p.seccion_id = 2 THEN r.valor_likert END), 0)       AS total_s2
    FROM evaluaciones e
    LEFT JOIN respuestas_cuestionario r ON r.evaluacion_id = e.id
    LEFT JOIN preguntas p ON p.id = r.pregunta_id AND p.seccion_id = 2
    GROUP BY e.id
)
SELECT
    evaluacion_id,
    grupo_a_autoeficacia,
    grupo_b_resiliencia,
    grupo_c_estres,
    total_s2,
    CASE
        WHEN total_s2 >= 36 THEN 'ALTO'
        WHEN total_s2 >= 27 THEN 'MEDIO'
        WHEN total_s2 >= 18 THEN 'BAJO'
        WHEN total_s2 >= 9  THEN 'MUY BAJO'
        ELSE 'INCOMPLETO'
    END AS nivel_psicometrico,
    CASE
        WHEN total_s2 >= 36 THEN 'Perfil emocional sólido. Puede afrontar carreras de alta exigencia académica sin problema.'
        WHEN total_s2 >= 27 THEN 'Nivel normal y adecuado. Sin dificultades emocionales relevantes.'
        WHEN total_s2 >= 18 THEN 'Suele abrumarse ante exámenes. Puede requerir acompañamiento o tutoría vocacional.'
        WHEN total_s2 >= 9  THEN 'Alerta psicopedagógica. Priorizar apoyo socioemocional escolar antes de la decisión final.'
        ELSE 'Faltan respuestas en Sección 2.'
    END AS interpretacion_s2
FROM s2;

CREATE OR REPLACE VIEW vw_puntajes_cognitivos_s3 AS
SELECT
    e.id AS evaluacion_id,
    COALESCE(SUM(CASE WHEN p.subgrupo_codigo = '3A' THEN r.valor_likert END), 0) AS puntaje_3a_logico_matematico,
    COALESCE(SUM(CASE WHEN p.subgrupo_codigo = '3B' THEN r.valor_likert END), 0) AS puntaje_3b_comprension_verbal,
    COALESCE(SUM(CASE WHEN p.subgrupo_codigo = '3C' THEN r.valor_likert END), 0) AS puntaje_3c_espacial_visual
FROM evaluaciones e
LEFT JOIN respuestas_cuestionario r ON r.evaluacion_id = e.id
LEFT JOIN preguntas p ON p.id = r.pregunta_id AND p.seccion_id = 3
GROUP BY e.id;

CREATE OR REPLACE VIEW vw_puntajes_riasec_s4 AS
SELECT
    e.id AS evaluacion_id,
    COALESCE(SUM(CASE WHEN p.subgrupo_codigo = 'R' THEN r.valor_likert END), 0) AS puntaje_r_realista,
    COALESCE(SUM(CASE WHEN p.subgrupo_codigo = 'I' THEN r.valor_likert END), 0) AS puntaje_i_investigador,
    COALESCE(SUM(CASE WHEN p.subgrupo_codigo = 'A' THEN r.valor_likert END), 0) AS puntaje_a_artistico,
    COALESCE(SUM(CASE WHEN p.subgrupo_codigo = 'S' THEN r.valor_likert END), 0) AS puntaje_s_social,
    COALESCE(SUM(CASE WHEN p.subgrupo_codigo = 'E' THEN r.valor_likert END), 0) AS puntaje_e_emprendedor,
    COALESCE(SUM(CASE WHEN p.subgrupo_codigo = 'C' THEN r.valor_likert END), 0) AS puntaje_c_convencional
FROM evaluaciones e
LEFT JOIN respuestas_cuestionario r ON r.evaluacion_id = e.id
LEFT JOIN preguntas p ON p.id = r.pregunta_id AND p.seccion_id = 4
GROUP BY e.id;

CREATE OR REPLACE VIEW vw_indicadores_apoyo AS
SELECT
    e.id AS evaluacion_id,
    MAX(CASE WHEN p.codigo = 'P1.7' THEN r.valor_likert END) AS p1_7_dedicacion,
    CASE
        WHEN MAX(CASE WHEN p.codigo = 'P1.7' THEN r.valor_likert END) >= 4
            THEN 'Organizado y dedicado (perfil sólido)'
        WHEN MAX(CASE WHEN p.codigo = 'P1.7' THEN r.valor_likert END) = 3
            THEN 'Dedicación moderada'
        WHEN MAX(CASE WHEN p.codigo = 'P1.7' THEN r.valor_likert END) IN (1, 2)
            THEN 'Posible potencial desaprovechado o dificultad de estudio (anotar en observaciones)'
        ELSE NULL
    END AS p1_7_interpretacion,
    MAX(CASE WHEN p.codigo = 'P5.4' THEN r.codigo_opcion END) AS p5_4_opcion,
    CASE MAX(CASE WHEN p.codigo = 'P5.4' THEN r.codigo_opcion END)
        WHEN 'a' THEN 'Menos de 2 h: Poca exploración de intereses (perfil en desarrollo)'
        WHEN 'b' THEN '2 a 5 h: Nivel estándar de dedicación'
        WHEN 'c' THEN '6 a 10 h: Alto compromiso e intereses definidos'
        WHEN 'd' THEN 'Más de 10 h: Muy alta dedicación y vocación temprana'
        ELSE NULL
    END AS p5_4_interpretacion,
    MAX(CASE WHEN p.codigo = 'P6.3' THEN r.codigo_opcion END) AS p6_3_internet,
    MAX(CASE WHEN p.codigo = 'P6.4' THEN r.codigo_opcion END) AS p6_4_computadora,
    MAX(CASE WHEN p.codigo = 'P6.5' THEN r.codigo_opcion END) AS p6_5_plan_principal,
    MAX(CASE WHEN p.codigo = 'P6.6' THEN r.codigo_opcion END) AS p6_6_tipo_institucion
FROM evaluaciones e
LEFT JOIN respuestas_cuestionario r ON r.evaluacion_id = e.id
LEFT JOIN preguntas p
       ON p.id = r.pregunta_id
      AND p.codigo IN ('P1.7', 'P5.4', 'P6.3', 'P6.4', 'P6.5', 'P6.6')
GROUP BY e.id;

-- Consolidación de puntajes por área (soporta respuestas múltiples en P1.1 y P1.2)
CREATE OR REPLACE VIEW vw_consolidado_puntajes_area AS
WITH puntajes_detalle AS (
    SELECT
        e.id AS evaluacion_id,
        av.codigo AS area_codigo,
        av.nombre AS area_nombre,
        COALESCE(SUM(CASE
            WHEN p.seccion_id = 1 THEN
                CASE WHEN rp.tipo_calculo = 'fijo' THEN rp.peso_puntos
                     ELSE r.valor_likert * rp.peso_puntos
                END
            ELSE 0
        END), 0) AS ptos_s1,
        COALESCE(SUM(CASE
            WHEN p.seccion_id = 3 THEN r.valor_likert * rp.peso_puntos
            ELSE 0
        END), 0) AS ptos_s3,
        COALESCE(SUM(CASE
            WHEN p.seccion_id = 4 THEN r.valor_likert * rp.peso_puntos
            ELSE 0
        END), 0) AS ptos_s4,
        COALESCE(SUM(CASE
            WHEN p.seccion_id = 5 THEN rp.peso_puntos
            ELSE 0
        END), 0) AS ptos_s5,
        COALESCE(SUM(CASE
            WHEN p.seccion_id = 6 THEN rp.peso_puntos
            ELSE 0
        END), 0) AS bonus_s6
    FROM evaluaciones e
    CROSS JOIN areas_vocacionales av
    LEFT JOIN respuestas_cuestionario r ON r.evaluacion_id = e.id
    LEFT JOIN preguntas p ON p.id = r.pregunta_id
    LEFT JOIN reglas_puntuacion rp
        ON rp.pregunta_id = r.pregunta_id
       AND rp.area_codigo = av.codigo
       AND (
           (rp.tipo_calculo = 'fijo' AND rp.codigo_opcion = r.codigo_opcion)
           OR
           (rp.tipo_calculo = 'likert_directo' AND r.valor_likert IS NOT NULL)
       )
    GROUP BY e.id, av.codigo, av.nombre
),
con_totales AS (
    SELECT
        pd.*,
        (pd.ptos_s1 + pd.ptos_s3 + pd.ptos_s4 + pd.ptos_s5 + pd.bonus_s6) AS total_area,
        ia.p6_5_plan_principal,
        ia.p6_6_tipo_institucion
    FROM puntajes_detalle pd
    LEFT JOIN vw_indicadores_apoyo ia ON ia.evaluacion_id = pd.evaluacion_id
)
SELECT
    evaluacion_id,
    area_codigo,
    area_nombre,
    ptos_s1,
    ptos_s3,
    ptos_s4,
    ptos_s5,
    bonus_s6,
    total_area,
    COALESCE(
        ROUND(
            GREATEST(total_area, 0) * 100.0
            / NULLIF(SUM(GREATEST(total_area, 0)) OVER (PARTITION BY evaluacion_id), 0),
            2
        ),
        0.00
    ) AS porcentaje_orientacion,
    ROW_NUMBER() OVER (
        PARTITION BY evaluacion_id
        ORDER BY
            total_area DESC,
            CASE
                WHEN (p6_6_tipo_institucion = 'c' OR p6_5_plan_principal = 'c') AND area_codigo = '10' THEN 1
                WHEN p6_6_tipo_institucion = 'd' AND area_codigo = '09' THEN 1
                ELSE 0
            END DESC,
            ptos_s4 DESC,
            area_codigo ASC
    ) AS orden_prioridad,
    COUNT(*) OVER (PARTITION BY evaluacion_id, total_area) AS cantidad_empatadas_en_puntaje
FROM con_totales;

CREATE OR REPLACE VIEW vw_hoja_correccion_final AS
SELECT
    ev.id AS evaluacion_id,
    ev.fecha_aplicacion,
    ev.estado,
    est.nombres_apellidos AS estudiante,
    est.edad_opcion,
    est.edad_exacta,
    est.sexo,
    est.grado,
    est.seccion,
    p1.area_codigo AS primera_opcion_codigo,
    p1.area_nombre AS primera_opcion_nombre,
    p1.total_area  AS primera_opcion_puntaje,
    p1.porcentaje_orientacion AS primera_opcion_porcentaje,
    av1.carreras_afines AS carreras_recomendadas_primera_opcion,
    p2.area_codigo AS segunda_opcion_codigo,
    p2.area_nombre AS segunda_opcion_nombre,
    p2.total_area  AS segunda_opcion_puntaje,
    p2.porcentaje_orientacion AS segunda_opcion_porcentaje,
    (p1.total_area = p2.total_area AND p1.ptos_s4 = p2.ptos_s4) AS requiere_revision_empate_dual,
    s2.grupo_a_autoeficacia,
    s2.grupo_b_resiliencia,
    s2.grupo_c_estres,
    s2.total_s2,
    s2.nivel_psicometrico,
    s2.interpretacion_s2,
    s3.puntaje_3a_logico_matematico,
    s3.puntaje_3b_comprension_verbal,
    s3.puntaje_3c_espacial_visual,
    s4.puntaje_r_realista,
    s4.puntaje_i_investigador,
    s4.puntaje_a_artistico,
    s4.puntaje_s_social,
    s4.puntaje_e_emprendedor,
    s4.puntaje_c_convencional,
    ia.p1_7_dedicacion,
    ia.p1_7_interpretacion,
    ia.p5_4_opcion,
    ia.p5_4_interpretacion,
    ia.p6_3_internet,
    ia.p6_4_computadora,
    ia.p6_5_plan_principal,
    ia.p6_6_tipo_institucion,
    vp.psicologo_evaluador,
    vp.cpsp_numero,
    vp.fecha_evaluacion,
    vp.area_primera_opcion_codigo AS veredicto_psicologo_area_codigo,
    vp.es_vocacion_dual,
    vp.area_dual_codigo,
    vp.observaciones_psicopedagogicas
FROM evaluaciones ev
JOIN estudiantes est ON est.id = ev.estudiante_id
LEFT JOIN vw_consolidado_puntajes_area p1
       ON p1.evaluacion_id = ev.id AND p1.orden_prioridad = 1
LEFT JOIN vw_consolidado_puntajes_area p2
       ON p2.evaluacion_id = ev.id AND p2.orden_prioridad = 2
LEFT JOIN areas_vocacionales av1
       ON av1.codigo = p1.area_codigo
LEFT JOIN vw_resumen_seccion2_psicometrico s2
       ON s2.evaluacion_id = ev.id
LEFT JOIN vw_puntajes_cognitivos_s3 s3
       ON s3.evaluacion_id = ev.id
LEFT JOIN vw_puntajes_riasec_s4 s4
       ON s4.evaluacion_id = ev.id
LEFT JOIN vw_indicadores_apoyo ia
       ON ia.evaluacion_id = ev.id
LEFT JOIN veredictos_psicologo vp
       ON vp.evaluacion_id = ev.id;

-- =============================================================================
-- 5. FUNCIÓN DE EVALUACIÓN Y PERSISTENCIA EN BASE DE DATOS
-- =============================================================================

-- Evalúa las respuestas guardadas de `p_evaluacion_id` aplicando la Plantilla de
-- Corrección, almacena los resultados consolidados en `resultados_evaluacion` y
-- `resultados_detalle_area`, y actualiza el estado de la evaluación a 'evaluada'.
CREATE OR REPLACE FUNCTION fn_calcular_y_guardar_evaluacion(p_evaluacion_id BIGINT)
RETURNS TABLE (
    evaluacion_id          BIGINT,
    primera_opcion_codigo  CHAR(2),
    primera_opcion_puntaje INTEGER,
    segunda_opcion_codigo  CHAR(2),
    segunda_opcion_puntaje INTEGER,
    total_s2               SMALLINT,
    nivel_psicometrico     VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
BEGIN
    IF NOT EXISTS (SELECT 1 FROM evaluaciones e WHERE e.id = p_evaluacion_id) THEN
        RAISE EXCEPTION 'La evaluación % no existe.', p_evaluacion_id;
    END IF;

    -- 1. Persistir desglose de puntajes y porcentaje de orientación por las 10 áreas vocacionales
    INSERT INTO resultados_detalle_area (
        evaluacion_id, area_codigo, ptos_s1, ptos_s3, ptos_s4, ptos_s5, bonus_s6, total_area, porcentaje_orientacion, orden_prioridad
    )
    SELECT
        c.evaluacion_id, c.area_codigo, c.ptos_s1, c.ptos_s3, c.ptos_s4, c.ptos_s5, c.bonus_s6, c.total_area, c.porcentaje_orientacion, c.orden_prioridad
    FROM vw_consolidado_puntajes_area c
    WHERE c.evaluacion_id = p_evaluacion_id
    ON CONFLICT (evaluacion_id, area_codigo) DO UPDATE SET
        ptos_s1                = EXCLUDED.ptos_s1,
        ptos_s3                = EXCLUDED.ptos_s3,
        ptos_s4                = EXCLUDED.ptos_s4,
        ptos_s5                = EXCLUDED.ptos_s5,
        bonus_s6               = EXCLUDED.bonus_s6,
        total_area             = EXCLUDED.total_area,
        porcentaje_orientacion = EXCLUDED.porcentaje_orientacion,
        orden_prioridad        = EXCLUDED.orden_prioridad;

    -- 2. Persistir resumen integral de la evaluación
    INSERT INTO resultados_evaluacion (
        evaluacion_id,
        primera_opcion_codigo, primera_opcion_puntaje,
        segunda_opcion_codigo, segunda_opcion_puntaje,
        requiere_revision_empate_dual,
        grupo_a_autoeficacia, grupo_b_resiliencia, grupo_c_estres,
        total_s2, nivel_psicometrico, interpretacion_s2,
        puntaje_3a_logico_matematico, puntaje_3b_comprension_verbal, puntaje_3c_espacial_visual,
        puntaje_r_realista, puntaje_i_investigador, puntaje_a_artistico,
        puntaje_s_social, puntaje_e_emprendedor, puntaje_c_convencional,
        p1_7_dedicacion, p1_7_interpretacion,
        p5_4_opcion, p5_4_interpretacion,
        calculado_en
    )
    SELECT
        ev.id,
        p1.area_codigo, p1.total_area,
        p2.area_codigo, p2.total_area,
        (p1.total_area = p2.total_area AND p1.ptos_s4 = p2.ptos_s4),
        s2.grupo_a_autoeficacia, s2.grupo_b_resiliencia, s2.grupo_c_estres,
        s2.total_s2, s2.nivel_psicometrico, s2.interpretacion_s2,
        s3.puntaje_3a_logico_matematico, s3.puntaje_3b_comprension_verbal, s3.puntaje_3c_espacial_visual,
        s4.puntaje_r_realista, s4.puntaje_i_investigador, s4.puntaje_a_artistico,
        s4.puntaje_s_social, s4.puntaje_e_emprendedor, s4.puntaje_c_convencional,
        ia.p1_7_dedicacion, ia.p1_7_interpretacion,
        ia.p5_4_opcion, ia.p5_4_interpretacion,
        NOW()
    FROM evaluaciones ev
    JOIN vw_consolidado_puntajes_area p1 ON p1.evaluacion_id = ev.id AND p1.orden_prioridad = 1
    JOIN vw_consolidado_puntajes_area p2 ON p2.evaluacion_id = ev.id AND p2.orden_prioridad = 2
    JOIN vw_resumen_seccion2_psicometrico s2 ON s2.evaluacion_id = ev.id
    JOIN vw_puntajes_cognitivos_s3 s3 ON s3.evaluacion_id = ev.id
    JOIN vw_puntajes_riasec_s4 s4 ON s4.evaluacion_id = ev.id
    JOIN vw_indicadores_apoyo ia ON ia.evaluacion_id = ev.id
    WHERE ev.id = p_evaluacion_id
    ON CONFLICT (evaluacion_id) DO UPDATE SET
        primera_opcion_codigo         = EXCLUDED.primera_opcion_codigo,
        primera_opcion_puntaje        = EXCLUDED.primera_opcion_puntaje,
        segunda_opcion_codigo         = EXCLUDED.segunda_opcion_codigo,
        segunda_opcion_puntaje        = EXCLUDED.segunda_opcion_puntaje,
        requiere_revision_empate_dual = EXCLUDED.requiere_revision_empate_dual,
        grupo_a_autoeficacia          = EXCLUDED.grupo_a_autoeficacia,
        grupo_b_resiliencia           = EXCLUDED.grupo_b_resiliencia,
        grupo_c_estres                = EXCLUDED.grupo_c_estres,
        total_s2                      = EXCLUDED.total_s2,
        nivel_psicometrico            = EXCLUDED.nivel_psicometrico,
        interpretacion_s2             = EXCLUDED.interpretacion_s2,
        puntaje_3a_logico_matematico  = EXCLUDED.puntaje_3a_logico_matematico,
        puntaje_3b_comprension_verbal = EXCLUDED.puntaje_3b_comprension_verbal,
        puntaje_3c_espacial_visual    = EXCLUDED.puntaje_3c_espacial_visual,
        puntaje_r_realista            = EXCLUDED.puntaje_r_realista,
        puntaje_i_investigador        = EXCLUDED.puntaje_i_investigador,
        puntaje_a_artistico           = EXCLUDED.puntaje_a_artistico,
        puntaje_s_social              = EXCLUDED.puntaje_s_social,
        puntaje_e_emprendedor         = EXCLUDED.puntaje_e_emprendedor,
        puntaje_c_convencional        = EXCLUDED.puntaje_c_convencional,
        p1_7_dedicacion               = EXCLUDED.p1_7_dedicacion,
        p1_7_interpretacion           = EXCLUDED.p1_7_interpretacion,
        p5_4_opcion                   = EXCLUDED.p5_4_opcion,
        p5_4_interpretacion           = EXCLUDED.p5_4_interpretacion,
        calculado_en                  = NOW();

    -- 3. Actualizar estado de la evaluación (si aún no está revisada por el psicólogo)
    UPDATE evaluaciones
    SET estado = CASE WHEN estado = 'revisada' THEN 'revisada' ELSE 'evaluada' END,
        updated_at = NOW()
    WHERE id = p_evaluacion_id;

    RETURN QUERY
    SELECT
        r.evaluacion_id,
        r.primera_opcion_codigo,
        r.primera_opcion_puntaje,
        r.segunda_opcion_codigo,
        r.segunda_opcion_puntaje,
        r.total_s2,
        r.nivel_psicometrico
    FROM resultados_evaluacion r
    WHERE r.evaluacion_id = p_evaluacion_id;
END;
$$;

COMMIT;

-- =============================================================================
-- CONSULTAS RÁPIDAS DE REVISIÓN (DESCOMENTAR PARA INSPECCIONAR RESULTADOS)
-- =============================================================================
-- SELECT * FROM resultados_evaluacion ORDER BY evaluacion_id;
-- SELECT * FROM resultados_detalle_area ORDER BY evaluacion_id, orden_prioridad;
-- SELECT * FROM vw_hoja_correccion_final ORDER BY evaluacion_id;