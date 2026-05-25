'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'

const MapaHistorico = dynamic(() => import('@/components/MapaHistorico'), { ssr: false })

type Reporte = {
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

type FilaMunicipio = {
  municipio: string
  departamento: string
  total: number
  tieneCritico: boolean
  porTipo: Record<string, number>
  reportes: Reporte[]
  totalPersonas: number
  promedioTiempo: number | null
}

const ETIQUETAS: Record<string, string> = {
  comedor_sin_alimentos: 'Sin alimentos',
  comedor_cerrado: 'Cerrado',
  comedor_calidad_deficiente: 'Calidad deficiente',
  comedor_contratista_ausente: 'Contratista ausente',
  pae_no_entregado: 'PAE no entregado',
  pae_calidad_deficiente: 'PAE calidad',
  icbf_sin_entrega: 'ICBF sin entrega',
  desnutricion_cronica: 'Desnutrición crónica',
  deficit_alimentario: 'Déficit alimentario',
  otro: 'Otro',
}

const COLORES_TIPO: Record<string, string> = {
  comedor_sin_alimentos: 'bg-red-500',
  comedor_cerrado: 'bg-orange-500',
  comedor_calidad_deficiente: 'bg-yellow-500',
  comedor_contratista_ausente: 'bg-purple-500',
  pae_no_entregado: 'bg-blue-500',
  pae_calidad_deficiente: 'bg-cyan-500',
  icbf_sin_entrega: 'bg-pink-500',
  desnutricion_cronica: 'bg-red-700',
  deficit_alimentario: 'bg-amber-600',
  otro: 'bg-gray-500',
}

const COLORES_ESTADO: Record<string, string> = {
  pendiente: 'bg-yellow-900 text-yellow-300',
  critico:   'bg-red-900 text-red-300',
  en_curso:  'bg-blue-900 text-blue-300',
  solucionado: 'bg-gray-800 text-gray-400',
}

const LABEL_ESTADO: Record<string, string> = {
  pendiente: 'Pendiente',
  critico: 'Crítico',
  en_curso: 'En curso',
  solucionado: 'Solucionado',
}

const DEPARTAMENTOS_PRIORITARIOS = ['La Guajira', 'Chocó', 'Magdalena', 'Cesar']

type Tab = 'reportes' | 'tiempo' | 'personas'

export default function Historico() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState<string | null>(null)
  const [filtroDepartamento, setFiltroDepartamento] = useState<string>('todos')
  const [tab, setTab] = useState<Tab>('reportes')

  useEffect(() => {
    async function cargar() {
      const res = await fetch('/api/reportes')
      if (res.status === 401) {
        window.location.href = '/login?next=/historico'
        return
      }
      if (!res.ok) return
      setReportes(await res.json())
      setCargando(false)
    }
    cargar()
  }, [])

  const ranking = useMemo<FilaMunicipio[]>(() => {
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

    // Calcular promedio de tiempo por municipio
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
      // Críticos primero, luego por total de reportes
      filas.sort((a, b) => {
        if (a.tieneCritico !== b.tieneCritico) return a.tieneCritico ? -1 : 1
        return b.total - a.total
      })
    } else if (tab === 'tiempo') {
      // Por tiempo promedio descendente — solo los que tienen datos
      filas = filas.filter((f) => f.promedioTiempo !== null)
      filas.sort((a, b) => (b.promedioTiempo ?? 0) - (a.promedioTiempo ?? 0))
    } else {
      // Por personas afectadas descendente — solo los que tienen datos
      filas = filas.filter((f) => f.totalPersonas > 0)
      filas.sort((a, b) => b.totalPersonas - a.totalPersonas)
    }

    return filas
  }, [reportes, filtroDepartamento, tab])

  const maxTotal = ranking[0]?.total ?? 1
  const maxTiempo = ranking[0]?.promedioTiempo ?? 1
  const maxPersonas = ranking[0]?.totalPersonas ?? 1

  const departamentos = useMemo(() => {
    const deps = new Set(reportes.map((r) => r.departamento).filter(Boolean) as string[])
    return Array.from(deps).sort()
  }, [reportes])

  const detalleActual = municipioSeleccionado
    ? ranking.find((f) => f.municipio === municipioSeleccionado) ?? null
    : null

  const totalGlobal = reportes.length
  const municipiosAfectados = new Set(reportes.map((r) => r.municipio).filter(Boolean)).size
  const totalPersonasGlobal = reportes.reduce((acc, r) => acc + (r.personas_afectadas ?? 0), 0)

  const depMasCritico = useMemo(() => {
    const conteo = new Map<string, number>()
    for (const r of reportes) {
      if (r.departamento) conteo.set(r.departamento, (conteo.get(r.departamento) ?? 0) + 1)
    }
    let max = 0; let dep = '—'
    conteo.forEach((v, k) => { if (v > max) { max = v; dep = k } })
    return dep
  }, [reportes])

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="px-6 py-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
          <h1 className="font-semibold text-sm tracking-wide uppercase">Reportes Históricos</h1>
        </div>
        <a href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Volver al dashboard
        </a>
      </header>

      {cargando ? (
        <p className="text-gray-500 text-center py-32">Cargando datos...</p>
      ) : (
        <div className="p-6 space-y-6">

          {/* Tarjetas resumen */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Total reportes</p>
              <p className="text-3xl font-bold text-white">{totalGlobal}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Municipios afectados</p>
              <p className="text-3xl font-bold text-white">{municipiosAfectados}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Personas afectadas</p>
              <p className="text-3xl font-bold text-amber-400">
                {totalPersonasGlobal > 0 ? totalPersonasGlobal.toLocaleString('es-CO') : '—'}
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Departamento más crítico</p>
              <p className="text-2xl font-bold text-red-400">{depMasCritico}</p>
            </div>
          </div>

          {/* Mapa histórico */}
          <MapaHistorico
            reportes={reportes.filter((r) =>
              filtroDepartamento === 'todos' || r.departamento === filtroDepartamento
            )}
          />

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
            <button
              onClick={() => { setTab('reportes'); setMunicipioSeleccionado(null) }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === 'reportes' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Por reportes
            </button>
            <button
              onClick={() => { setTab('tiempo'); setMunicipioSeleccionado(null) }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === 'tiempo' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Por tiempo promedio
            </button>
            <button
              onClick={() => { setTab('personas'); setMunicipioSeleccionado(null) }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === 'personas' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Por personas afectadas
            </button>
          </div>

          <div className="grid grid-cols-5 gap-6">
            {/* Ranking */}
            <div className="col-span-3 bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-300">
                  {tab === 'reportes' ? 'Ranking por municipio' : tab === 'tiempo' ? 'Ranking por tiempo en situación' : 'Ranking por personas afectadas'}
                </h2>
                <select
                  value={filtroDepartamento}
                  onChange={(e) => { setFiltroDepartamento(e.target.value); setMunicipioSeleccionado(null) }}
                  className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none"
                >
                  <option value="todos">Todos los departamentos</option>
                  {DEPARTAMENTOS_PRIORITARIOS.map((d) => (
                    <option key={d} value={d}>⚠ {d}</option>
                  ))}
                  {departamentos.filter((d) => !DEPARTAMENTOS_PRIORITARIOS.includes(d)).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {ranking.length === 0 ? (
                <p className="text-gray-600 text-sm py-8 text-center">
                  {tab === 'tiempo'
                    ? 'Sin datos de tiempo reportados para este filtro.'
                    : tab === 'personas'
                    ? 'Sin datos de personas afectadas para este filtro.'
                    : 'Sin reportes para este filtro.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {ranking.map((fila, i) => {
                    const seleccionado = municipioSeleccionado === fila.municipio
                    const valorBarra = tab === 'reportes'
                      ? (fila.total / maxTotal) * 100
                      : tab === 'tiempo'
                      ? ((fila.promedioTiempo ?? 0) / maxTiempo) * 100
                      : (fila.totalPersonas / maxPersonas) * 100

                    return (
                      <button
                        key={fila.municipio}
                        onClick={() => setMunicipioSeleccionado(seleccionado ? null : fila.municipio)}
                        className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${seleccionado ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                      >
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="text-gray-500 text-xs w-5 text-right">{i + 1}</span>
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <span className="text-white text-sm font-medium truncate">{fila.municipio}</span>
                            <span className="text-gray-500 text-xs">{fila.departamento}</span>
                            {fila.tieneCritico && tab === 'reportes' && (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-red-900/50 text-red-400 font-medium">Crítico</span>
                            )}
                          </div>
                          <span className="text-white font-bold text-sm shrink-0">
                            {tab === 'reportes'
                              ? `${fila.total} rep.`
                              : tab === 'tiempo'
                              ? `${fila.promedioTiempo} días`
                              : `${fila.totalPersonas.toLocaleString('es-CO')} personas`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pl-8">
                          <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${tab === 'tiempo' ? 'bg-amber-500' : tab === 'personas' ? 'bg-orange-500' : fila.tieneCritico ? 'bg-red-500' : 'bg-blue-500'}`}
                              style={{ width: `${valorBarra}%` }}
                            />
                          </div>
                        </div>
                        {tab === 'reportes' && (
                          <div className="flex gap-1.5 pl-8 mt-1.5 flex-wrap">
                            {Object.entries(fila.porTipo)
                              .sort(([, a], [, b]) => b - a)
                              .map(([tipo, n]) => (
                                <span key={tipo} className="flex items-center gap-1 text-xs text-gray-400">
                                  <span className={`w-1.5 h-1.5 rounded-full ${COLORES_TIPO[tipo] ?? 'bg-gray-500'}`} />
                                  {ETIQUETAS[tipo] ?? tipo} ({n})
                                </span>
                              ))}
                          </div>
                        )}
                        {tab === 'tiempo' && fila.totalPersonas > 0 && (
                          <p className="pl-8 mt-1 text-xs text-gray-500">
                            {fila.totalPersonas.toLocaleString('es-CO')} personas afectadas
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Panel de detalle */}
            <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
              {!detalleActual ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                    <span className="text-gray-600 text-lg">↑</span>
                  </div>
                  <p className="text-gray-500 text-sm">Selecciona un municipio<br />para ver sus reportes</p>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="mb-4">
                    <h2 className="font-bold text-white text-base">{detalleActual.municipio}</h2>
                    <p className="text-gray-400 text-xs">{detalleActual.departamento} · {detalleActual.total} reportes</p>
                  </div>

                  {/* Métricas de impacto */}
                  {(detalleActual.totalPersonas > 0 || detalleActual.promedioTiempo !== null) && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {detalleActual.totalPersonas > 0 && (
                        <div className="bg-gray-800 rounded-lg p-3">
                          <p className="text-gray-500 text-xs mb-1">Personas afectadas</p>
                          <p className="text-amber-400 font-bold text-lg">{detalleActual.totalPersonas.toLocaleString('es-CO')}</p>
                        </div>
                      )}
                      {detalleActual.promedioTiempo !== null && (
                        <div className="bg-gray-800 rounded-lg p-3">
                          <p className="text-gray-500 text-xs mb-1">Tiempo promedio</p>
                          <p className="text-red-400 font-bold text-lg">{detalleActual.promedioTiempo} días</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Distribución por tipo */}
                  <div className="space-y-1.5 mb-4">
                    {Object.entries(detalleActual.porTipo)
                      .sort(([, a], [, b]) => b - a)
                      .map(([tipo, n]) => (
                        <div key={tipo} className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${COLORES_TIPO[tipo] ?? 'bg-gray-500'}`} />
                          <span className="text-gray-300 text-xs flex-1 truncate">{ETIQUETAS[tipo] ?? tipo}</span>
                          <span className="text-white text-xs font-medium">{n}</span>
                          <div className="w-16 bg-gray-800 rounded-full h-1">
                            <div
                              className={`h-full rounded-full ${COLORES_TIPO[tipo] ?? 'bg-gray-500'}`}
                              style={{ width: `${(n / detalleActual.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Lista de reportes */}
                  <div className="border-t border-gray-800 pt-3 flex-1 overflow-y-auto space-y-2">
                    {detalleActual.reportes.map((r) => (
                      <div key={r.id} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${COLORES_TIPO[r.tipo] ?? 'bg-gray-500'}`} />
                            <span className="text-white text-xs font-medium">{ETIQUETAS[r.tipo] ?? r.tipo}</span>
                          </div>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${COLORES_ESTADO[r.estado] ?? 'bg-gray-700 text-gray-400'}`}>
                            {LABEL_ESTADO[r.estado] ?? r.estado}
                          </span>
                        </div>
                        {r.nombre_lugar && (
                          <p className="text-gray-400 text-xs truncate">{r.nombre_lugar}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <p className="text-gray-600 text-xs">
                            {new Date(r.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                          {r.personas_afectadas && (
                            <span className="text-amber-500 text-xs">{r.personas_afectadas} personas</span>
                          )}
                          {r.tiempo_situacion_dias && (
                            <span className="text-red-400 text-xs">{r.tiempo_situacion_dias} días</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
