import { IconChevron } from '@/components/ui/Icons'
import { ETIQUETAS_TIPO, DEPARTAMENTOS_PRIORITARIOS } from '@/lib/reportes-config'
import { CHIPS_TIPO } from '@/lib/reportes-ui'
import type { FilaMunicipio } from '@/types/reportes'
import type { Tab } from '@/hooks/useRanking'

type Props = {
  ranking: FilaMunicipio[]
  tab: Tab
  filtroDepartamento: string
  setFiltroDepartamento: (v: string) => void
  departamentos: string[]
  municipioSeleccionado: string | null
  setMunicipioSeleccionado: (v: string | null) => void
  maxTotal: number
  maxTiempo: number
  maxPersonas: number
}

export function RankingMunicipios({
  ranking,
  tab,
  filtroDepartamento, setFiltroDepartamento,
  departamentos,
  municipioSeleccionado, setMunicipioSeleccionado,
  maxTotal, maxTiempo, maxPersonas,
}: Props) {
  return (
    <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
          {tab === 'reportes'  ? 'Ranking por municipio'
          : tab === 'tiempo'   ? 'Ranking por tiempo en situación'
          :                      'Ranking por personas afectadas'}
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
          {tab === 'tiempo'    ? 'Sin datos de tiempo para este filtro.'
          : tab === 'personas' ? 'Sin datos de personas afectadas para este filtro.'
          :                      'Sin reportes para este filtro.'}
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

                <div className="pl-9">
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        tab === 'tiempo'   ? 'bg-amber-400'
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
          })}
        </div>
      )}
    </div>
  )
}
