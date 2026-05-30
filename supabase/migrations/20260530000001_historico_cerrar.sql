-- Revierte 20260530000000: cierra acceso público a /historico
DROP POLICY IF EXISTS "reportes_select_publico_temporal" ON reportes;
