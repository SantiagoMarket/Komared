-- ─── Fase 0: Migración de estados y nuevos tipos ────────────────────────────
--
-- `estado` y `tipo` son enums de PostgreSQL, no columnas de texto.
-- Se usan ALTER TYPE ... RENAME VALUE (Pg ≥ 10) para renombrar valores
-- sin necesidad de UPDATE en las filas ni de recrear el tipo.
--
-- Cambios en enum `estado_reporte`:
--    aprobado    → pendiente
--    en_revision → en_curso
--    resuelto    → solucionado
--    critico     → critico (sin cambio)
--
-- Cambios en enum `tipo_reporte` (o columna texto):
--    + desnutricion_cronica
--    + deficit_alimentario


-- ─── 1. Renombrar valores del enum estado_reporte ─────────────────────────────

ALTER TYPE estado_reporte RENAME VALUE 'aprobado'    TO 'pendiente';
ALTER TYPE estado_reporte RENAME VALUE 'en_revision' TO 'en_curso';
ALTER TYPE estado_reporte RENAME VALUE 'resuelto'    TO 'solucionado';


-- ─── 2. Agregar nuevos tipos de problema ──────────────────────────────────────
--
-- Si `tipo` es un enum, se agregan los nuevos valores.
-- IF NOT EXISTS evita error si ya existen.

ALTER TYPE tipo_reporte ADD VALUE IF NOT EXISTS 'desnutricion_cronica';
ALTER TYPE tipo_reporte ADD VALUE IF NOT EXISTS 'deficit_alimentario';


-- ─── 3. Actualizar RLS: lectura pública solo pendiente + critico ──────────────

DROP POLICY IF EXISTS "anon_select_reportes_publicos" ON reportes;

CREATE POLICY "anon_select_reportes_publicos"
ON reportes FOR SELECT
TO anon
USING (
  estado IN ('pendiente', 'critico')
  AND lat IS NOT NULL
  AND lng IS NOT NULL
);


-- ─── 4. Recrear view mapa_reportes_publico ────────────────────────────────────
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
