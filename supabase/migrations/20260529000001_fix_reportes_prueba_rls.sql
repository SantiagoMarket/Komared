-- Corrige la política INSERT de reportes_prueba
-- getSupabaseBot() usa anon_key, no service_role → la política anterior bloqueaba el bot

DROP POLICY IF EXISTS "reportes_prueba_insert_service" ON reportes_prueba;

CREATE POLICY "reportes_prueba_insert_anon"
  ON reportes_prueba FOR INSERT
  WITH CHECK (true);
