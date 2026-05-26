import { IconChevron } from '@/components/ui/Icons'
import { DEPARTAMENTOS_PRIORITARIOS } from '@/lib/reportes-config'
import { RankingRow } from './RankingRow'
import type { FilaMunicipio } from '@/types/reportes'
import type { Tab } from '@/lib/ranking-aggregation'

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
          {ranking.map((fila, i) => (
            <RankingRow
              key={fila.municipio}
              fila={fila}
              index={i}
              tab={tab}
              maxTotal={maxTotal}
              maxTiempo={maxTiempo}
              maxPersonas={maxPersonas}
              seleccionado={municipioSeleccionado === fila.municipio}
              onClick={() => setMunicipioSeleccionado(municipioSeleccionado === fila.municipio ? null : fila.municipio)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
