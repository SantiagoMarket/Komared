-- Permite que la anon key lea validadores_temporales
-- Necesario para que notificar-reporte-demo.ts pueda obtener los correos con getSupabaseBot()

CREATE POLICY "validadores_temporales_select_anon"
  ON validadores_temporales FOR SELECT
  USING (true);
