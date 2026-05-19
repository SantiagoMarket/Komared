import { NextRequest, NextResponse } from 'next/server'
import { procesarMensaje, procesarCallback } from '@/backend/bot'
import { notificarError } from '@/backend/notificar-error'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  try {
    const body = await req.json()

    if (body.message) {
      const msg = body.message
      const chatId: number = msg.chat.id
      const telefonoId: string = String(msg.from.id)
      const texto: string = msg.text ?? msg.caption ?? ''
      const nombreReportante: string = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ')
      const telegramUsername: string | undefined = msg.from.username
      const isVoice = !!(msg.voice || msg.audio)
      const fileId: string | undefined = msg.photo
        ? msg.photo[msg.photo.length - 1].file_id
        : msg.video?.file_id ?? msg.voice?.file_id ?? msg.audio?.file_id

      await procesarMensaje(chatId, telefonoId, texto, fileId, nombreReportante, telegramUsername, isVoice)
    }

    if (body.callback_query) {
      const cb = body.callback_query
      const chatId: number = cb.message.chat.id
      const telefonoId: string = String(cb.from.id)
      await procesarCallback(chatId, telefonoId, cb.data)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await notificarError('webhook/telegram', err)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
