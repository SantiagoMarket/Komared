import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/backend/supabase-admin'
import { createSupabaseServer } from '@/lib/supabase-server'
import { notificarError } from '@/backend/notificar-error'
import { TIPOS_VALIDOS } from '@/lib/reportes-config'

const schemaReporteWeb = z.object({
  tipo: z.enum(TIPOS_VALIDOS),
  nombre_lugar: z.string().min(2).max(200),
  municipio: z.string().max(100).optional(),
  nombre_reportante: z.string().max(150).optional(),
  descripcion: z.string().max(1000).optional(),
})

export const dynamic = 'force-dynamic'

async function verificarSesion() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(req: NextRequest) {
  if (!await verificarSesion()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const estado = searchParams.get('estado')
  const municipio = searchParams.get('municipio')

  const CAMPOS_PUBLICOS = 'id, tipo, nombre_lugar, municipio, departamento, estado, created_at, lat, lng, personas_afectadas, tiempo_situacion_dias, media_url, media_mime_type, canal'
  let query = getSupabaseAdmin().from('reportes').select(CAMPOS_PUBLICOS).order('created_at', { ascending: false })
  if (estado) query = query.eq('estado', estado)
  if (municipio) query = query.eq('municipio', municipio)

  const { data, error } = await query
  if (error) {
    await notificarError('api/reportes GET', error)
    return NextResponse.json({ error: 'Error al obtener los reportes' }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const parsed = schemaReporteWeb.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', detalles: parsed.error.issues }, { status: 400 })
  }

  // canal y estado siempre los fija el servidor — el cliente no puede manipularlos
  const payload = { ...parsed.data, canal: 'web', estado: 'pendiente' }

  const supabase = await createSupabaseServer()
  const { data, error } = await supabase.from('reportes').insert(payload).select().single()
  if (error) {
    await notificarError('api/reportes POST', error)
    return NextResponse.json({ error: 'Error al crear el reporte' }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
