'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

type Reporte = {
  id: string
  tipo: string
  nombre_lugar: string | null
  municipio: string | null
  departamento: string | null
  estado: string
  created_at: string
}

type FilaMunicipio = {
  municipio: string
  departamento: string
  total: number
  porTipo: Record<string, number>
  reportes: Reporte[]
}

const ETIQUETAS: Record<string, string> = {
  comedor_sin_alimentos: 'Sin alimentos',
  comedor_cerrado: 'Cerrado',
  comedor_calidad_deficiente: 'Calidad deficiente',
  comedor_contratista_ausente: 'Contratista ausente',
  pae_no_entregado: 'PAE no entregado',
  pae_calidad_deficiente: 'PAE calidad',
  icbf_sin_entrega: 'ICBF sin entrega',
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
  otro: 'bg-gray-500',
}

const COLORES_ESTADO: Record<string, string> = {
  aprobado: 'bg-green-900 text-green-300',
  critico: 'bg-red-900 text-red-300',
  resuelto: 'bg-gray-800 text-gray-400',
  pendiente: 'bg-yellow-900 text-yellow-300',
  en_revision: 'bg-blue-900 text-blue-300',
}

const DEPARTAMENTOS_PRIORITARIOS = ['La Guajira', 'Chocó', 'Magdalena', 'Cesar']

export default function Historico() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState<string | null>(null)
  const [filtroDepartamento, setFiltroDepartamento] = useState<string>('todos')

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('reportes')
        .select('id, tipo, nombre_lugar, municipio, departamento, estado, created_at')
        .order('created_at', { ascending: false })
      setReportes((data as Reporte[]) ?? [])
      setCargando(false)
    }
    cargar()
  }, [])

  const ranking = useMemo<FilaMunicipio[]>(() => {
    const mapa = new Map<string, FilaMunicipio>()

    for (const r of reportes) {
      if (!r.municipio) continue
      const key = r.municipio
      if (!mapa.has(key)) {
        mapa.set(key, {
          municipio: r.municipio,
          departamento: r.departamento ?? '—',
          total: 0,
          porTipo: {},
          reportes: [],
        })
      }
      const fila = mapa.get(key)!
      fila.total++
      fila.porTipo[r.tipo] = (fila.porTipo[r.tipo] ?? 0) + 1
      fila.reportes.push(r)
    }

    let filas = Array.from(mapa.values()).sort((a, b) => b.total - a.total)

    if (filtroDepartamento !== 'todos') {
      filas = filas.filter((f) => f.departamento === filtroDepartamento)
    }

    return filas
  }, [reportes, filtroDepartamento])

  const maxTotal = ranking[0]?.total ?? 1

  const departamentos = useMemo(() => {
    const deps = new Set(reportes.map((r) => r.departamento).filter(Boolean) as string[])
    return Array.from(deps).sort()
  }, [reportes])

  const detalleActual = municipioSeleccionado
    ? ranking.find((f) => f.municipio === municipioSeleccionado) ?? null
    : null

  const totalGlobal = reportes.length
  const municipiosAfectados = ranking.length
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
      {/* Header */}
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
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Total reportes</p>
              <p className="text-3xl font-bold text-white">{totalGlobal}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Municipios afectados</p>
              <p className="text-3xl font-bold text-white">{municipiosAfectados}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Departamento más crítico</p>
              <p className="text-2xl font-bold text-red-400">{depMasCritico}</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-6">
            {/* Ranking */}
            <div className="col-span-3 bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-300">
                  Ranking por municipio
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
                <p className="text-gray-600 text-sm py-8 text-center">Sin reportes para este filtro.</p>
              ) : (
                <div className="space-y-2">
                  {ranking.map((fila, i) => {
                    const seleccionado = municipioSeleccionado === fila.municipio
                    return (
                      <button
                        key={fila.municipio}
                        onClick={() => setMunicipioSeleccionado(seleccionado ? null : fila.municipio)}
                        className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors group ${seleccionado ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                      >
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="text-gray-500 text-xs w-5 text-right">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-white text-sm font-medium truncate">{fila.municipio}</span>
                            <span className="text-gray-500 text-xs ml-2">{fila.departamento}</span>
                          </div>
                          <span className="text-white font-bold text-sm">{fila.total}</span>
                        </div>
                        {/* Barra principal */}
                        <div className="flex items-center gap-2 pl-8">
                          <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${(fila.total / maxTotal) * 100}%` }}
                            />
                          </div>
                        </div>
                        {/* Desglose por tipo */}
                        <div className="flex gap-1.5 pl-8 mt-1.5 flex-wrap">
                          {Object.entries(fila.porTipo)
                            .sort(([, a], [, b]) => b - a)
                            .map(([tipo, n]) => (
                              <span
                                key={tipo}
                                className="flex items-center gap-1 text-xs text-gray-400"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${COLORES_TIPO[tipo] ?? 'bg-gray-500'}`} />
                                {ETIQUETAS[tipo] ?? tipo} ({n})
                              </span>
                            ))}
                        </div>
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

                  {/* Mini distribución por tipo */}
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

                  <div className="border-t border-gray-800 pt-3 flex-1 overflow-y-auto space-y-2">
                    {detalleActual.reportes.map((r) => (
                      <div key={r.id} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${COLORES_TIPO[r.tipo] ?? 'bg-gray-500'}`} />
                            <span className="text-white text-xs font-medium">{ETIQUETAS[r.tipo] ?? r.tipo}</span>
                          </div>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${COLORES_ESTADO[r.estado] ?? 'bg-gray-700 text-gray-400'}`}>
                            {r.estado}
                          </span>
                        </div>
                        {r.nombre_lugar && (
                          <p className="text-gray-400 text-xs truncate">{r.nombre_lugar}</p>
                        )}
                        <p className="text-gray-600 text-xs mt-1">
                          {new Date(r.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
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
