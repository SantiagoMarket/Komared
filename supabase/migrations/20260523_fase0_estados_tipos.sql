-- ─── Fase 0: Migración de estados y nuevos tipos ────────────────────────────
--
-- 1. Renombra valores de la columna `estado` en tabla `reportes`
--    aprobado    → pendiente
--    en_revision → en_curso
--    resuelto    → solucionado
--    critico     → critico (sin cambio)
--
-- 2. Agrega nuevos tipos de problema (columna `tipo`)
--    desnutricion_cronica, deficit_alimentario
--
-- 3. Actualiza la RLS policy de lectura pública
--
-- 4. Recrea la view mapa_reportes_publico con los nuevos estados


-- ─── 1. Renombrar estados en filas existentes ─────────────────────────────────

UPDATE reportes SET estado = 'pendiente'   WHERE estado = 'aprobado';
UPDATE reportes SET estado = 'en_curso'    WHERE estado = 'en_revision';
UPDATE reportes SET estado = 'solucionado' WHERE estado = 'resuelto';


-- ─── 2. Actualizar RLS: lectura pública solo pendiente + critico ──────────────

DROP POLICY IF EXISTS "anon_select_reportes_publicos" ON reportes;

CREATE POLICY "anon_select_reportes_publicos"
ON reportes FOR SELECT
TO anon
USING (
  estado IN ('pendiente', 'critico')
  AND lat IS NOT NULL
  AND lng IS NOT NULL
);


-- ─── 3. Recrear view mapa_reportes_publico ────────────────────────────────────
--
-- Solo expone reportes pendientes y críticos con coordenadas.
-- `peso` da mayor intensidad a los reportes críticos en el heat layer.

DROP VIEW IF EXISTS mapa_reportes_publico;

CREATE VIEW mapa_reportes_publico AS
SELECT
  id,
  tipo,
  nombre_lugar,
  departamento,
  municipio,
  lat,
  lng,
  estado,
  CASE WHEN estado = 'critico' THEN 1.0 ELSE 0.6 END AS peso,
  NULL::text AS geom_geojson
FROM reportes
WHERE
  estado IN ('pendiente', 'critico')
  AND lat IS NOT NULL
  AND lng IS NOT NULL;
