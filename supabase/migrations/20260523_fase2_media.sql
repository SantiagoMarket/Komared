-- ─── Fase 2: Almacenamiento de evidencia multimedia ──────────────────────────
--
-- media_url       → URL pública en Supabase Storage (bucket: reportes-media)
-- media_mime_type → tipo MIME del archivo (image/jpeg, video/mp4, etc.)
--
-- Ambos son opcionales (NULL si el usuario no envía evidencia al bot).

ALTER TABLE reportes
  ADD COLUMN IF NOT EXISTS media_url       text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS media_mime_type text DEFAULT NULL;
