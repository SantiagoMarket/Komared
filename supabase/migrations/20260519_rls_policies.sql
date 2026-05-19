-- ─── Row Level Security — Dossier ────────────────────────────────────────────
--
-- service_role (usado por bot, cron y API routes) bypassa RLS por diseño en
-- Supabase — esas rutas no se ven afectadas por ninguna de estas políticas.
--
-- Roles relevantes:
--   anon          → usuario no autenticado (mapa público, futura app web)
--   authenticated → validador con sesión activa (dashboard, histórico)


-- ─── 1. Activar RLS en todas las tablas ──────────────────────────────────────

ALTER TABLE reportes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE municipios       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones_bot     ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos_alerta ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log        ENABLE ROW LEVEL SECURITY;


-- ─── 2. Políticas para `reportes` ────────────────────────────────────────────

-- Validadores logueados pueden leer todos los reportes (dashboard, histórico)
CREATE POLICY "authenticated_select_reportes"
ON reportes FOR SELECT
TO authenticated
USING (true);

-- Validadores logueados pueden actualizar reportes (marcar resuelto, etc.)
CREATE POLICY "authenticated_update_reportes"
ON reportes FOR UPDATE
TO authenticated
USING (true);

-- Anon puede insertar reportes desde la web (futura app ciudadana)
-- Solo se permite canal='web' para no interferir con el bot (que usa service_role)
CREATE POLICY "anon_insert_reportes"
ON reportes FOR INSERT
TO anon
WITH CHECK (canal = 'web');

-- Anon puede leer únicamente reportes verificados con coordenadas.
-- Necesario para: vista mapa_reportes_publico + suscripción realtime del mapa.
CREATE POLICY "anon_select_reportes_publicos"
ON reportes FOR SELECT
TO anon
USING (
  estado IN ('aprobado', 'critico')
  AND lat IS NOT NULL
  AND lng IS NOT NULL
);


-- ─── 3. Políticas para `municipios` ──────────────────────────────────────────

-- Solo nombres y coordenadas — sin datos sensibles, lectura pública
CREATE POLICY "public_select_municipios"
ON municipios FOR SELECT
USING (true);


-- ─── 4. Políticas para `audit_log` ───────────────────────────────────────────

-- Solo validadores logueados pueden consultar el historial de cambios
CREATE POLICY "authenticated_select_audit_log"
ON audit_log FOR SELECT
TO authenticated
USING (true);


-- ─── 5. `sesiones_bot` y `contactos_alerta` ──────────────────────────────────
--
-- Ambas tablas son accedidas exclusivamente por service_role (bot y cron).
-- RLS activado sin políticas para anon/authenticated = acceso denegado
-- a cualquier cliente externo. No se necesita ninguna política adicional.
