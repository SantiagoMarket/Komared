CREATE TABLE clientes (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre       TEXT        NOT NULL,
  empresa      TEXT        NOT NULL,
  ciudad       TEXT,
  municipio    TEXT,
  departamento TEXT,
  activo       BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- El cliente autenticado solo puede leer su propio perfil
CREATE POLICY "cliente lee su perfil"
  ON clientes FOR SELECT
  USING (auth.uid() = user_id);

-- Solo service_role puede INSERT / UPDATE / DELETE (no hay política pública)
