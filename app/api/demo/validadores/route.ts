import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServer } from '@/lib/supabase-server'

const schemaValidador = z.object({
  nombre: z.string().min(2).max(150),
  correo: z.string().email().max(200),
})

export async function POST(req: NextRequest) {
  const parsed = schemaValidador.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', detalles: parsed.error.issues }, { status: 400 })
  }

  const supabase = await createSupabaseServer()
  const { error } = await supabase
    .from('validadores_temporales')
    .insert(parsed.data)

  if (error) return NextResponse.json({ error: 'Error al registrar' }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}
