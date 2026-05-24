-- ─── Fase 1: Nuevos campos para métricas de impacto ─────────────────────────
--
-- personas_afectadas    → cuántas personas reporta el ciudadano
-- tiempo_situacion_dias → hace cuántos días lleva esa situación (según el usuario)
--
-- Ambos son opcionales (NULL si el usuario no responde al bot).

ALTER TABLE reportes
  ADD COLUMN IF NOT EXISTS personas_afectadas    integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tiempo_situacion_dias integer DEFAULT NULL;
