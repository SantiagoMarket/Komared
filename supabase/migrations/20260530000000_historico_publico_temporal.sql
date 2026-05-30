-- TEMPORAL: permite acceso público de lectura a /historico
-- Para revertir: ejecutar la migración 20260530000001_historico_cerrar.sql

ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reportes_select_publico_temporal"
  ON reportes FOR SELECT
  USING (true);
