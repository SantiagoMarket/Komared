import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/backend/supabase-admin'
import { createSupabaseServer } from '@/lib/supabase-server'
import { notificarError } from '@/backend/notificar-error'

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

  let query = getSupabaseAdmin().from('reportes').select('*').order('created_at', { ascending: false })
  if (estado) query = query.eq('estado', estado)
  if (municipio) query = query.eq('municipio', municipio)

  const { data, error } = await query
  if (error) {
    await notificarError('api/reportes GET', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await getSupabaseAdmin().from('reportes').insert(body).select().single()
  if (error) {
    await notificarError('api/reportes POST', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
