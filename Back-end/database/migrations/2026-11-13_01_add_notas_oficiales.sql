-- =============================================================================
-- Migración incremental: Notas Académicas Oficiales
-- Fecha: 2026-11-13
--
-- Crea la tabla `notas_oficiales` (una fila por estudiante) utilizada por el
-- nuevo paso "Notas Académicas". Es idempotente: si la tabla ya existe no
-- modifica sus datos.
--
-- Ejecutar este bloque completo en pgAdmin (Query Tool) sobre la base
-- Evaluador_Psicologo. No ejecutar el script completo `evaluador_vocacional.sql`
-- porque ese archivo elimina y recrea todas las tablas.
-- =============================================================================

BEGIN;

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

COMMIT;
