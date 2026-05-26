type Props = {
  count: number
  cargando: boolean
}

export function DashboardHeader({ count, cargando }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <h1 className="text-xl font-bold text-gray-900">Dashboard Validadores</h1>
        {!cargando && (
          <span className="ml-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
            {count} activos
          </span>
        )}
      </div>
    </div>
  )
}
