-- Ampliar política INSERT en `reportes` para incluir canal whatsapp

DROP POLICY IF EXISTS "anon_insert_reportes" ON reportes;

CREATE POLICY "anon_insert_reportes"
ON reportes FOR INSERT
TO anon
WITH CHECK (canal IN ('web', 'telegram', 'whatsapp'));
