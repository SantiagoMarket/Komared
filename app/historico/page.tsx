'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import NavbarApp from '@/app/components/NavbarApp'

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
  comedor_sin_alimentos:       'Sin alimentos',
  comedor_cerrado:             'Cerrado',
  comedor_calidad_deficiente:  'Calidad deficiente',
  comedor_contratista_ausente: 'Contratista ausente',
  pae_no_entregado:            'PAE no entregado',
  pae_calidad_deficiente:      'PAE calidad',
  icbf_sin_entrega:            'ICBF sin entrega',
  desnutricion_cronica:        'Desnutrición crónica',
  deficit_alimentario:         'Déficit alimentario',
  otro:                        'Otro',
}

const COLORES_DOT: Record<string, string> = {
  comedor_sin_alimentos:       'bg-red-500',
  comedor_cerrado:             'bg-orange-500',
  comedor_calidad_deficiente:  'bg-yellow-500',
  comedor_contratista_ausente: 'bg-purple-500',
  pae_no_entregado:            'bg-blue-500',
  pae_calidad_deficiente:      'bg-cyan-500',
  icbf_sin_entrega:            'bg-pink-500',
  desnutricion_cronica:        'bg-red-700',
  deficit_alimentario:         'bg-amber-600',
  otro:                        'bg-gray-400',
}

const CHIPS_TIPO: Record<string, string> = {
  comedor_sin_alimentos:       'bg-red-100 text-red-700',
  comedor_cerrado:             'bg-orange-100 text-orange-700',
  comedor_calidad_deficiente:  'bg-yellow-100 text-yellow-700',
  comedor_contratista_ausente: 'bg-purple-100 text-purple-700',
  pae_no_entregado:            'bg-blue-100 text-blue-700',
  pae_calidad_deficiente:      'bg-cyan-100 text-cyan-700',
  icbf_sin_entrega:            'bg-pink-100 text-pink-700',
  desnutricion_cronica:        'bg-red-100 text-red-800',
  deficit_alimentario:         'bg-amber-100 text-amber-700',
  otro:                        'bg-gray-100 text-gray-600',
}

const COLORES_ESTADO: Record<string, string> = {
  pendiente:   'bg-yellow-100 text-yellow-700',
  critico:     'bg-red-100 text-red-700',
  en_curso:    'bg-blue-100 text-blue-700',
  solucionado: 'bg-gray-100 text-gray-500',
}

const LABEL_ESTADO: Record<string, string> = {
  pendiente:   'Pendiente',
  critico:     'Crítico',
  en_curso:    'En curso',
  solucionado: 'Solucionado',
}

const DEPARTAMENTOS_PRIORITARIOS = ['La Guajira', 'Chocó', 'Magdalena', 'Cesar']

type Tab = 'reportes' | 'tiempo' | 'personas'

/* ── SVG icons ── */
function IconDoc() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}
function IconPin() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function IconPeople() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function IconAlert() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}
function IconChevron() {
  return (
    <svg className="w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

/* ── Styled select ── */
function Select({ value, onChange, children }: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2.5 pr-9 focus:outline-none focus:ring-2 focus:ring-[#587546]/30 focus:border-[#587546] transition-colors"
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none">
        <IconChevron />
      </div>
    </div>
  )
}

export default function Historico() {
  const [reportes, setReportes]                     = useState<Reporte[]>([])
  const [cargando, setCargando]                     = useState(true)
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState<string | null>(null)
  const [filtroDepartamento, setFiltroDepartamento] = useState<string>('todos')
  const [tab, setTab]                               = useState<Tab>('reportes')

  /* Filtros del sidebar */
  const [filtroFechaDesde, setFiltroFechaDesde] = useState<string>('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState<string>('')
  const [filtroMunicipio, setFiltroMunicipio]   = useState<string>('todos')
  const [filtroEstado, setFiltroEstado]         = useState<string>('todos')

  useEffect(() => {
    async function cargar() {
      const res = await fetch('/api/reportes')
      if (res.status === 401) { window.location.href = '/login?next=/historico'; return }
      if (!res.ok) return
      setReportes(await res.json())
      setCargando(false)
    }
    cargar()
  }, [])

  /* Reportes filtrados por sidebar */
  const reportesFiltrados = useMemo(() => {
    return reportes.filter((r) => {
      if (filtroFechaDesde && r.created_at < filtroFechaDesde) return false
      if (filtroFechaHasta && r.created_at > filtroFechaHasta + 'T23:59:59') return false
      if (filtroMunicipio !== 'todos' && r.municipio !== filtroMunicipio) return false
      if (filtroEstado !== 'todos' && r.estado !== filtroEstado) return false
      return true
    })
  }, [reportes, filtroFechaDesde, filtroFechaHasta, filtroMunicipio, filtroEstado])

  const ranking = useMemo<FilaMunicipio[]>(() => {
    const mapa = new Map<string, FilaMunicipio>()

    for (const r of reportesFiltrados) {
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
  }, [reportesFiltrados, filtroDepartamento, tab])

  const maxTotal   = ranking[0]?.total ?? 1
  const maxTiempo  = ranking[0]?.promedioTiempo ?? 1
  const maxPersonas = ranking[0]?.totalPersonas ?? 1

  const departamentos = useMemo(() => {
    const deps = new Set(reportes.map((r) => r.departamento).filter(Boolean) as string[])
    return Array.from(deps).sort()
  }, [reportes])

  const municipios = useMemo(() => {
    const ms = new Set(reportes.map((r) => r.municipio).filter(Boolean) as string[])
    return Array.from(ms).sort()
  }, [reportes])

  const detalleActual = municipioSeleccionado
    ? ranking.find((f) => f.municipio === municipioSeleccionado) ?? null
    : null

  const totalGlobal        = reportesFiltrados.length
  const municipiosAfectados = new Set(reportesFiltrados.map((r) => r.municipio).filter(Boolean)).size
  const totalPersonasGlobal = reportesFiltrados.reduce((acc, r) => acc + (r.personas_afectadas ?? 0), 0)

  const depMasCritico = useMemo(() => {
    const conteo = new Map<string, number>()
    for (const r of reportesFiltrados) {
      if (r.departamento) conteo.set(r.departamento, (conteo.get(r.departamento) ?? 0) + 1)
    }
    let max = 0; let dep = '—'
    conteo.forEach((v, k) => { if (v > max) { max = v; dep = k } })
    return dep
  }, [reportesFiltrados])

  const filtrosActivos = [
    filtroFechaDesde,
    filtroFechaHasta,
    filtroMunicipio !== 'todos' ? filtroMunicipio : '',
    filtroEstado !== 'todos' ? filtroEstado : '',
    filtroDepartamento !== 'todos' ? filtroDepartamento : '',
  ].filter(Boolean).length

  function limpiarFiltros() {
    setFiltroFechaDesde('')
    setFiltroFechaHasta('')
    setFiltroMunicipio('todos')
    setFiltroEstado('todos')
    setFiltroDepartamento('todos')
    setMunicipioSeleccionado(null)
  }

  /* ── Render ── */
  return (
    <main className="min-h-screen bg-gray-50">
      <NavbarApp />

      {cargando ? (
        <div className="flex items-center justify-center py-40">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#587546] border-t-transparent animate-spin" />
            <p className="text-gray-400 text-sm">Cargando datos...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

          {/* Page title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes Históricos</h1>
            <p className="text-sm text-gray-500 mt-0.5">Datos agregados de todos los reportes ciudadanos</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#1C3828]/10 flex items-center justify-center text-[#1C3828] shrink-0">
                <IconDoc />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total reportes</p>
                <p className="text-3xl font-bold text-gray-900 leading-tight">{totalGlobal}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#587546]/10 flex items-center justify-center text-[#587546] shrink-0">
                <IconPin />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Municipios afectados</p>
                <p className="text-3xl font-bold text-gray-900 leading-tight">{municipiosAfectados}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                <IconPeople />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Personas afectadas</p>
                <p className="text-3xl font-bold text-amber-500 leading-tight">
                  {totalPersonasGlobal > 0 ? totalPersonasGlobal.toLocaleString('es-CO') : '—'}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                <IconAlert />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Departamento más crítico</p>
                <p className="text-xl font-bold text-red-500 leading-tight">{depMasCritico}</p>
              </div>
            </div>
          </div>

          {/* Mapa + Filtros */}
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-96">
              <MapaHistorico
                reportes={reportesFiltrados.filter((r) =>
                  filtroDepartamento === 'todos' || r.departamento === filtroDepartamento
                )}
              />
            </div>

            {/* Filtros sidebar */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                  Filtros
                  {filtrosActivos > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1C3828] text-white text-xs font-bold">
                      {filtrosActivos}
                    </span>
                  )}
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Fecha</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={filtroFechaDesde}
                      onChange={(e) => setFiltroFechaDesde(e.target.value)}
                      className="flex-1 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#587546]/30 focus:border-[#587546] transition-colors"
                    />
                    <span className="text-gray-400 text-xs">→</span>
                    <input
                      type="date"
                      value={filtroFechaHasta}
                      onChange={(e) => setFiltroFechaHasta(e.target.value)}
                      className="flex-1 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#587546]/30 focus:border-[#587546] transition-colors"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Departamento</label>
                  <Select value={filtroDepartamento} onChange={(v) => { setFiltroDepartamento(v); setMunicipioSeleccionado(null) }}>
                    <option value="todos">Todos los departamentos</option>
                    {DEPARTAMENTOS_PRIORITARIOS.map((d) => (
                      <option key={d} value={d}>⚠ {d}</option>
                    ))}
                    {departamentos.filter((d) => !DEPARTAMENTOS_PRIORITARIOS.includes(d)).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </Select>
                </div>

                <div className="border-t border-gray-100" />

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Municipio</label>
                  <Select value={filtroMunicipio} onChange={(v) => { setFiltroMunicipio(v); setMunicipioSeleccionado(null) }}>
                    <option value="todos">Todos los municipios</option>
                    {municipios.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </Select>
                </div>

                <div className="border-t border-gray-100" />

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Estado del reporte</label>
                  <Select value={filtroEstado} onChange={(v) => setFiltroEstado(v)}>
                    <option value="todos">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="critico">Crítico</option>
                    <option value="en_curso">En curso</option>
                    <option value="solucionado">Solucionado</option>
                  </Select>
                </div>
              </div>

              <div className="mt-auto space-y-2 pt-2">
                <button
                  disabled={filtrosActivos === 0}
                  onClick={limpiarFiltros}
                  className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white border border-gray-100 shadow-sm rounded-xl p-1 w-fit">
            {([
              { id: 'reportes', label: 'Por reportes' },
              { id: 'tiempo',   label: 'Por tiempo promedio' },
              { id: 'personas', label: 'Por personas afectadas' },
            ] as { id: Tab; label: string }[]).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setTab(id); setMunicipioSeleccionado(null) }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === id
                    ? 'bg-[#1C3828] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Ranking + Detalle */}
          <div className="grid grid-cols-5 gap-6">

            {/* Ranking */}
            <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                  {tab === 'reportes'  ? 'Ranking por municipio'
                  : tab === 'tiempo'   ? 'Ranking por tiempo en situación'
                  :                     'Ranking por personas afectadas'}
                </h2>
                <div className="relative">
                  <select
                    value={filtroDepartamento}
                    onChange={(e) => { setFiltroDepartamento(e.target.value); setMunicipioSeleccionado(null) }}
                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#587546]/30 focus:border-[#587546] transition-colors"
                  >
                    <option value="todos">Todos los departamentos</option>
                    {DEPARTAMENTOS_PRIORITARIOS.map((d) => (
                      <option key={d} value={d}>⚠ {d}</option>
                    ))}
                    {departamentos.filter((d) => !DEPARTAMENTOS_PRIORITARIOS.includes(d)).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                    <IconChevron />
                  </div>
                </div>
              </div>

              {ranking.length === 0 ? (
                <p className="text-gray-400 text-sm py-12 text-center">
                  {tab === 'tiempo'   ? 'Sin datos de tiempo para este filtro.'
                  : tab === 'personas' ? 'Sin datos de personas afectadas para este filtro.'
                  :                     'Sin reportes para este filtro.'}
                </p>
              ) : (
                <div className="space-y-1.5">
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
                        className={`w-full text-left rounded-xl px-4 py-3 transition-all border ${
                          seleccionado
                            ? 'bg-[#1C3828]/5 border-[#587546]/30'
                            : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {/* Badge número */}
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            i === 0 ? 'bg-[#1C3828] text-white'
                            : i === 1 ? 'bg-gray-200 text-gray-600'
                            : i === 2 ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-500'
                          }`}>
                            {i + 1}
                          </span>

                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <span className="text-gray-900 text-sm font-semibold truncate">{fila.municipio}</span>
                            <span className="text-gray-400 text-xs">{fila.departamento}</span>
                            {fila.tieneCritico && tab === 'reportes' && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600 font-semibold">Crítico</span>
                            )}
                          </div>

                          <span className="text-gray-900 font-bold text-sm shrink-0">
                            {tab === 'reportes'  ? `${fila.total} rep.`
                            : tab === 'tiempo'   ? `${fila.promedioTiempo} días`
                            :                     `${fila.totalPersonas.toLocaleString('es-CO')} personas`}
                          </span>
                        </div>

                        {/* Barra de progreso */}
                        <div className="pl-9">
                          <div className="bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
                            <div
                              className={`h-full rounded-full transition-all ${
                                tab === 'tiempo'   ? 'bg-amber-400'
                                : tab === 'personas' ? 'bg-orange-400'
                                : fila.tieneCritico ? 'bg-red-500'
                                : 'bg-[#587546]'
                              }`}
                              style={{ width: `${valorBarra}%` }}
                            />
                          </div>

                          {/* Chips de tipo */}
                          {tab === 'reportes' && (
                            <div className="flex gap-1.5 flex-wrap">
                              {Object.entries(fila.porTipo)
                                .sort(([, a], [, b]) => b - a)
                                .map(([tipo, n]) => (
                                  <span
                                    key={tipo}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${CHIPS_TIPO[tipo] ?? 'bg-gray-100 text-gray-600'}`}
                                  >
                                    {ETIQUETAS[tipo] ?? tipo} ({n})
                                  </span>
                                ))}
                            </div>
                          )}

                          {tab === 'tiempo' && fila.totalPersonas > 0 && (
                            <p className="text-xs text-gray-400">
                              {fila.totalPersonas.toLocaleString('es-CO')} personas afectadas
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Panel de detalle */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              {!detalleActual ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">Selecciona un municipio<br />para ver sus reportes</p>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="mb-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-bold text-gray-900 text-lg leading-tight">{detalleActual.municipio}</h2>
                      <span className="shrink-0 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                        {detalleActual.total} reportes
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{detalleActual.departamento}</p>
                  </div>

                  {/* Métricas de impacto */}
                  {(detalleActual.totalPersonas > 0 || detalleActual.promedioTiempo !== null) && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {detalleActual.totalPersonas > 0 && (
                        <div className="bg-amber-50 rounded-xl p-3">
                          <p className="text-amber-600 text-xs font-medium mb-0.5">Personas afectadas</p>
                          <p className="text-amber-600 font-bold text-xl">{detalleActual.totalPersonas.toLocaleString('es-CO')}</p>
                        </div>
                      )}
                      {detalleActual.promedioTiempo !== null && (
                        <div className="bg-red-50 rounded-xl p-3">
                          <p className="text-red-500 text-xs font-medium mb-0.5">Tiempo promedio</p>
                          <p className="text-red-500 font-bold text-xl">{detalleActual.promedioTiempo} días</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Distribución por tipo */}
                  <div className="space-y-2 mb-4">
                    {Object.entries(detalleActual.porTipo)
                      .sort(([, a], [, b]) => b - a)
                      .map(([tipo, n]) => (
                        <div key={tipo} className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${COLORES_DOT[tipo] ?? 'bg-gray-400'}`} />
                          <span className="text-gray-600 text-xs flex-1 truncate">{ETIQUETAS[tipo] ?? tipo}</span>
                          <span className="text-gray-900 text-xs font-semibold">{n}</span>
                          <div className="w-16 bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`h-full rounded-full ${COLORES_DOT[tipo] ?? 'bg-gray-400'}`}
                              style={{ width: `${(n / detalleActual.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Lista de reportes */}
                  <div className="border-t border-gray-100 pt-3 flex-1 overflow-y-auto space-y-2">
                    {detalleActual.reportes.map((r) => (
                      <div
                        key={r.id}
                        className={`rounded-xl p-3 border-l-4 bg-gray-50 ${
                          r.estado === 'critico'    ? 'border-red-400'
                          : r.estado === 'pendiente' ? 'border-yellow-400'
                          : r.estado === 'en_curso'  ? 'border-blue-400'
                          :                           'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${COLORES_DOT[r.tipo] ?? 'bg-gray-400'}`} />
                            <span className="text-gray-800 text-xs font-semibold">{ETIQUETAS[r.tipo] ?? r.tipo}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COLORES_ESTADO[r.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                            {LABEL_ESTADO[r.estado] ?? r.estado}
                          </span>
                        </div>
                        {r.nombre_lugar && (
                          <p className="text-gray-400 text-xs truncate">{r.nombre_lugar}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <p className="text-gray-400 text-xs">
                            {new Date(r.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                          {r.personas_afectadas && (
                            <span className="text-amber-600 text-xs font-medium">{r.personas_afectadas} personas</span>
                          )}
                          {r.tiempo_situacion_dias && (
                            <span className="text-red-500 text-xs font-medium">{r.tiempo_situacion_dias} días</span>
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
