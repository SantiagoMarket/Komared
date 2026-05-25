import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServer } from '@/lib/supabase-server'
import { getSupabaseAdmin } from '@/backend/supabase-admin'

const schemaCliente = z.object({
  nombre:       z.string().min(2).max(150),
  empresa:      z.string().min(2).max(200),
  email:        z.string().email(),
  password:     z.string().min(8).max(72),
  ciudad:       z.string().max(100).optional(),
  municipio:    z.string().max(100).optional(),
  departamento: z.string().max(100).optional(),
})

async function verificarValidador() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  // Los clientes no pueden usar este endpoint
  if (user.app_metadata?.role === 'cliente') return null
  return user
}

export async function POST(req: NextRequest) {
  if (!await verificarValidador()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const parsed = schemaCliente.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', detalles: parsed.error.issues }, { status: 400 })
  }

  const { nombre, empresa, email, password, ciudad, municipio, departamento } = parsed.data
  const admin = getSupabaseAdmin()

  // Crear usuario en Supabase Auth con role=cliente en app_metadata
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    app_metadata: { role: 'cliente' },
    email_confirm: true,
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese correo' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al crear el usuario' }, { status: 500 })
  }

  // Insertar perfil en tabla clientes
  const { error: perfilError } = await admin.from('clientes').insert({
    user_id: authData.user.id,
    nombre,
    empresa,
    ciudad:       ciudad ?? null,
    municipio:    municipio ?? null,
    departamento: departamento ?? null,
  })

  if (perfilError) {
    // Revertir: eliminar el usuario Auth para no dejar huérfanos
    await admin.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: 'Error al guardar el perfil del cliente' }, { status: 500 })
  }

  return NextResponse.json({ id: authData.user.id, email }, { status: 201 })
}

export async function GET() {
  if (!await verificarValidador()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('clientes')
    .select('id, user_id, nombre, empresa, ciudad, municipio, departamento, activo, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })
  }

  return NextResponse.json(data)
}
