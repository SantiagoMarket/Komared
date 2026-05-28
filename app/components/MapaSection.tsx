import dynamic from 'next/dynamic'

const MapaPreview = dynamic(() => import('@/components/MapaPreview'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#0f2318]" />,
})

interface Stats {
  totalAlertas: number
  municipiosActivos: number
  tasaResolucion: number
}

export default function MapaSection({ stats }: { stats: Stats }) {
  const statsItems = [
    { value: stats.totalAlertas.toString(), label: 'Alertas totales' },
    { value: stats.municipiosActivos.toString(), label: 'Municipios activos' },
    { value: `${stats.tasaResolucion}%`, label: 'Tasa de resolución' },
    { value: '< 4h', label: 'Tiempo de respuesta' },
  ]

  return (
    <section id="mapa" className="bg-[#1C3828] px-6 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto">

        <div className="mb-14">
          <p className="text-[#F4B534] text-xs font-bold tracking-widest uppercase mb-4">
            — Mapa Vivo
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
            El Radar de la Alimentación{' '}
            <em className="italic text-[#F4B534]">en la Última Milla</em>
          </h2>
          <p className="text-[#9ca3af] text-lg max-w-2xl leading-relaxed">
            Visualiza el estado de las alertas en tiempo real. Cruzamos las
            denuncias del territorio con la contratación pública para anticipar
            y corregir la inoperancia del sistema.
          </p>
        </div>

        {/* Visualización del mapa */}
        <div className="rounded-2xl overflow-hidden border border-white/10 mb-10">

          {/* Barra superior del mapa */}
          <div className="bg-[#152d1e] px-5 py-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F4B534] animate-pulse" />
              <span className="text-white text-xs font-bold tracking-wider uppercase">En Vivo · Alertas Activas — Colombia</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-orange-400">
                <span className="w-2 h-2 rounded-full bg-orange-400" /> Alerta activa
              </span>
              <span className="flex items-center gap-1.5 text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400" /> Improcesado
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> Sin reporte
              </span>
            </div>
          </div>

          {/* Área del mapa — mapa de calor real */}
          <div className="bg-[#0f2318] h-72 lg:h-96 relative">
            <MapaPreview />
            <a
              href="/mapa"
              className="absolute bottom-5 right-5 z-[1000] px-5 py-2.5 bg-[#F4B534] text-[#1B1818] font-bold text-sm rounded-full hover:bg-[#e5a820] transition-colors flex items-center gap-2 shadow-lg"
            >
              Ver mapa completo
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statsItems.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl lg:text-5xl font-bold text-[#F4B534] mb-2">{s.value}</p>
              <p className="text-[#9ca3af] text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
