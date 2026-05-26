type Props = {
  personasAfectadas: number | null
  tiempoSituacionDias: number | null
}

export function DetalleMetricas({ personasAfectadas, tiempoSituacionDias }: Props) {
  if (!personasAfectadas && !tiempoSituacionDias) return null

  return (
    <div className="grid grid-cols-2 gap-4">
      {personasAfectadas && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Personas afectadas</p>
          <p className="text-2xl font-bold text-amber-400">
            {personasAfectadas.toLocaleString('es-CO')}
          </p>
        </div>
      )}
      {tiempoSituacionDias && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Tiempo en situación</p>
          <p className="text-2xl font-bold text-red-400">{tiempoSituacionDias} días</p>
        </div>
      )}
    </div>
  )
}
