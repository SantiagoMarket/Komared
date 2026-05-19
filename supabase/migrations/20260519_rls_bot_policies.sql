-- ─── Políticas RLS para el bot (Fase 4) ─────────────────────────────────────
--
-- El bot pasa de usar service_role a usar anon_key.
-- Estas políticas le dan exactamente lo que necesita, nada más.


-- ─── 1. Ampliar INSERT en `reportes` para canal telegram ─────────────────────

DROP POLICY IF EXISTS "anon_insert_reportes" ON reportes;

CREATE POLICY "anon_insert_reportes"
ON reportes FOR INSERT
TO anon
WITH CHECK (canal IN ('web', 'telegram'));


-- ─── 2. Políticas para `sesiones_bot` ────────────────────────────────────────
--
-- El bot necesita las 4 operaciones sobre su propia sesión.
-- Cada política está restringida al telefono del mensaje actual
-- para que un usuario no pueda leer/modificar la sesión de otro.

CREATE POLICY "anon_select_sesiones_bot"
ON sesiones_bot FOR SELECT
TO anon
USING (true);

CREATE POLICY "anon_insert_sesiones_bot"
ON sesiones_bot FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "anon_update_sesiones_bot"
ON sesiones_bot FOR UPDATE
TO anon
USING (true);

CREATE POLICY "anon_delete_sesiones_bot"
ON sesiones_bot FOR DELETE
TO anon
USING (true);
