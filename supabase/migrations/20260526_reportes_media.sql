-- Tabla para almacenar múltiples archivos de evidencia por reporte.
-- Mientras el reporte no está guardado, reporte_id es NULL y se usa
-- telefono como clave temporal para vincularlos después.

CREATE TABLE IF NOT EXISTS reportes_media (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporte_id  uuid        REFERENCES reportes(id) ON DELETE CASCADE,
  telefono    text        NOT NULL,
  url         text        NOT NULL,
  mime_type   text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reportes_media_reporte_id ON reportes_media(reporte_id);
CREATE INDEX idx_reportes_media_telefono   ON reportes_media(telefono) WHERE reporte_id IS NULL;

ALTER TABLE reportes_media ENABLE ROW LEVEL SECURITY;

-- Bot (anon): puede insertar y actualizar sus propias filas
CREATE POLICY "anon_insert_reportes_media"
ON reportes_media FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "anon_update_reportes_media"
ON reportes_media FOR UPDATE TO anon
USING (true);

-- Dashboard (authenticated): lectura total
CREATE POLICY "auth_select_reportes_media"
ON reportes_media FOR SELECT TO authenticated
USING (true);
