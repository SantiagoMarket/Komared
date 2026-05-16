import { NextRequest, NextResponse } from 'next/server'
import { procesarMensaje, procesarCallback } from '@/backend/bot'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.message) {
      const msg = body.message
      const chatId: number = msg.chat.id
      const telefonoId: string = String(msg.from.id)
      const texto: string = msg.text ?? msg.caption ?? ''
      const nombreReportante: string = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ')
      const telegramUsername: string | undefined = msg.from.username
      const fileId: string | undefined = msg.photo
        ? msg.photo[msg.photo.length - 1].file_id
        : msg.video?.file_id

      await procesarMensaje(chatId, telefonoId, texto, fileId, nombreReportante, telegramUsername)
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
    console.error('Webhook error:', msg)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
