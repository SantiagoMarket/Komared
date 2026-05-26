import { getSupabaseBot } from '@/backend/supabase-bot'
import { getSupabaseAdmin } from '@/backend/supabase-admin'

export async function subirMedia(
  telefonoId: string,
  media: { data: string; mimeType: string }
): Promise<string | null> {
  const ext = media.mimeType.split('/')[1]?.split(';')[0] ?? 'bin'
  const path = `${telefonoId}/${Date.now()}.${ext}`
  const buffer = Buffer.from(media.data, 'base64')

  const { error } = await getSupabaseBot()
    .storage.from('reportes-media')
    .upload(path, buffer, { contentType: media.mimeType, upsert: false })

  if (error) {
    console.error(`[subirMedia] ERROR path=${path} mensaje="${error.message}" statusCode=${(error as { statusCode?: number }).statusCode ?? '?'}`)
    return null
  }

  // Bucket privado — guardamos el path, no la URL pública
  return path
}

export async function vincularMedia(telefono: string, reporteId: string) {
  const cincoMinAtras = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  await getSupabaseAdmin()
    .from('reportes_media')
    .update({ reporte_id: reporteId })
    .eq('telefono', telefono)
    .is('reporte_id', null)
    .gte('created_at', cincoMinAtras)
}
