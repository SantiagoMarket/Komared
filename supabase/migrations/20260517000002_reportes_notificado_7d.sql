-- Columna para registrar cuándo se envió la notificación de 7 días sin resolución.
-- NULL = nunca notificado. Evita reenvíos en cada ejecución del cron.

ALTER TABLE reportes
    ADD COLUMN IF NOT EXISTS notificado_7d_at timestamptz DEFAULT NULL;
