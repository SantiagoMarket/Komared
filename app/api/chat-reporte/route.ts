import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { GoogleGenerativeAI, FunctionCallingMode, SchemaType, type Content } from '@google/generative-ai'
import { getMunicipios } from '@/backend/bot-report'
import { buildSystemPrompt } from '@/backend/bot-prompt'
import { TIPOS_VALIDOS, TIPOS_CRITICOS } from '@/lib/reportes-config'
import { getSupabaseAdmin } from '@/backend/supabase-admin'
import { notificarNuevoReporte } from '@/backend/notificar-nuevo-reporte'
import { notificarError } from '@/backend/notificar-error'

const schemaBody = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        parts: z.array(z.object({ text: z.string().max(2000) })),
      })
    )
    .min(1)
    .max(50),
})

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const parsed = schemaBody.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const { messages } = parsed.data

  const municipios = await getMunicipios()
  const systemPrompt = buildSystemPrompt(municipios)
  const municipioNames = municipios.map((m) => m.municipio)

  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
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
                  description: 'Municipio exacto de la lista, identificado por el bot',
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
                  description: 'Días que lleva la situación (opcional)',
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

  const history: Content[] = messages.slice(0, -1) as Content[]
  const lastMessage = messages[messages.length - 1]

  const chat = model.startChat({ history })

  let result
  try {
    result = await chat.sendMessage(lastMessage.parts)
  } catch (err) {
    await notificarError('chat-reporte/gemini', err).catch(() => {})
    return NextResponse.json({ reply: 'Lo siento, no pude procesar tu mensaje. Por favor intenta de nuevo 🙏' })
  }

  const response = result.response
  const functionCall = response.candidates?.[0]?.content?.parts?.find((p) => p.functionCall)?.functionCall

  if (functionCall && functionCall.name === 'registrar_reporte') {
    const campos = functionCall.args as Record<string, string>
    const geo = municipios.find(
      (m) => m.municipio.toLowerCase() === (campos.municipio_id ?? '').toLowerCase()
    ) ?? null

    try {
      const { data: reporteData, error } = await getSupabaseAdmin()
        .from('reportes')
        .insert({
          tipo: campos.tipo,
          nombre_lugar: campos.nombre_lugar,
          municipio: geo?.municipio ?? campos.municipio_id ?? null,
          departamento: geo?.departamento ?? null,
          lat: geo?.lat ?? null,
          lng: geo?.lng ?? null,
          canal: 'web',
          estado: TIPOS_CRITICOS.has(campos.tipo) ? 'critico' : 'pendiente',
          personas_afectadas: campos.personas_afectadas ? Number(campos.personas_afectadas) : null,
          tiempo_situacion_dias: campos.tiempo_situacion_dias ? Number(campos.tiempo_situacion_dias) : null,
        })
        .select('id')
        .single()

      if (error) throw error

      notificarNuevoReporte({
        tipo: campos.tipo,
        nombre_lugar: campos.nombre_lugar,
        municipio: geo?.municipio ?? campos.municipio_id ?? null,
        departamento: geo?.departamento ?? null,
        personas_afectadas: campos.personas_afectadas ? Number(campos.personas_afectadas) : null,
        tiempo_situacion_dias: campos.tiempo_situacion_dias ? Number(campos.tiempo_situacion_dias) : null,
        canal: 'web',
      }).catch((err: unknown) => notificarError('chat-reporte/notificarNuevoReporte', err).catch(() => {}))

      return NextResponse.json({
        reply: '✅ ¡Reporte registrado!\n\nGracias por tu veeduría. Tu reporte ya aparece en el mapa público:\n🗺 https://komared.com/mapa',
        done: true,
        reporteId: reporteData.id,
      })
    } catch (err) {
      await notificarError('chat-reporte/insert', err).catch(() => {})
      return NextResponse.json(
        { reply: '⚠️ Hubo un error al guardar tu reporte. Por favor intenta de nuevo.' },
        { status: 500 }
      )
    }
  }

  let reply: string
  try {
    reply = response.text()
  } catch {
    return NextResponse.json({ reply: 'Lo siento, no pude procesar tu mensaje. Por favor intenta de nuevo 🙏' })
  }

  return NextResponse.json({ reply })
}
