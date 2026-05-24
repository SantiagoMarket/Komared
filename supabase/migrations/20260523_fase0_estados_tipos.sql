-- ─── Fase 0: Migración de estados y nuevos tipos ────────────────────────────
--
-- Usa bloques DO para que cada operación sea idempotente:
-- si el valor de origen ya no existe (fue renombrado en un intento anterior)
-- se omite sin error.


-- ─── 1. Renombrar valores del enum estado_reporte ─────────────────────────────

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'estado_reporte' AND e.enumlabel = 'aprobado'
  ) THEN
    ALTER TYPE estado_reporte RENAME VALUE 'aprobado' TO 'pendiente';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'estado_reporte' AND e.enumlabel = 'en_revision'
  ) THEN
    ALTER TYPE estado_reporte RENAME VALUE 'en_revision' TO 'en_curso';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'estado_reporte' AND e.enumlabel = 'resuelto'
  ) THEN
    ALTER TYPE estado_reporte RENAME VALUE 'resuelto' TO 'solucionado';
  END IF;
END $$;


-- ─── 2. Agregar nuevos tipos de problema ──────────────────────────────────────
--
-- IF NOT EXISTS garantiza idempotencia.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'tipo_reporte' AND e.enumlabel = 'desnutricion_cronica'
  ) THEN
    ALTER TYPE tipo_reporte ADD VALUE 'desnutricion_cronica';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'tipo_reporte' AND e.enumlabel = 'deficit_alimentario'
  ) THEN
    ALTER TYPE tipo_reporte ADD VALUE 'deficit_alimentario';
  END IF;
END $$;


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
