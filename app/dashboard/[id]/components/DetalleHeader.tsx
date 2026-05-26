import { LABEL_ESTADO } from '@/lib/reportes-config'
import { BADGE_DARK } from '@/lib/reportes-ui'

type Props = {
  estado: string
}

export function DetalleHeader({ estado }: Props) {
  return (
    <header className="px-6 py-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
      <button
        onClick={() => window.history.back()}
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        ← Volver al dashboard
      </button>
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${BADGE_DARK[estado] ?? ''}`}>
        {LABEL_ESTADO[estado] ?? estado}
      </span>
    </header>
  )
}
