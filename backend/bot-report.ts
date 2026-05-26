import { getSupabaseBot } from '@/backend/supabase-bot'
import { notificarNuevoReporte } from '@/backend/notificar-nuevo-reporte'
import { notificarError } from '@/backend/notificar-error'
import { TIPOS_CRITICOS } from '@/lib/reportes-config'

export type Municipio = { municipio: string; departamento: string; lat: number; lng: number }

// Cache en memoria — se carga una vez por instancia serverless
let municipiosCache: Municipio[] | null = null

export async function getMunicipios(): Promise<Municipio[]> {
  if (municipiosCache) return municipiosCache
  const { data } = await getSupabaseBot()
    .from('municipios')
    .select('municipio, departamento, lat, lng')
    .order('departamento')
    .order('municipio')
  municipiosCache = (data as Municipio[]) ?? []
  return municipiosCache
}

export async function crearReporte(
  telefonoId: string,
  campos: Record<string, string>,
  municipios: Municipio[],
  canal: 'whatsapp',
  nombreReportante?: string,
  mediaGuardada?: { url: string; mimeType: string }
): Promise<string> {
  const geo = municipios.find(
    (m) => m.municipio.toLowerCase() === (campos.municipio_id ?? '').toLowerCase()
  ) ?? null

  const { data: reporteData, error } = await getSupabaseBot().from('reportes').insert({
    telefono_reporte: telefonoId,
    nombre_reportante: nombreReportante ?? null,
    tipo: campos.tipo,
    nombre_lugar: campos.nombre_lugar,
    municipio: geo?.municipio ?? campos.municipio_id ?? null,
    departamento: geo?.departamento ?? null,
    lat: geo?.lat ?? null,
    lng: geo?.lng ?? null,
    canal,
    estado: TIPOS_CRITICOS.has(campos.tipo) ? 'critico' : 'pendiente',
    personas_afectadas: campos.personas_afectadas ? Number(campos.personas_afectadas) : null,
    tiempo_situacion_dias: campos.tiempo_situacion_dias ? Number(campos.tiempo_situacion_dias) : null,
    media_url: mediaGuardada?.url ?? null,
    media_mime_type: mediaGuardada?.mimeType ?? null,
  }).select('id').single()

  if (error) throw new Error(`Error al guardar reporte: ${error.message}`)

  notificarNuevoReporte({
    tipo: campos.tipo,
    nombre_lugar: campos.nombre_lugar,
    municipio: geo?.municipio ?? campos.municipio_id ?? null,
    departamento: geo?.departamento ?? null,
    personas_afectadas: campos.personas_afectadas ? Number(campos.personas_afectadas) : null,
    tiempo_situacion_dias: campos.tiempo_situacion_dias ? Number(campos.tiempo_situacion_dias) : null,
    canal,
  }).catch((err) => notificarError('crearReporte/notificarNuevoReporte', err))

  return reporteData.id as string
}
