'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import NavbarApp from '@/app/components/NavbarApp'
import { useFiltros } from '@/hooks/useFiltros'
import { useRanking, type Tab } from '@/hooks/useRanking'
import { useHistorico } from '@/hooks/useHistorico'
import { KpiGrid } from './components/KpiGrid'
import { SidebarFiltros } from './components/SidebarFiltros'
import { RankingMunicipios } from './components/RankingMunicipios'
import { PanelDetalle } from './components/PanelDetalle'

const MapaHistorico    = dynamic(() => import('@/components/MapaHistorico'), { ssr: false })
const BotonDescargaPDF = dynamic(
  () => import('./components/BotonDescargaPDF').then((m) => ({ default: m.BotonDescargaPDF })),
  { ssr: false }
)

const TABS: { id: Tab; label: string }[] = [
  { id: 'reportes', label: 'Por reportes' },
  { id: 'tiempo',   label: 'Por tiempo promedio' },
  { id: 'personas', label: 'Por personas afectadas' },
]

export default function Historico() {
  const { reportes, cargando }                            = useHistorico()
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState<string | null>(null)
  const [tab, setTab]                                     = useState<Tab>('reportes')

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

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reportes Históricos</h1>
              <p className="text-sm text-gray-500 mt-0.5">Datos agregados de todos los reportes ciudadanos</p>
            </div>
            <BotonDescargaPDF
              filtroFechaDesde={filtroFechaDesde}
              filtroFechaHasta={filtroFechaHasta}
              filtroDepartamento={filtroDepartamento}
              filtroMunicipio={filtroMunicipio}
              filtroEstado={filtroEstado}
              filtrosActivos={filtrosActivos}
              tab={tab}
            />
          </div>

          <KpiGrid
            totalGlobal={totalGlobal}
            municipiosAfectados={municipiosAfectados}
            totalPersonasGlobal={totalPersonasGlobal}
            depMasCritico={depMasCritico}
          />

          {/* Mapa + Filtros */}
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-96">
              <MapaHistorico
                reportes={reportesFiltrados.filter((r) =>
                  filtroDepartamento === 'todos' || r.departamento === filtroDepartamento
                )}
              />
            </div>
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

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white border border-gray-100 shadow-sm rounded-xl p-1 w-fit">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setTab(id); resetSeleccion() }}
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
            <PanelDetalle detalle={detalleActual} />
          </div>

        </div>
      )}
    </main>
  )
}
