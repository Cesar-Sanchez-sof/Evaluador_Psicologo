-- =============================================================================
-- Migración: Eliminar columna nota_castellano_segunda_lengua de notas_oficiales
-- =============================================================================

ALTER TABLE notas_oficiales
DROP COLUMN IF EXISTS nota_castellano_segunda_lengua;
