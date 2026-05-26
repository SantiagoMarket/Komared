import { Select } from '@/components/ui/Select'
import { DEPARTAMENTOS_PRIORITARIOS } from '@/lib/reportes-config'

type Props = {
  filtroFechaDesde: string
  setFiltroFechaDesde: (v: string) => void
  filtroFechaHasta: string
  setFiltroFechaHasta: (v: string) => void
  filtroMunicipio: string
  setFiltroMunicipio: (v: string) => void
  filtroEstado: string
  setFiltroEstado: (v: string) => void
  filtroDepartamento: string
  setFiltroDepartamento: (v: string) => void
  departamentos: string[]
  municipios: string[]
  filtrosActivos: number
  onResetSeleccion: () => void
  onLimpiar: () => void
}

export function SidebarFiltros({
  filtroFechaDesde, setFiltroFechaDesde,
  filtroFechaHasta, setFiltroFechaHasta,
  filtroMunicipio,  setFiltroMunicipio,
  filtroEstado,     setFiltroEstado,
  filtroDepartamento, setFiltroDepartamento,
  departamentos,
  municipios,
  filtrosActivos,
  onResetSeleccion,
  onLimpiar,
}: Props) {
  return (
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
          <Select
            value={filtroDepartamento}
            onChange={(v) => { setFiltroDepartamento(v); onResetSeleccion() }}
          >
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
          <Select
            value={filtroMunicipio}
            onChange={(v) => { setFiltroMunicipio(v); onResetSeleccion() }}
          >
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
          onClick={onLimpiar}
          className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  )
}
