import { GoogleGenerativeAI, FunctionCallingMode, SchemaType, type Content, type Part } from '@google/generative-ai'
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

const SYSTEM_PROMPT = `Eres un asistente de veeduría ciudadana para el monitoreo de comedores comunitarios y el Programa de Alimentación Escolar (PAE) en Colombia. Tu función es recopilar información sobre irregularidades de forma amigable y conversacional, en español colombiano informal.

Debes recopilar exactamente estos campos:
1. tipo: El tipo de problema. Debe ser uno de: comedor_sin_alimentos, comedor_cerrado, comedor_calidad_deficiente, comedor_contratista_ausente, pae_no_entregado, pae_calidad_deficiente, icbf_sin_entrega, otro
2. nombre_lugar: Nombre del comedor o institución educativa
3. ubicacion: Municipio y departamento. Ejemplo: "Riohacha, La Guajira"
4. evidencia: (opcional) descripción adicional, foto o audio

Cuando el usuario diga /start o /nuevo, salúdalo y pídele que describa el problema.
Cuando tengas tipo, nombre_lugar y ubicacion, llama a la función registrar_reporte.
Si el usuario envía una foto o audio, úsalo como evidencia.
Respuestas cortas y directas. No uses menús ni listas de botones.`

function getClient() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
}

async function getSesion(telefonoId: string) {
  const { data } = await getSupabaseAdmin()
    .from('sesiones_bot')
    .select('*')
    .eq('telefono', telefonoId)
    .single()
  return data
}

async function setSesion(telefonoId: string, historial: Content[]) {
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

async function fetchTelegramFile(fileId: string, forceAudio = false): Promise<{ data: string; mimeType: string } | null> {
  try {
    const fileRes = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`
    )
    const fileData = await fileRes.json()
    const filePath: string = fileData.result?.file_path
    if (!filePath) return null

    const res = await fetch(
      `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`
    )
    const buffer = await res.arrayBuffer()
    const data = Buffer.from(buffer).toString('base64')

    let mimeType: string
    if (forceAudio) {
      mimeType = 'audio/ogg'
    } else if (filePath.endsWith('.png')) {
      mimeType = 'image/png'
    } else {
      mimeType = 'image/jpeg'
    }

    return { data, mimeType }
  } catch {
    return null
  }
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
  const historial: Content[] = sesion?.datos_temp?.historial ?? []

  // Build parts for the user turn
  const parts: Part[] = []

  if (fileId) {
    const file = await fetchTelegramFile(fileId, isVoice)
    if (file) {
      parts.push({ inlineData: { data: file.data, mimeType: file.mimeType } })
    }
  }

  const textoFinal = texto.trim()
  if (textoFinal) parts.push({ text: textoFinal })

  if (parts.length === 0) return

  historial.push({ role: 'user', parts })

  const ai = getClient()
  const model = ai.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    tools: [
      {
        functionDeclarations: [
          {
            name: 'registrar_reporte',
            description: 'Registra el reporte en la base de datos cuando se han recopilado los campos obligatorios.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                tipo: {
                  type: SchemaType.STRING,
                  format: 'enum',
                  enum: TIPOS_VALIDOS,
                  description: 'Tipo de problema reportado',
                },
                nombre_lugar: {
                  type: SchemaType.STRING,
                  description: 'Nombre del comedor o institución educativa',
                },
                ubicacion: {
                  type: SchemaType.STRING,
                  description: 'Municipio y departamento. Ejemplo: "Riohacha, La Guajira"',
                },
                evidencia: {
                  type: SchemaType.STRING,
                  description: 'Descripción adicional u observaciones (opcional)',
                },
              },
              required: ['tipo', 'nombre_lugar', 'ubicacion'],
            },
          },
        ],
      },
    ],
    toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },
  })

  const chat = model.startChat({ history: historial.slice(0, -1) })
  const result = await chat.sendMessage(parts)
  const response = result.response

  // Check for function call
  const functionCall = response.candidates?.[0]?.content?.parts?.find((p) => p.functionCall)?.functionCall

  if (functionCall && functionCall.name === 'registrar_reporte') {
    const campos = functionCall.args as Record<string, string>
    await crearReporte(telefonoId, campos, nombreReportante, telegramUsername)
    await deleteSesion(telefonoId)
    await sendMessage(
      chatId,
      '✅ <b>¡Reporte registrado!</b>\n\nGracias por tu veeduría. Tu reporte ya aparece en el mapa público.\n\nEscribe /nuevo para enviar otro reporte.'
    )
    return
  }

  const textoRespuesta = response.text()

  // Save updated history
  const modelContent: Content = {
    role: 'model',
    parts: response.candidates?.[0]?.content?.parts ?? [{ text: textoRespuesta }],
  }
  historial.push(modelContent)
  await setSesion(telefonoId, historial)

  if (textoRespuesta) {
    await sendMessage(chatId, textoRespuesta)
  }
}

export async function procesarCallback(chatId: number, telefonoId: string, data: string) {
  if (data === 'omitir_evidencia') {
    await procesarMensaje(chatId, telefonoId, 'omitir evidencia')
  }
}
