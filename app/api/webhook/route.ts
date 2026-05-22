import { NextRequest, NextResponse } from 'next/server'
import { procesarMensaje } from '@/backend/bot'
import { sendMessage } from '@/backend/telegram'
import { notificarError } from '@/backend/notificar-error'

export const dynamic = 'force-dynamic'

async function fetchTelegramFile(
  fileId: string,
  forceAudio = false
): Promise<{ data: string; mimeType: string } | null> {
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

    let mimeType: string
    if (forceAudio) {
      mimeType = 'audio/ogg'
    } else if (filePath.endsWith('.png')) {
      mimeType = 'image/png'
    } else {
      mimeType = 'image/jpeg'
    }

    return { data: Buffer.from(buffer).toString('base64'), mimeType }
  } catch {
    return null
  }
}

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

      const media = fileId ? await fetchTelegramFile(fileId, isVoice) ?? undefined : undefined

      await procesarMensaje({
        telefonoId,
        texto,
        sendReply: (text) => sendMessage(chatId, text),
        canal: 'telegram',
        media,
        nombreReportante,
        telegramUsername,
      })
    }

    if (body.callback_query) {
      const cb = body.callback_query
      const chatId: number = cb.message.chat.id
      const telefonoId: string = String(cb.from.id)
      if (cb.data === 'omitir_evidencia') {
        await procesarMensaje({
          telefonoId,
          texto: 'omitir evidencia',
          sendReply: (text) => sendMessage(chatId, text),
          canal: 'telegram',
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await notificarError('webhook/telegram', err)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
