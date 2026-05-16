import { NextRequest, NextResponse } from 'next/server'
import { procesarMensaje, procesarCallback } from '@/backend/bot'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Mensaje de texto o foto
    if (body.message) {
      const msg = body.message
      const chatId: number = msg.chat.id
      const telefonoId: string = String(msg.from.id)
      const texto: string = msg.text ?? msg.caption ?? ''
      const fileId: string | undefined = msg.photo
        ? msg.photo[msg.photo.length - 1].file_id
        : msg.video?.file_id

      await procesarMensaje(chatId, telefonoId, texto, fileId)
    }

    // Callback de botón inline
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
