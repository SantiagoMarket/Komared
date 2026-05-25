import { notificarError } from '@/backend/notificar-error'

const GRAPH = 'https://graph.facebook.com/v21.0'

function token() {
  return process.env.WHATSAPP_ACCESS_TOKEN!
}

export async function enviarMensaje(to: string, text: string) {
  const res = await fetch(`${GRAPH}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    await notificarError(`enviarMensaje → ${to} (HTTP ${res.status})`, new Error(JSON.stringify(body)))
  }
}

export async function descargarMedia(
  mediaId: string
): Promise<{ data: string; mimeType: string } | null> {
  try {
    const metaRes = await fetch(`${GRAPH}/${mediaId}`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
    const meta = await metaRes.json()
    const url: string = meta.url
    if (!url) return null

    const fileRes = await fetch(url, {
      headers: { Authorization: `Bearer ${token()}` },
    })
    const buffer = await fileRes.arrayBuffer()
    const mimeType: string = meta.mime_type ?? 'application/octet-stream'

    return { data: Buffer.from(buffer).toString('base64'), mimeType }
  } catch {
    return null
  }
}
