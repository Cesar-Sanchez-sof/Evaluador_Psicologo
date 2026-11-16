-- =============================================================================
-- Migración: Convertir preguntas P5.1 y P5.2 a tipo 'opcion_multiple'
-- =============================================================================

UPDATE preguntas
SET tipo_respuesta = 'opcion_multiple'
WHERE codigo IN ('P5.1', 'P5.2');
