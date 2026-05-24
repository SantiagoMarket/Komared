-- ─── Fase 0: Migración de estados y nuevos tipos ────────────────────────────
--
-- El enum estado_reporte puede tener ambos valores (viejo y nuevo) a la vez.
-- Estrategia por caso:
--   • Si viejo existe Y nuevo NO existe → RENAME (renombra el label del enum)
--   • Si viejo existe Y nuevo YA existe → UPDATE filas (migra los datos)
--   • Si viejo no existe               → skip (ya fue migrado)


-- ─── 1. aprobado → pendiente ──────────────────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'estado_reporte' AND e.enumlabel = 'aprobado'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'estado_reporte' AND e.enumlabel = 'pendiente'
    ) THEN
      ALTER TYPE estado_reporte RENAME VALUE 'aprobado' TO 'pendiente';
    ELSE
      UPDATE reportes SET estado = 'pendiente' WHERE estado = 'aprobado';
    END IF;
  END IF;
END $$;


-- ─── 2. en_revision → en_curso ───────────────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'estado_reporte' AND e.enumlabel = 'en_revision'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'estado_reporte' AND e.enumlabel = 'en_curso'
    ) THEN
      ALTER TYPE estado_reporte RENAME VALUE 'en_revision' TO 'en_curso';
    ELSE
      UPDATE reportes SET estado = 'en_curso' WHERE estado = 'en_revision';
    END IF;
  END IF;
END $$;


-- ─── 3. resuelto → solucionado ───────────────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'estado_reporte' AND e.enumlabel = 'resuelto'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'estado_reporte' AND e.enumlabel = 'solucionado'
    ) THEN
      ALTER TYPE estado_reporte RENAME VALUE 'resuelto' TO 'solucionado';
    ELSE
      UPDATE reportes SET estado = 'solucionado' WHERE estado = 'resuelto';
    END IF;
  END IF;
END $$;


-- ─── 4. Agregar nuevos tipos de problema ──────────────────────────────────────

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


-- ─── 5. Actualizar RLS: lectura pública solo pendiente + critico ──────────────

DROP POLICY IF EXISTS "anon_select_reportes_publicos" ON reportes;

CREATE POLICY "anon_select_reportes_publicos"
ON reportes FOR SELECT
TO anon
USING (
  estado IN ('pendiente', 'critico')
  AND lat IS NOT NULL
  AND lng IS NOT NULL
);


-- ─── 6. Recrear view mapa_reportes_publico ────────────────────────────────────

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
