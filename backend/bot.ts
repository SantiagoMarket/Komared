import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseAdmin } from '@/backend/supabase-admin'
import { sendMessage } from '@/backend/telegram'

const TIPOS_VALIDOS = [
  'comedor_sin_alimentos',
  'comedor_cerrado',
  'comedor_calidad_deficiente',
  'comedor_contratista_ausente',
  'pae_no_entregado',
  'pae_calidad_deficiente',
  'icbf_sin_entrega',
  'otro',
]

const SYSTEM_PROMPT = `Eres un asistente de veeduría ciudadana para el programa de monitoreo de comedores comunitarios y el Programa de Alimentación Escolar (PAE) en Colombia. Tu función es recopilar información sobre irregularidades de forma amigable y conversacional, en español colombiano informal.

Debes recopilar exactamente 4 campos:
1. **tipo**: El tipo de problema (OBLIGATORIO). Debe ser uno de: comedor_sin_alimentos, comedor_cerrado, comedor_calidad_deficiente, comedor_contratista_ausente, pae_no_entregado, pae_calidad_deficiente, icbf_sin_entrega, otro
2. **nombre_lugar**: Nombre del comedor o institución educativa (OBLIGATORIO)
3. **ubicacion**: Municipio y departamento donde está el lugar (OBLIGATORIO). Formato: "Municipio, Departamento"
4. **evidencia**: Foto, video o descripción adicional (OPCIONAL - el usuario puede omitirla)

Guías de comportamiento:
- Sé empático y directo. No uses menús ni botones.
- Conversa naturalmente para extraer la información.
- Si el usuario envía una foto o audio, agrádeceselo y úsalo como evidencia.
- Cuando tengas los 3 campos obligatorios, llama a la herramienta "registrar_reporte".
- Si el usuario dice /start o /nuevo, salúdalo y pídele que describa el problema.
- Si el usuario dice /cancelar, indica que el reporte fue cancelado.
- No inventes información. Si algo no está claro, pregunta amablemente.
- Mantén las respuestas cortas y al punto.`

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

async function getSesion(telefonoId: string) {
  const { data } = await getSupabaseAdmin()
    .from('sesiones_bot')
    .select('*')
    .eq('telefono', telefonoId)
    .single()
  return data
}

async function setSesion(telefonoId: string, historial: object[]) {
  await getSupabaseAdmin().from('sesiones_bot').upsert(
    {
      telefono: telefonoId,
      datos_temp: { historial },
      paso_actual: 'conversando',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'telefono' }
  )
}

async function deleteSesion(telefonoId: string) {
  await getSupabaseAdmin().from('sesiones_bot').delete().eq('telefono', telefonoId)
}

async function geocodificar(municipioTexto: string, deptoTexto: string | null) {
  let query = getSupabaseAdmin()
    .from('municipios')
    .select('lat, lng, municipio, departamento')
    .ilike('municipio', `%${municipioTexto.trim()}%`)

  if (deptoTexto) query = query.ilike('departamento', `%${deptoTexto.trim()}%`)

  const { data } = await query.limit(1).single()
  return data ?? null
}

async function crearReporte(
  telefonoId: string,
  campos: Record<string, string>,
  nombreReportante?: string,
  telegramUsername?: string
) {
  const [municipioRaw, deptoRaw] = (campos.ubicacion ?? '').split(',').map((s) => s.trim())
  const geo = await geocodificar(municipioRaw, deptoRaw ?? null)

  await getSupabaseAdmin().from('reportes').insert({
    telefono_reporte: telefonoId,
    nombre_reportante: nombreReportante ?? null,
    telegram_username: telegramUsername ?? null,
    tipo: campos.tipo,
    nombre_lugar: campos.nombre_lugar,
    municipio: geo?.municipio ?? municipioRaw,
    departamento: geo?.departamento ?? deptoRaw ?? null,
    lat: geo?.lat ?? null,
    lng: geo?.lng ?? null,
    canal: 'telegram',
    estado: 'aprobado',
  })
}

export async function procesarMensaje(
  chatId: number,
  telefonoId: string,
  texto: string,
  fileId?: string,
  nombreReportante?: string,
  telegramUsername?: string,
  isVoice?: boolean
) {
  if (texto === '/cancelar') {
    await deleteSesion(telefonoId)
    await sendMessage(chatId, '❌ Reporte cancelado. Escribe /nuevo para empezar de nuevo.')
    return
  }

  const sesion = await getSesion(telefonoId)
  const historial: Anthropic.MessageParam[] = sesion?.datos_temp?.historial ?? []

  // Build user message content
  const contenido: Anthropic.ContentBlockParam[] = []

  if (fileId && !isVoice) {
    // Telegram photo: fetch and send as base64 to Claude vision
    try {
      const fileRes = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`
      )
      const fileData = await fileRes.json()
      const filePath = fileData.result?.file_path

      if (filePath) {
        const imgRes = await fetch(
          `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`
        )
        const buffer = await imgRes.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        const mimeType = filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') ? 'image/jpeg' : 'image/png'

        contenido.push({
          type: 'image',
          source: { type: 'base64', media_type: mimeType, data: base64 },
        })
      }
    } catch {
      // If image fetch fails, just note it as evidence
    }
  }

  if (isVoice && fileId) {
    contenido.push({ type: 'text', text: `[El usuario envió un mensaje de voz. file_id: ${fileId}]` })
  }

  const textoFinal = texto.trim()
  if (textoFinal) {
    contenido.push({ type: 'text', text: textoFinal })
  }

  if (contenido.length === 0) return

  historial.push({ role: 'user', content: contenido })

  // Call Claude
  const client = getClient()
  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [
      {
        name: 'registrar_reporte',
        description: 'Registra el reporte en la base de datos cuando se han recopilado los campos obligatorios.',
        input_schema: {
          type: 'object' as const,
          properties: {
            tipo: {
              type: 'string',
              enum: TIPOS_VALIDOS,
              description: 'Tipo de problema reportado',
            },
            nombre_lugar: {
              type: 'string',
              description: 'Nombre del comedor o institución educativa',
            },
            ubicacion: {
              type: 'string',
              description: 'Municipio y departamento. Ejemplo: "Riohacha, La Guajira"',
            },
            evidencia: {
              type: 'string',
              description: 'Descripción adicional o file_id de la foto/audio enviada (opcional)',
            },
          },
          required: ['tipo', 'nombre_lugar', 'ubicacion'],
        },
      },
    ],
    messages: historial,
  })

  // Handle tool use
  if (response.stop_reason === 'tool_use') {
    const toolUse = response.content.find((b) => b.type === 'tool_use')
    if (toolUse && toolUse.type === 'tool_use' && toolUse.name === 'registrar_reporte') {
      const campos = toolUse.input as Record<string, string>
      await crearReporte(telefonoId, campos, nombreReportante, telegramUsername)
      await deleteSesion(telefonoId)
      await sendMessage(
        chatId,
        '✅ <b>¡Reporte registrado!</b>\n\nGracias por tu veeduría. Tu reporte ya aparece en el mapa público.\n\nEscribe /nuevo para enviar otro reporte.'
      )
      return
    }
  }

  // Extract text response
  const textoRespuesta = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as Anthropic.TextBlock).text)
    .join('\n')

  // Save updated history (append assistant response)
  historial.push({ role: 'assistant', content: response.content })
  await setSesion(telefonoId, historial)

  if (textoRespuesta) {
    await sendMessage(chatId, textoRespuesta)
  }
}

export async function procesarCallback(chatId: number, telefonoId: string, data: string) {
  // Legacy callback handler - no longer used but kept for compatibility
  if (data === 'omitir_evidencia') {
    await procesarMensaje(chatId, telefonoId, 'omitir evidencia')
  }
}
