-- Tabla de contactos que reciben notificaciones cuando una alerta
-- lleva 7+ días sin resolución.
-- Los contactos pueden ser por municipio específico o globales (municipio_id NULL = todos).

CREATE TABLE IF NOT EXISTS contactos_alerta (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre        text NOT NULL,
    cargo         text,
    email         text,
    telefono      text,
    -- NULL = recibe notificaciones de cualquier municipio
    municipio_id  text,
    activo        boolean NOT NULL DEFAULT true,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Índice para consultar rápido por municipio
CREATE INDEX idx_contactos_alerta_municipio ON contactos_alerta (municipio_id);

-- updated_at automático
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_contactos_alerta_updated_at
BEFORE UPDATE ON contactos_alerta
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- ─── Datos sintéticos ────────────────────────────────────────────────────────

INSERT INTO contactos_alerta (nombre, cargo, email, telefono, municipio_id) VALUES
-- Contactos globales (reciben todas las alertas)
('Laura Martínez',   'Coordinadora Nacional PAE',   'laura.martinez@mineducacion.gov.co',  '+573001234567', NULL),
('Carlos Herrera',   'Defensor del Pueblo Regional', 'cherrera@defensoria.gov.co',          '+573109876543', NULL),

-- Contactos por zona prioritaria — La Guajira
('Yenny Pushaina',   'Líder Comunal Riohacha',      'ypushaina@veeduria.org',              '+573204567890', 'Riohacha'),
('Hernán Iguarán',   'Supervisor ICBF La Guajira',  'higuaran@icbf.gov.co',               '+573115678901', 'Maicao'),

-- Chocó
('Rosa Palacios',    'Personera Municipal Quibdó',   'rpalacios@personeria-quibdo.gov.co',  '+573226789012', 'Quibdó'),
('Álvaro Mosquera',  'Técnico Nutrición Chocó',      'amosquera@minsalud.gov.co',           '+573137890123', 'Istmina'),

-- Magdalena
('Sandra Orozco',    'Inspectora Educación Sta. Marta', 'sorozco@sedbogota.gov.co',        '+573248901234', 'Santa Marta'),

-- Cesar
('Jorge Cuello',     'Alcalde (encargado) Valledupar', 'jcuello@valledupar.gov.co',        '+573159012345', 'Valledupar'),
('Milena Castro',    'Veedora Ciudadana Cesar',      'mcastro@veeduriaciudadana.org',      '+573260123456', 'Aguachica');
