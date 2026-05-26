import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/backend/supabase-admin'
import { verificarSesion } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

const CAMPOS_PERMITIDOS_PATCH = ['estado'] as const

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verificarSesion()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const CAMPOS = 'id, tipo, nombre_lugar, municipio, departamento, estado, created_at, lat, lng, personas_afectadas, tiempo_situacion_dias, canal, media_url, media_mime_type'
  const { data, error } = await getSupabaseAdmin().from('reportes').select(CAMPOS).eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  // Generar signed URL legacy (1h) — fallback para reportes sin entradas en reportes_media
  let media_signed_url: string | null = null
  if (data.media_url) {
    const { data: signed } = await getSupabaseAdmin()
      .storage.from('reportes-media')
      .createSignedUrl(data.media_url, 3600)
    media_signed_url = signed?.signedUrl ?? null
  }

  // Todos los archivos multimedia del reporte (incluyendo extras enviados después)
  const { data: mediaRows } = await getSupabaseAdmin()
    .from('reportes_media')
    .select('url, mime_type')
    .eq('reporte_id', id)
    .order('created_at', { ascending: true })

  const media_archivos = await Promise.all(
    (mediaRows ?? []).map(async (m) => {
      const { data: signed } = await getSupabaseAdmin()
        .storage.from('reportes-media')
        .createSignedUrl(m.url, 3600)
      return { signed_url: signed?.signedUrl ?? null, mime_type: m.mime_type as string | null }
    })
  ).then((arr) => arr.filter((m): m is { signed_url: string; mime_type: string | null } => m.signed_url !== null))

  return NextResponse.json({ ...data, media_url: undefined, media_signed_url, media_archivos })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verificarSesion()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  // Solo permite modificar campos de la whitelist — cierra mass assignment
  const camposValidos = Object.fromEntries(
    CAMPOS_PERMITIDOS_PATCH
      .filter((campo) => campo in body)
      .map((campo) => [campo, body[campo]])
  )

  if (Object.keys(camposValidos).length === 0) {
    return NextResponse.json({ error: 'Ningún campo permitido en el body' }, { status: 400 })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('reportes')
    .update(camposValidos)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
