import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { notificarNuevoReporte } from '@/backend/notificar-nuevo-reporte'

async function verificarAdmin() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  if (user.app_metadata?.role === 'cliente') return null
  return user
}

export async function POST() {
  if (!await verificarAdmin()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    await notificarNuevoReporte({
      tipo: 'comedor_sin_alimentos',
      nombre_lugar: 'Comedor de prueba',
      municipio: null,
      departamento: null,
      personas_afectadas: null,
      tiempo_situacion_dias: null,
      canal: 'whatsapp',
    })

    return NextResponse.json({ ok: true, mensaje: 'Correos de prueba enviados a contactos activos' })
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
