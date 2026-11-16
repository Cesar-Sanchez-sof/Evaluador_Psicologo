-- =============================================================================
-- MIGRACIÓN: Catálogo de Secciones Académicas (A, B, C, D, E, F)
-- Fecha: 2026-11-16
-- Descripción: Tabla de secciones escolares para el registro de estudiantes
-- =============================================================================

CREATE TABLE IF NOT EXISTS secciones_academicas (
    id          SERIAL PRIMARY KEY,
    codigo      VARCHAR(10) NOT NULL UNIQUE,
    nombre      VARCHAR(50) NOT NULL,
    grado       VARCHAR(50) NOT NULL DEFAULT '5.° de secundaria',
    orden       SMALLINT NOT NULL DEFAULT 1,
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Poblar secciones escolares oficiales A, B, C, D, E y F
INSERT INTO secciones_academicas (codigo, nombre, grado, orden, activo) VALUES
('A', 'Sección A', '5.° de secundaria', 1, TRUE),
('B', 'Sección B', '5.° de secundaria', 2, TRUE),
('C', 'Sección C', '5.° de secundaria', 3, TRUE),
('D', 'Sección D', '5.° de secundaria', 4, TRUE),
('E', 'Sección E', '5.° de secundaria', 5, TRUE),
('F', 'Sección F', '5.° de secundaria', 6, TRUE)
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre,
    grado = EXCLUDED.grado,
    orden = EXCLUDED.orden,
    activo = EXCLUDED.activo;

CREATE INDEX IF NOT EXISTS idx_secciones_academicas_activo_orden 
ON secciones_academicas (activo, orden);
