import { IconDoc, IconPin, IconPeople, IconAlert } from '@/components/ui/Icons'

type Props = {
  totalGlobal: number
  municipiosAfectados: number
  totalPersonasGlobal: number
  depMasCritico: string
}

export function KpiGrid({ totalGlobal, municipiosAfectados, totalPersonasGlobal, depMasCritico }: Props) {
  return (
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
        <div className="min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Departamento más crítico</p>
          <p className="text-base md:text-xl font-bold text-red-500 leading-tight break-words">{depMasCritico}</p>
        </div>
      </div>
    </div>
  )
}
