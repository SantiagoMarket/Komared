import { NextRequest, NextResponse } from 'next/server'
import { procesarMensaje } from '@/backend/bot'
import { enviarMensaje, descargarMedia } from '@/backend/whatsapp'
import { notificarError } from '@/backend/notificar-error'

export const dynamic = 'force-dynamic'

// Meta verifica el webhook con un GET enviando hub.challenge
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_SECRET) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ ok: false }, { status: 403 })
}

export async function POST(req: NextRequest) {
  // Meta no envía un header de firma por defecto en Cloud API —
  // verificamos que el payload sea de WhatsApp por su estructura.
  try {
    const body = await req.json()

    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field !== 'messages') continue

        const value = change.value
        const messages: WhatsAppMessage[] = value.messages ?? []

        for (const msg of messages) {
          await procesarWhatsApp(msg)
        }
      }
    }

    // Siempre 200 — Meta reintenta indefinidamente si recibe 500
    return NextResponse.json({ ok: true })
  } catch (err) {
    // Error de parsing del body o estructura inesperada — sí notificar
    await notificarError('webhook/whatsapp', err)
    return NextResponse.json({ ok: true }) // 200 igual para evitar reintentos
  }
}

type WhatsAppMessage = {
  from: string
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'voice'
  text?: { body: string }
  image?: { id: string; mime_type: string }
  audio?: { id: string; mime_type: string }
  video?: { id: string; mime_type: string }
  voice?: { id: string; mime_type: string }
}

async function procesarWhatsApp(msg: WhatsAppMessage) {
  const telefonoId = msg.from
  const texto = msg.text?.body ?? ''

  let media: { data: string; mimeType: string } | undefined

  const mediaItem = msg.image ?? msg.audio ?? msg.voice ?? msg.video
  if (mediaItem) {
    media = await descargarMedia(mediaItem.id) ?? undefined
  }

  try {
    await procesarMensaje({
      telefonoId,
      texto,
      sendReply: (text) => enviarMensaje(telefonoId, text),
      canal: 'whatsapp',
      media,
    })
  } catch (err) {
    const msg429 = err instanceof Error && err.message.includes('429')
    if (msg429) {
      // Cuota de Gemini agotada — avisar al usuario, no enviar email de error
      console.warn('[webhook/whatsapp] Gemini 429 - cuota agotada')
      await enviarMensaje(telefonoId, '⏳ El asistente está temporalmente ocupado. Por favor intenta en unos minutos.')
    } else {
      // Error inesperado — notificar al admin
      await notificarError('webhook/whatsapp procesarMensaje', err)
    }
  }
}
