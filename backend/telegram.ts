const BASE = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function fetchTelegramFile(
  fileId: string,
  forceAudio = false
): Promise<{ data: string; mimeType: string } | null> {
  try {
    const fileRes = await fetch(`${BASE}/getFile?file_id=${fileId}`)
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

export async function sendMessage(chatId: number, text: string, options?: object) {
  await fetch(`${BASE}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...options }),
  })
}

export async function sendPhoto(chatId: number, photoUrl: string, caption?: string) {
  await fetch(`${BASE}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, photo: photoUrl, caption }),
  })
}

export function teclado(botones: string[][]) {
  return {
    reply_markup: {
      keyboard: botones.map((fila) => fila.map((texto) => ({ text: texto }))),
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  }
}

export function tecladoInline(botones: { texto: string; data: string }[][]) {
  return {
    reply_markup: {
      inline_keyboard: botones.map((fila) =>
        fila.map((b) => ({ text: b.texto, callback_data: b.data }))
      ),
    },
  }
}
