import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const CAMPOS = 'id, tipo, nombre_lugar, municipio, departamento, estado, created_at, lat, lng, personas_afectadas, tiempo_situacion_dias, media_url, media_mime_type, canal'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const estado    = searchParams.get('estado')
  const municipio = searchParams.get('municipio')
  const all       = searchParams.get('all') === 'true'

  const supabase = await createSupabaseServer()
  let query = supabase
    .from('reportes_prueba')
    .select(CAMPOS, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (estado)    query = query.eq('estado', estado)
  if (municipio) query = query.eq('municipio', municipio)

  if (all) {
    const { data, error, count } = await query
    if (error) return NextResponse.json({ error: 'Error al obtener reportes de prueba' }, { status: 500 })
    return NextResponse.json({ data: data ?? [], total: count ?? 0 })
  }

  const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const from  = (page - 1) * limit
  const to    = from + limit - 1

  const { data, error, count } = await query.range(from, to)
  if (error) return NextResponse.json({ error: 'Error al obtener reportes de prueba' }, { status: 500 })
  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    page,
    totalPaginas: Math.ceil((count ?? 0) / limit),
  })
}
