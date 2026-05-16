import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type ReporteMapbox = {
  id: string
  tipo: string
  nombre_lugar: string | null
  departamento: string | null
  municipio: string | null
  vereda: string | null
  lat: number
  lng: number
  estado: 'aprobado' | 'critico'
  foto_url: string | null
  created_at: string
  validado_at: string | null
  peso: 1 | 2
  geom_geojson: { type: 'Point'; coordinates: [number, number] }
}
