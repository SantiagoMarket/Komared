import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/backend/supabase-admin'
import { createSupabaseServer } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const CAMPOS_PERMITIDOS_PATCH = ['estado'] as const

async function verificarSesion() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verificarSesion()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const CAMPOS_PUBLICOS = 'id, tipo, nombre_lugar, municipio, departamento, estado, created_at, lat, lng, personas_afectadas, tiempo_situacion_dias, evidencia, canal, media_url, media_mime_type'
  const { data, error } = await getSupabaseAdmin().from('reportes').select(CAMPOS_PUBLICOS).eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
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
