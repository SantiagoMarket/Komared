import { ETIQUETAS_TIPO, COLORES_DOT, COLORES_ESTADO_CSS, LABEL_ESTADO } from '@/lib/reportes-config'
import type { FilaMunicipio } from '@/types/reportes'

export function PanelDetalle({ detalle }: { detalle: FilaMunicipio | null }) {
  return (
    <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {!detalle ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-20">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">Selecciona un municipio<br />para ver sus reportes</p>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="mb-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-bold text-gray-900 text-lg leading-tight">{detalle.municipio}</h2>
              <span className="shrink-0 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                {detalle.total} reportes
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">{detalle.departamento}</p>
          </div>

          {(detalle.totalPersonas > 0 || detalle.promedioTiempo !== null) && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {detalle.totalPersonas > 0 && (
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-amber-600 text-xs font-medium mb-0.5">Personas afectadas</p>
                  <p className="text-amber-600 font-bold text-xl">{detalle.totalPersonas.toLocaleString('es-CO')}</p>
                </div>
              )}
              {detalle.promedioTiempo !== null && (
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-red-500 text-xs font-medium mb-0.5">Tiempo promedio</p>
                  <p className="text-red-500 font-bold text-xl">{detalle.promedioTiempo} días</p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2 mb-4">
            {Object.entries(detalle.porTipo)
              .sort(([, a], [, b]) => b - a)
              .map(([tipo, n]) => (
                <div key={tipo} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${COLORES_DOT[tipo] ?? 'bg-gray-400'}`} />
                  <span className="text-gray-600 text-xs flex-1 truncate">{ETIQUETAS_TIPO[tipo] ?? tipo}</span>
                  <span className="text-gray-900 text-xs font-semibold">{n}</span>
                  <div className="w-16 bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-full rounded-full ${COLORES_DOT[tipo] ?? 'bg-gray-400'}`}
                      style={{ width: `${(n / detalle.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>

          <div className="border-t border-gray-100 pt-3 flex-1 overflow-y-auto space-y-2">
            {detalle.reportes.map((r) => (
              <div
                key={r.id}
                className={`rounded-xl p-3 border-l-4 bg-gray-50 ${
                  r.estado === 'critico'    ? 'border-red-400'
                  : r.estado === 'pendiente' ? 'border-yellow-400'
                  : r.estado === 'en_curso'  ? 'border-blue-400'
                  :                           'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${COLORES_DOT[r.tipo] ?? 'bg-gray-400'}`} />
                    <span className="text-gray-800 text-xs font-semibold">{ETIQUETAS_TIPO[r.tipo] ?? r.tipo}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COLORES_ESTADO_CSS[r.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                    {LABEL_ESTADO[r.estado] ?? r.estado}
                  </span>
                </div>
                {r.nombre_lugar && (
                  <p className="text-gray-400 text-xs truncate">{r.nombre_lugar}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <p className="text-gray-400 text-xs">
                    {new Date(r.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  {r.personas_afectadas && (
                    <span className="text-amber-600 text-xs font-medium">{r.personas_afectadas} personas</span>
                  )}
                  {r.tiempo_situacion_dias && (
                    <span className="text-red-500 text-xs font-medium">{r.tiempo_situacion_dias} días</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
