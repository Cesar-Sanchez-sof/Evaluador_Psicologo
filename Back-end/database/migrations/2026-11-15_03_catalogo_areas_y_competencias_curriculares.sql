-- =============================================================================
-- Migración: Actualización P5.1 / P5.2 a opción múltiple y Catálogo de
-- Áreas Curriculares y Competencias de Educación Básica Regular (CNEB - MINEDU)
-- =============================================================================

-- 1. Actualización de preguntas P5.1 y P5.2 a opción múltiple
UPDATE preguntas
SET tipo_respuesta = 'opcion_multiple'
WHERE codigo IN ('P5.1', 'P5.2');

-- 2. Creación de tablas de Áreas Curriculares y Competencias
CREATE TABLE IF NOT EXISTS areas_curriculares (
    id         SMALLINT PRIMARY KEY,
    codigo     VARCHAR(10) NOT NULL UNIQUE,
    nombre     VARCHAR(150) NOT NULL,
    es_activo  BOOLEAN NOT NULL DEFAULT TRUE,
    orden      SMALLINT NOT NULL
);

CREATE TABLE IF NOT EXISTS competencias_curriculares (
    id                 SMALLINT PRIMARY KEY,
    area_curricular_id SMALLINT NOT NULL REFERENCES areas_curriculares(id) ON DELETE CASCADE,
    codigo             VARCHAR(20) NOT NULL UNIQUE,
    descripcion        TEXT NOT NULL,
    orden              SMALLINT NOT NULL
);

-- Tabla de registro de notas por competencia y período (T1, T2) en escala AD, A, B, C (19, 16, 12, 8)
CREATE TABLE IF NOT EXISTS notas_competencias (
    id             BIGSERIAL PRIMARY KEY,
    estudiante_id  BIGINT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    competencia_id SMALLINT NOT NULL REFERENCES competencias_curriculares(id) ON DELETE CASCADE,
    periodo        VARCHAR(5) NOT NULL CHECK (periodo IN ('T1', 'T2')),
    nivel_logro    VARCHAR(2) NOT NULL CHECK (nivel_logro IN ('AD', 'A', 'B', 'C')),
    valor_numerico SMALLINT NOT NULL CHECK (valor_numerico IN (19, 16, 12, 8)),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (estudiante_id, competencia_id, periodo)
);

-- 3. Inserción de Catálogo de 11 Áreas Curriculares (CNEB)
INSERT INTO areas_curriculares (id, codigo, nombre, es_activo, orden) VALUES
(1, 'dpcc', 'Desarrollo Personal, Ciudadanía y Cívica', TRUE, 1),
(2, 'ccss', 'Ciencias Sociales', TRUE, 2),
(3, 'er', 'Educación Religiosa', TRUE, 3),
(4, 'ept', 'Educación para el Trabajo', TRUE, 4),
(5, 'ef', 'Educación Física', TRUE, 5),
(6, 'com', 'Comunicación', TRUE, 6),
(7, 'arte', 'Arte y Cultura', TRUE, 7),
(8, 'cast', 'Castellano como Segunda Lengua', TRUE, 8),
(9, 'ing', 'Inglés', TRUE, 9),
(10, 'mat', 'Matemática', TRUE, 10),
(11, 'cyt', 'Ciencia y Tecnología', TRUE, 11)
ON CONFLICT (id) DO UPDATE SET
  codigo = EXCLUDED.codigo,
  nombre = EXCLUDED.nombre,
  es_activo = EXCLUDED.es_activo,
  orden = EXCLUDED.orden;

-- 4. Inserción de Catálogo de 29 Competencias Curriculares (CNEB)
INSERT INTO competencias_curriculares (id, area_curricular_id, codigo, descripcion, orden) VALUES
-- Desarrollo Personal, Ciudadanía y Cívica (2)
(1, 1, 'dpcc-1', 'Construye su identidad', 1),
(2, 1, 'dpcc-2', 'Convive y participa democráticamente en la búsqueda del bien común', 2),
-- Ciencias Sociales (3)
(3, 2, 'ccss-1', 'Construye interpretaciones históricas', 1),
(4, 2, 'ccss-2', 'Gestiona responsablemente el espacio y el ambiente', 2),
(5, 2, 'ccss-3', 'Gestiona responsablemente los recursos económicos', 3),
-- Educación Religiosa (2)
(6, 3, 'er-1', 'Construye su identidad como persona humana, amada por Dios, digna, libre y trascendente, comprendiendo la doctrina de su propia religión, abierto al diálogo con las que le son cercanas', 1),
(7, 3, 'er-2', 'Asume la experiencia del encuentro personal y comunitario con Dios en su proyecto de vida en coherencia con su creencia religiosa', 2),
-- Educación para el Trabajo (1)
(8, 4, 'ept-1', 'Gestiona proyectos de emprendimiento económico o social', 1),
-- Educación Física (3)
(9, 5, 'ef-1', 'Se desenvuelve de manera autónoma a través de su motricidad', 1),
(10, 5, 'ef-2', 'Asume una vida saludable', 2),
(11, 5, 'ef-3', 'Interactúa a través de sus habilidades sociomotrices', 3),
-- Comunicación (3)
(12, 6, 'com-1', 'Se comunica oralmente en su lengua materna', 1),
(13, 6, 'com-2', 'Lee diversos tipos de textos escritos en su lengua materna', 2),
(14, 6, 'com-3', 'Escribe diversos tipos de textos en su lengua materna', 3),
-- Arte y Cultura (2)
(15, 7, 'arte-1', 'Aprecia de manera crítica manifestaciones artístico-culturales', 1),
(16, 7, 'arte-2', 'Crea proyectos desde los lenguajes artísticos', 2),
-- Castellano como Segunda Lengua (3)
(17, 8, 'cast-1', 'Se comunica oralmente en castellano como segunda lengua', 1),
(18, 8, 'cast-2', 'Lee diversos tipos de textos escritos en castellano como segunda lengua', 2),
(19, 8, 'cast-3', 'Escribe diversos tipos de textos en castellano como segunda lengua', 3),
-- Inglés (3)
(20, 9, 'ing-1', 'Se comunica oralmente en inglés como lengua extranjera', 1),
(21, 9, 'ing-2', 'Lee diversos tipos de textos escritos en inglés como lengua extranjera', 2),
(22, 9, 'ing-3', 'Escribe diversos tipos de textos en inglés como lengua extranjera', 3),
-- Matemática (4)
(23, 10, 'mat-1', 'Resuelve problemas de cantidad', 1),
(24, 10, 'mat-2', 'Resuelve problemas de regularidad, equivalencia y cambio', 2),
(25, 10, 'mat-3', 'Resuelve problemas de forma, movimiento y localización', 3),
(26, 10, 'mat-4', 'Resuelve problemas de gestión de datos e incertidumbre', 4),
-- Ciencia y Tecnología (3)
(27, 11, 'cyt-1', 'Indaga mediante métodos científicos para construir sus conocimientos', 1),
(28, 11, 'cyt-2', 'Explica el mundo físico basándose en conocimientos sobre los seres vivos; materia y energía; biodiversidad, Tierra y Universo', 2),
(29, 11, 'cyt-3', 'Diseña y construye soluciones tecnológicas para resolver problemas de su entorno', 3)
ON CONFLICT (id) DO UPDATE SET
  area_curricular_id = EXCLUDED.area_curricular_id,
  codigo = EXCLUDED.codigo,
  descripcion = EXCLUDED.descripcion,
  orden = EXCLUDED.orden;
