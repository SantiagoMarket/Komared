import { GoogleGenerativeAI, FunctionCallingMode, SchemaType, type Content, type Part } from '@google/generative-ai'
import { getSupabaseBot } from '@/backend/supabase-bot'
import { TIPOS_VALIDOS } from '@/lib/reportes-config'
import { getSupabaseAdmin } from '@/backend/supabase-admin'
import { getSesion, setSesion, deleteSesion, marcarCompletado } from '@/backend/bot-session'
import { subirMedia, vincularMedia } from '@/backend/bot-media'
import { getMunicipios, crearReporte } from '@/backend/bot-report'
import { buildSystemPrompt } from '@/backend/bot-prompt'

function getClient() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
}

export async function procesarMensaje({
  telefonoId,
  texto,
  sendReply,
  canal,
  media,
  nombreReportante,
}: {
  telefonoId: string
  texto: string
  sendReply: (text: string) => Promise<void>
  canal: 'whatsapp'
  media?: { data: string; mimeType: string }
  nombreReportante?: string
}) {
  if (texto === '/cancelar') {
    await deleteSesion(telefonoId)
    await sendReply('❌ Reporte cancelado. Escribe /nuevo para empezar de nuevo.')
    return
  }

  if (texto === '/start' || texto === '/nuevo') {
    await deleteSesion(telefonoId)
  }

  let sesion = await getSesion(telefonoId)
  if (sesion) {
    if (sesion.paso_actual === 'guardando') return
    if (sesion.paso_actual === 'completado') {
      const hace60s = Date.now() - 60 * 1000
      if (new Date(sesion.updated_at).getTime() > hace60s) {
        // Foto extra del álbum — vincularla directamente al reporte ya guardado
        if (media) {
          const url = await subirMedia(telefonoId, media)
          const reporteId: string | undefined = sesion.datos_temp?.reporte_id
          if (url && reporteId) {
            await getSupabaseAdmin()
              .from('reportes_media')
              .insert({ reporte_id: reporteId, telefono: telefonoId, url, mime_type: media.mimeType })
          }
        }
        return
      }
      await deleteSesion(telefonoId)
      sesion = null
    } else {
      const hace2h = Date.now() - 2 * 60 * 60 * 1000
      if (new Date(sesion.updated_at).getTime() < hace2h) {
        await deleteSesion(telefonoId)
        sesion = null
      }
    }
  }

  const historial: Content[] = sesion?.datos_temp?.historial ?? []
  let mediaGuardada: { url: string; mimeType: string } | null = sesion?.datos_temp?.media ?? null

  const municipios = await getMunicipios()
  const systemPrompt = buildSystemPrompt(municipios)
  const municipioNames = municipios.map((m) => m.municipio)

  const parts: Part[] = []

  if (media) {
    parts.push({ inlineData: { data: media.data, mimeType: media.mimeType } })
    const url = await subirMedia(telefonoId, media)
    if (url) {
      mediaGuardada = { url, mimeType: media.mimeType }
      await getSupabaseAdmin()
        .from('reportes_media')
        .insert({ telefono: telefonoId, url, mime_type: media.mimeType })
    }
  }

  const textoFinal = texto.trim()
  if (textoFinal) parts.push({ text: textoFinal })

  if (parts.length === 0) return

  historial.push({ role: 'user', parts })

  const ai = getClient()
  const model = ai.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemPrompt,
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
                  enum: [...TIPOS_VALIDOS],
                  description: 'Tipo de problema reportado',
                },
                nombre_lugar: {
                  type: SchemaType.STRING,
                  description: 'Nombre del comedor o institución educativa',
                },
                municipio_id: {
                  type: SchemaType.STRING,
                  format: 'enum',
                  enum: municipioNames,
                  description: 'Municipio exacto de la lista, identificado por el bot según lo que dijo el usuario',
                },
                evidencia: {
                  type: SchemaType.STRING,
                  description: 'Descripción adicional u observaciones (opcional)',
                },
                personas_afectadas: {
                  type: SchemaType.NUMBER,
                  description: 'Número aproximado de personas afectadas (opcional)',
                },
                tiempo_situacion_dias: {
                  type: SchemaType.NUMBER,
                  description: 'Hace cuántos días lleva pasando la situación (opcional, convertir semanas a días)',
                },
              },
              required: ['tipo', 'nombre_lugar', 'municipio_id'],
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

  const functionCall = response.candidates?.[0]?.content?.parts?.find((p) => p.functionCall)?.functionCall

  if (functionCall && functionCall.name === 'registrar_reporte') {
    const campos = functionCall.args as Record<string, string>
    try {
      // Lock atómico: solo la primera invocación concurrente puede guardar
      if (sesion !== null) {
        const { data: locked } = await getSupabaseBot()
          .from('sesiones_bot')
          .update({ paso_actual: 'guardando', updated_at: new Date().toISOString() })
          .eq('telefono', telefonoId)
          .or('paso_actual.eq.conversando,paso_actual.is.null')
          .select('id')
        if (!locked || locked.length === 0) return
      }

      const reporteId = await crearReporte(telefonoId, campos, municipios, canal, nombreReportante, mediaGuardada ?? undefined)
      await vincularMedia(telefonoId, reporteId)
      await marcarCompletado(telefonoId, reporteId)
      const esDemo = process.env.BOT_TABLA_REPORTES === 'reportes_prueba'
      const urlMapa = esDemo
        ? 'https://komared.com/demo/mapa'
        : 'https://komared.com/mapa'
      await sendReply(
        `✅ ¡Reporte registrado!\n\nGracias por tu veeduría. Tu reporte ya aparece en el mapa público:\n🗺 ${urlMapa}`
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Error guardando reporte:', msg)
      await sendReply('⚠️ Hubo un error al guardar tu reporte. Por favor intenta de nuevo con /nuevo.')
    }
    return
  }

  const blockReason = response.promptFeedback?.blockReason
  if (blockReason || !response.candidates?.length) {
    console.error(`[Gemini] Respuesta bloqueada. blockReason=${blockReason ?? 'sin candidatos'}`)
    await sendReply('Lo siento, no pude procesar tu mensaje en este momento. Por favor intenta de nuevo 🙏')
    return
  }

  let textoRespuesta: string
  try {
    textoRespuesta = response.text()
  } catch (err) {
    console.error('[Gemini] Error al leer texto de respuesta:', err)
    await sendReply('Lo siento, no pude procesar tu mensaje en este momento. Por favor intenta de nuevo 🙏')
    return
  }

  const modelContent: Content = {
    role: 'model',
    parts: response.candidates?.[0]?.content?.parts ?? [{ text: textoRespuesta }],
  }
  historial.push(modelContent)
  await setSesion(telefonoId, historial, mediaGuardada ?? undefined)

  if (textoRespuesta) {
    await sendReply(textoRespuesta)
  }
}
