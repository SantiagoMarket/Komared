import { ETIQUETAS_TIPO } from '@/lib/reportes-config'
import type { ReporteDetalle } from '@/types/reportes'

type Props = Pick<ReporteDetalle, 'tipo' | 'nombre_lugar' | 'municipio' | 'departamento' | 'created_at' | 'canal'>

export function DetalleInfo({ tipo, nombre_lugar, municipio, departamento, created_at, canal }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
        {ETIQUETAS_TIPO[tipo] ?? tipo}
      </p>
      <h1 className="text-xl font-bold text-white mb-1">
        {nombre_lugar ?? '—'}
      </h1>
      <p className="text-gray-400 text-sm">
        {[municipio, departamento].filter(Boolean).join(', ') || '—'}
      </p>
      <p className="text-gray-600 text-xs mt-2">
        {new Date(created_at).toLocaleDateString('es-CO', {
          day: '2-digit', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })}
        {canal && ` · vía ${canal}`}
      </p>
    </div>
  )
}
