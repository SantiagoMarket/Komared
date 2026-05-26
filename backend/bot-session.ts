import { type Content } from '@google/generative-ai'
import { getSupabaseBot } from '@/backend/supabase-bot'

export async function getSesion(telefonoId: string) {
  const { data } = await getSupabaseBot()
    .from('sesiones_bot')
    .select('*')
    .eq('telefono', telefonoId)
    .single()
  return data
}

export async function setSesion(
  telefonoId: string,
  historial: Content[],
  mediaGuardada?: { url: string; mimeType: string }
) {
  const sesionActual = await getSesion(telefonoId)
  const mediaExistente = sesionActual?.datos_temp?.media ?? null

  await getSupabaseBot().from('sesiones_bot').upsert(
    {
      telefono: telefonoId,
      datos_temp: {
        historial,
        media: mediaGuardada ?? mediaExistente,
      },
      paso_actual: 'conversando',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'telefono' }
  )
}

export async function deleteSesion(telefonoId: string) {
  await getSupabaseBot().from('sesiones_bot').delete().eq('telefono', telefonoId)
}

export async function marcarCompletado(telefonoId: string, reporteId: string) {
  await getSupabaseBot().from('sesiones_bot').upsert(
    {
      telefono: telefonoId,
      datos_temp: { reporte_id: reporteId },
      paso_actual: 'completado',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'telefono' }
  )
}
