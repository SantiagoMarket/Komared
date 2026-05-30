-- Demo pitch: tablas y vistas para experiencia pública sin login

-- 1. Tabla reportes_prueba (idéntica a reportes)
CREATE TABLE IF NOT EXISTS reportes_prueba (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo                 TEXT NOT NULL,
  nombre_lugar         TEXT,
  municipio            TEXT,
  departamento         TEXT,
  lat                  DOUBLE PRECISION,
  lng                  DOUBLE PRECISION,
  estado               TEXT NOT NULL DEFAULT 'pendiente',
  canal                TEXT,
  personas_afectadas   INTEGER,
  tiempo_situacion_dias INTEGER,
  media_url            TEXT,
  media_mime_type      TEXT,
  telefono_reporte     TEXT,
  nombre_reportante    TEXT,
  notificado_7d_at     TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reportes_prueba ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer (página demo es pública)
CREATE POLICY "reportes_prueba_select_publico"
  ON reportes_prueba FOR SELECT
  USING (true);

-- Solo service_role puede insertar (el bot usa service_role)
CREATE POLICY "reportes_prueba_insert_service"
  ON reportes_prueba FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Habilitar realtime para que el mapa se actualice en vivo
ALTER PUBLICATION supabase_realtime ADD TABLE reportes_prueba;

-- 2. Vista mapa_reportes_prueba_publico (equivalente a mapa_reportes_publico)
--    Muestra todos los reportes con coordenadas, mapeando estado a 'critico' o 'aprobado'
CREATE OR REPLACE VIEW mapa_reportes_prueba_publico AS
SELECT
  id,
  tipo,
  nombre_lugar,
  departamento,
  municipio,
  NULL::TEXT                                           AS vereda,
  lat,
  lng,
  CASE WHEN estado = 'critico' THEN 'critico'
       ELSE 'aprobado'
  END                                                  AS estado,
  media_url                                            AS foto_url,
  created_at,
  NULL::TIMESTAMPTZ                                    AS validado_at,
  CASE WHEN estado = 'critico' THEN 2 ELSE 1 END       AS peso,
  jsonb_build_object(
    'type', 'Point',
    'coordinates', jsonb_build_array(lng, lat)
  )                                                    AS geom_geojson
FROM reportes_prueba
WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- 3. Tabla validadores_temporales (registro de asistentes al pitch)
CREATE TABLE IF NOT EXISTS validadores_temporales (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     TEXT NOT NULL,
  correo     TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE validadores_temporales ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede registrarse (el formulario es público)
CREATE POLICY "validadores_temporales_insert_publico"
  ON validadores_temporales FOR INSERT
  WITH CHECK (true);

-- Solo service_role puede leer los datos de contacto
CREATE POLICY "validadores_temporales_select_service"
  ON validadores_temporales FOR SELECT
  USING (auth.role() = 'service_role');

-- Permisos de rol: anon puede leer reportes_prueba e insertar en validadores_temporales
GRANT SELECT ON reportes_prueba          TO anon, authenticated;
GRANT SELECT ON mapa_reportes_prueba_publico TO anon, authenticated;
GRANT INSERT ON validadores_temporales   TO anon, authenticated;
