import {
  ETIQUETAS_TIPO,
  LABEL_ESTADO,
  BADGE_LIGHT,
  ACCIONES_ESTADO,
  type EstadoActivo,
} from '@/lib/reportes-config'
import type { Reporte } from '@/types/reportes'

type Props = {
  reporte: Reporte
  ocupado: boolean
  onCambiarEstado: (id: string, estado: string) => void
}

export function ReporteRow({ reporte: r, ocupado, onCambiarEstado }: Props) {
  const acciones = ACCIONES_ESTADO[r.estado as EstadoActivo] ?? []

  return (
    <tr className="hover:bg-gray-50/70 transition-colors group">
      <td className="px-5 py-4 text-gray-900 font-medium whitespace-nowrap">
        {ETIQUETAS_TIPO[r.tipo] ?? r.tipo}
      </td>
      <td className="px-4 py-4 text-gray-600 max-w-[220px] truncate">
        {r.nombre_lugar ?? '—'}
      </td>
      <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
        {[r.municipio, r.departamento].filter(Boolean).join(', ') || '—'}
      </td>
      <td className="px-4 py-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${BADGE_LIGHT[r.estado] ?? 'bg-gray-100 text-gray-500'}`}>
          {LABEL_ESTADO[r.estado] ?? r.estado}
        </span>
      </td>
      <td className="px-4 py-4 text-gray-400 text-xs whitespace-nowrap">
        {new Date(r.created_at).toLocaleDateString('es-CO', {
          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
        })}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-1.5">
          {acciones.map((a) => (
            <button
              key={a.estado}
              onClick={() => onCambiarEstado(r.id, a.estado)}
              disabled={ocupado}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors disabled:opacity-40 ${a.cls}`}
            >
              {ocupado ? '…' : a.label}
            </button>
          ))}
        </div>
      </td>
      <td className="px-4 py-4">
        <a
          href={`/dashboard/${r.id}`}
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#1C3828] font-medium transition-colors group-hover:text-[#587546]"
        >
          Ver
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </td>
    </tr>
  )
}
