-- Permite al bot (anon) subir evidencia al bucket reportes-media.
-- Solo INSERT — el bot nunca debe leer archivos del storage.
-- La lectura pública la gestiona Supabase a nivel de bucket (public bucket).
CREATE POLICY "anon_insert_reportes_media"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'reportes-media');
