import { getSupabaseAdmin } from '@/backend/supabase-admin'
import { sendMessage, teclado, tecladoInline } from '@/backend/telegram'

const TIPOS: Record<string, string> = {
  '🍽️ Comedor sin alimentos': 'comedor_sin_alimentos',
  '🔒 Comedor cerrado': 'comedor_cerrado',
  '⚠️ Calidad deficiente': 'comedor_calidad_deficiente',
  '🚫 Contratista ausente': 'comedor_contratista_ausente',
  '📦 PAE no entregado': 'pae_no_entregado',
  '🥴 PAE calidad deficiente': 'pae_calidad_deficiente',
  '🏛️ ICBF sin entrega': 'icbf_sin_entrega',
}

const PASOS = ['tipo', 'nombre_lugar', 'ubicacion', 'evidencia'] as const
type Paso = (typeof PASOS)[number]

async function getSesion(telefonoId: string) {
  const { data } = await getSupabaseAdmin()
    .from('sesiones_bot')
    .select('*')
    .eq('telefono', telefonoId)
    .single()
  return data
}

async function setSesion(telefonoId: string, datos: object, paso: Paso) {
  await getSupabaseAdmin().from('sesiones_bot').upsert(
    { telefono: telefonoId, datos_temp: datos, paso_actual: paso, updated_at: new Date().toISOString() },
    { onConflict: 'telefono' }
  )
}

async function deleteSesion(telefonoId: string) {
  await getSupabaseAdmin().from('sesiones_bot').delete().eq('telefono', telefonoId)
}

async function geocodificar(municipioTexto: string, deptoTexto: string | null) {
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from('municipios')
    .select('lat, lng, municipio, departamento')
    .ilike('municipio', `%${municipioTexto.trim()}%`)

  if (deptoTexto) query = query.ilike('departamento', `%${deptoTexto.trim()}%`)

  const { data } = await query.limit(1).single()
  return data ?? null
}

async function crearReporte(telefonoId: string, datos: Record<string, string>) {
  const [municipioRaw, deptoRaw] = (datos.ubicacion ?? '').split(',').map((s) => s.trim())
  const geo = await geocodificar(municipioRaw, deptoRaw ?? null)

  await getSupabaseAdmin().from('reportes').insert({
    telefono_reporte: telefonoId,
    tipo: datos.tipo,
    nombre_lugar: datos.nombre_lugar,
    municipio: geo?.municipio ?? municipioRaw,
    departamento: geo?.departamento ?? deptoRaw ?? null,
    lat: geo?.lat ?? null,
    lng: geo?.lng ?? null,
    canal: 'whatsapp',
    estado: 'aprobado',
  })
}

export async function procesarMensaje(
  chatId: number,
  telefonoId: string,
  texto: string,
  fileId?: string
) {
  const sesion = await getSesion(telefonoId)
  const paso: Paso = sesion?.paso_actual ?? 'tipo'
  const datos: Record<string, string> = sesion?.datos_temp ?? {}

  // Comando de inicio
  if (texto === '/start' || texto === '/nuevo') {
    await sendMessage(
      chatId,
      '👋 <b>Bienvenido al monitor PAE / Comedores</b>\n\nVamos a registrar tu reporte en 4 pasos.\n\n¿Qué problema quieres reportar?',
      teclado([
        ['🍽️ Comedor sin alimentos', '🔒 Comedor cerrado'],
        ['⚠️ Calidad deficiente', '🚫 Contratista ausente'],
        ['📦 PAE no entregado', '🥴 PAE calidad deficiente'],
        ['🏛️ ICBF sin entrega'],
      ])
    )
    await setSesion(telefonoId, {}, 'tipo')
    return
  }

  if (texto === '/cancelar') {
    await deleteSesion(telefonoId)
    await sendMessage(chatId, '❌ Reporte cancelado. Escribe /nuevo para empezar de nuevo.')
    return
  }

  // Paso 1: tipo de problema
  if (paso === 'tipo') {
    const tipoEnum = TIPOS[texto]
    if (!tipoEnum) {
      await sendMessage(chatId, '⚠️ Selecciona una opción del menú.')
      return
    }
    datos.tipo = tipoEnum
    await setSesion(telefonoId, datos, 'nombre_lugar')
    await sendMessage(
      chatId,
      '📍 <b>Paso 2 de 4</b>\n\n¿Cuál es el nombre del comedor o institución educativa?',
      { reply_markup: { remove_keyboard: true } }
    )
    return
  }

  // Paso 2: nombre del lugar
  if (paso === 'nombre_lugar') {
    datos.nombre_lugar = texto
    await setSesion(telefonoId, datos, 'ubicacion')
    await sendMessage(
      chatId,
      '🗺️ <b>Paso 3 de 4</b>\n\n¿En qué municipio y departamento está?\n\nEjemplo: <i>Riohacha, La Guajira</i>'
    )
    return
  }

  // Paso 3: ubicación
  if (paso === 'ubicacion') {
    datos.ubicacion = texto
    await setSesion(telefonoId, datos, 'evidencia')
    await sendMessage(
      chatId,
      '📸 <b>Paso 4 de 4</b>\n\nSi tienes una foto o video como evidencia, envíala ahora.\n\nSi no tienes, escribe <b>omitir</b>.',
      tecladoInline([[{ texto: 'Omitir evidencia', data: 'omitir_evidencia' }]])
    )
    return
  }

  // Paso 4: evidencia (foto o "omitir")
  if (paso === 'evidencia') {
    if (fileId) datos.foto_url = fileId
    await crearReporte(telefonoId, datos)
    await deleteSesion(telefonoId)
    await sendMessage(
      chatId,
      '✅ <b>¡Reporte registrado!</b>\n\nGracias por tu veeduría. Tu reporte será revisado por un validador y aparecerá en el mapa público una vez aprobado.\n\nEscribe /nuevo para enviar otro reporte.',
      { reply_markup: { remove_keyboard: true } }
    )
    return
  }
}

export async function procesarCallback(chatId: number, telefonoId: string, data: string) {
  if (data === 'omitir_evidencia') {
    const sesion = await getSesion(telefonoId)
    const datos: Record<string, string> = sesion?.datos_temp ?? {}
    await crearReporte(telefonoId, datos)
    await deleteSesion(telefonoId)
    await sendMessage(
      chatId,
      '✅ <b>¡Reporte registrado!</b>\n\nGracias por tu veeduría. Tu reporte será revisado por un validador.\n\nEscribe /nuevo para enviar otro reporte.',
      { reply_markup: { remove_keyboard: true } }
    )
  }
}
