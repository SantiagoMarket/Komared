import type { Reporte } from '@/types/reportes'
import { LoadingState } from './LoadingState'
import { EmptyState } from './EmptyState'
import { ReporteRow } from './ReporteRow'
import { Paginacion } from './Paginacion'

type Props = {
  reportes: Reporte[]
  cargando: boolean
  actualizando: string | null
  pagina: number
  totalPaginas: number
  onCambiarEstado: (id: string, estado: string) => void
  onCambiarPagina: (n: number) => void
}

export function ReportesTable({ reportes, cargando, actualizando, pagina, totalPaginas, onCambiarEstado, onCambiarPagina }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {cargando ? (
        <LoadingState />
      ) : reportes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">Tipo</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">Lugar</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">Municipio</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">Estado</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">Fecha</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">Acciones</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reportes.map((r) => (
                <ReporteRow
                  key={r.id}
                  reporte={r}
                  ocupado={actualizando === r.id}
                  onCambiarEstado={onCambiarEstado}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={onCambiarPagina} />
    </div>
  )
}
