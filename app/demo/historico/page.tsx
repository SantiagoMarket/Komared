'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useFiltros } from '@/hooks/useFiltros'
import { useRanking, type Tab } from '@/hooks/useRanking'
import { useHistoricoDemo } from '@/hooks/useHistoricoDemo'
import { KpiGrid } from '@/app/historico/components/KpiGrid'
import { SidebarFiltros } from '@/app/historico/components/SidebarFiltros'
import { RankingMunicipios } from '@/app/historico/components/RankingMunicipios'
import { PanelDetalle } from '@/app/historico/components/PanelDetalle'

const MapaHistorico = dynamic(() => import('@/components/MapaHistorico'), { ssr: false })

const TABS: { id: Tab; label: string }[] = [
  { id: 'reportes', label: 'Por reportes' },
  { id: 'tiempo',   label: 'Por tiempo promedio' },
  { id: 'personas', label: 'Por personas afectadas' },
]

export default function HistoricoDemo() {
  const { reportes, cargando }                            = useHistoricoDemo()
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState<string | null>(null)
  const [tab, setTab]                                     = useState<Tab>('reportes')
  const [mostrarFiltros, setMostrarFiltros]               = useState(false)

  const {
    filtroFechaDesde, setFiltroFechaDesde,
    filtroFechaHasta, setFiltroFechaHasta,
    filtroMunicipio,  setFiltroMunicipio,
    filtroEstado,     setFiltroEstado,
    filtroDepartamento, setFiltroDepartamento,
    reportesFiltrados,
    departamentos,
    municipios,
    filtrosActivos,
    limpiarFiltros,
  } = useFiltros(reportes)

  const { ranking, maxTotal, maxTiempo, maxPersonas, depMasCritico } =
    useRanking(reportesFiltrados, filtroDepartamento, tab)

  const detalleActual       = ranking.find((f) => f.municipio === municipioSeleccionado) ?? null
  const totalGlobal         = reportesFiltrados.length
  const municipiosAfectados = new Set(reportesFiltrados.map((r) => r.municipio).filter(Boolean)).size
  const totalPersonasGlobal = reportesFiltrados.reduce((acc, r) => acc + (r.personas_afectadas ?? 0), 0)
  const resetSeleccion      = () => setMunicipioSeleccionado(null)

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar mínima para demo */}
      <header className="bg-[#1C3828] border-b border-[#2a5040]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white font-semibold text-sm tracking-wide">KomaRed · Demo</span>
          <nav className="ml-auto flex items-center gap-4">
            <Link href="/demo/mapa" className="text-green-200/70 hover:text-white text-sm transition-colors">
              Mapa en vivo
            </Link>
            <Link href="/demo" className="text-green-200/70 hover:text-white text-sm transition-colors">
              Registro
            </Link>
          </nav>
        </div>
      </header>

      {cargando ? (
        <div className="flex items-center justify-center py-40">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#587546] border-t-transparent animate-spin" />
            <p className="text-gray-400 text-sm">Cargando datos...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes de prueba</h1>
            <p className="text-sm text-gray-500 mt-0.5">Datos del demo — reportes enviados por WhatsApp</p>
          </div>

          <KpiGrid
            totalGlobal={totalGlobal}
            municipiosAfectados={municipiosAfectados}
            totalPersonasGlobal={totalPersonasGlobal}
            depMasCritico={depMasCritico}
          />

          {/* Mapa + Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
            <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-64 md:min-h-96">
              <MapaHistorico
                reportes={reportesFiltrados.filter((r) =>
                  filtroDepartamento === 'todos' || r.departamento === filtroDepartamento
                )}
              />
            </div>

            {/* Toggle filtros — solo móvil */}
            <button
              onClick={() => setMostrarFiltros((v) => !v)}
              className="md:hidden flex items-center justify-between w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700"
            >
              <span>
                Filtros
                {filtrosActivos > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1C3828] text-white text-xs font-bold">
                    {filtrosActivos}
                  </span>
                )}
              </span>
              <span className="text-gray-400">{mostrarFiltros ? '▲' : '▼'}</span>
            </button>

            <div className={`md:contents ${mostrarFiltros ? 'block' : 'hidden md:block'}`}>
              <SidebarFiltros
                filtroFechaDesde={filtroFechaDesde}     setFiltroFechaDesde={setFiltroFechaDesde}
                filtroFechaHasta={filtroFechaHasta}     setFiltroFechaHasta={setFiltroFechaHasta}
                filtroMunicipio={filtroMunicipio}       setFiltroMunicipio={setFiltroMunicipio}
                filtroEstado={filtroEstado}             setFiltroEstado={setFiltroEstado}
                filtroDepartamento={filtroDepartamento} setFiltroDepartamento={setFiltroDepartamento}
                departamentos={departamentos}
                municipios={municipios}
                filtrosActivos={filtrosActivos}
                onResetSeleccion={resetSeleccion}
                onLimpiar={() => limpiarFiltros(resetSeleccion)}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="overflow-x-auto">
            <div className="flex items-center gap-1 bg-white border border-gray-100 shadow-sm rounded-xl p-1 w-fit min-w-full md:min-w-0">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => { setTab(id); resetSeleccion() }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    tab === id
                      ? 'bg-[#1C3828] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Ranking + Detalle */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
            <RankingMunicipios
              ranking={ranking}
              tab={tab}
              filtroDepartamento={filtroDepartamento} setFiltroDepartamento={setFiltroDepartamento}
              departamentos={departamentos}
              municipioSeleccionado={municipioSeleccionado}
              setMunicipioSeleccionado={setMunicipioSeleccionado}
              maxTotal={maxTotal}
              maxTiempo={maxTiempo}
              maxPersonas={maxPersonas}
            />
            {/* En móvil solo muestra el detalle cuando hay municipio seleccionado */}
            <div className={detalleActual ? 'block' : 'hidden md:block'}>
              <PanelDetalle detalle={detalleActual} />
            </div>
          </div>

        </div>
      )}
    </main>
  )
}
