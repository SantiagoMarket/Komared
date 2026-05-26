import { ETIQUETAS_TIPO } from '@/lib/reportes-config'
import { CHIPS_TIPO } from '@/lib/reportes-ui'
import type { FilaMunicipio } from '@/types/reportes'
import type { Tab } from '@/lib/ranking-aggregation'

type Props = {
  fila: FilaMunicipio
  index: number
  tab: Tab
  maxTotal: number
  maxTiempo: number
  maxPersonas: number
  seleccionado: boolean
  onClick: () => void
}

export function RankingRow({ fila, index, tab, maxTotal, maxTiempo, maxPersonas, seleccionado, onClick }: Props) {
  const valorBarra = tab === 'reportes'
    ? (fila.total / maxTotal) * 100
    : tab === 'tiempo'
    ? ((fila.promedioTiempo ?? 0) / maxTiempo) * 100
    : (fila.totalPersonas / maxPersonas) * 100

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl px-4 py-3 transition-all border ${
        seleccionado
          ? 'bg-[#1C3828]/5 border-[#587546]/30'
          : 'border-transparent hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          index === 0 ? 'bg-[#1C3828] text-white'
          : index === 1 ? 'bg-gray-200 text-gray-600'
          : index === 2 ? 'bg-amber-100 text-amber-700'
          : 'bg-gray-100 text-gray-500'
        }`}>
          {index + 1}
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

      <div className="pl-9">
        <div className="bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all ${
              tab === 'tiempo'    ? 'bg-amber-400'
              : tab === 'personas' ? 'bg-orange-400'
              : fila.tieneCritico  ? 'bg-red-500'
              : 'bg-[#587546]'
            }`}
            style={{ width: `${valorBarra}%` }}
          />
        </div>

        {tab === 'reportes' && (
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(fila.porTipo)
              .sort(([, a], [, b]) => b - a)
              .map(([tipo, n]) => (
                <span
                  key={tipo}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${CHIPS_TIPO[tipo] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {ETIQUETAS_TIPO[tipo] ?? tipo} ({n})
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
}
