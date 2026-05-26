import type { Reporte, FilaMunicipio } from '@/types/reportes'

export type Tab = 'reportes' | 'tiempo' | 'personas'

export function calcularRanking(
  reportes: Reporte[],
  filtroDepartamento: string,
  tab: Tab
): FilaMunicipio[] {
  const mapa = new Map<string, FilaMunicipio>()

  for (const r of reportes) {
    if (!r.municipio) continue
    if (!mapa.has(r.municipio)) {
      mapa.set(r.municipio, {
        municipio: r.municipio,
        departamento: r.departamento ?? '—',
        total: 0,
        tieneCritico: false,
        porTipo: {},
        reportes: [],
        totalPersonas: 0,
        promedioTiempo: null,
      })
    }
    const fila = mapa.get(r.municipio)!
    fila.total++
    if (r.estado === 'critico') fila.tieneCritico = true
    fila.porTipo[r.tipo] = (fila.porTipo[r.tipo] ?? 0) + 1
    fila.reportes.push(r)
    if (r.personas_afectadas) fila.totalPersonas += r.personas_afectadas
  }

  for (const fila of mapa.values()) {
    const conTiempo = fila.reportes.filter((r) => r.tiempo_situacion_dias !== null)
    if (conTiempo.length > 0) {
      const suma = conTiempo.reduce((acc, r) => acc + (r.tiempo_situacion_dias ?? 0), 0)
      fila.promedioTiempo = Math.round(suma / conTiempo.length)
    }
  }

  let filas = Array.from(mapa.values())

  if (filtroDepartamento !== 'todos') {
    filas = filas.filter((f) => f.departamento === filtroDepartamento)
  }

  if (tab === 'reportes') {
    filas.sort((a, b) => {
      if (a.tieneCritico !== b.tieneCritico) return a.tieneCritico ? -1 : 1
      return b.total - a.total
    })
  } else if (tab === 'tiempo') {
    filas = filas.filter((f) => f.promedioTiempo !== null)
    filas.sort((a, b) => (b.promedioTiempo ?? 0) - (a.promedioTiempo ?? 0))
  } else {
    filas = filas.filter((f) => f.totalPersonas > 0)
    filas.sort((a, b) => b.totalPersonas - a.totalPersonas)
  }

  return filas
}

export function calcularDepMasCritico(reportes: Reporte[]): string {
  const conteo = new Map<string, number>()
  for (const r of reportes) {
    if (r.departamento) conteo.set(r.departamento, (conteo.get(r.departamento) ?? 0) + 1)
  }
  let max = 0
  let dep = '—'
  conteo.forEach((v, k) => { if (v > max) { max = v; dep = k } })
  return dep
}
