export type Reporte = {
  id: string
  tipo: string
  nombre_lugar: string | null
  municipio: string | null
  departamento: string | null
  estado: string
  created_at: string
  personas_afectadas: number | null
  tiempo_situacion_dias: number | null
  lat: number | null
  lng: number | null
}

/** Subconjunto de Reporte necesario para renderizar marcadores en el mapa */
export type ReporteGeo = Pick<
  Reporte,
  'id' | 'tipo' | 'nombre_lugar' | 'municipio' | 'estado' | 'lat' | 'lng'
>

export type FilaMunicipio = {
  municipio: string
  departamento: string
  total: number
  tieneCritico: boolean
  porTipo: Record<string, number>
  reportes: Reporte[]
  totalPersonas: number
  promedioTiempo: number | null
}
