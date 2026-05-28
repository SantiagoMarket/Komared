export default function HeroSection() {
  return (
    <section className="bg-[#F5F3EE] px-6 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* Columna izquierda */}
        <div className="flex flex-col gap-7">
          <div className="flex items-center gap-2 flex-wrap">
            {['GOVTECH', 'CIVICTECH', 'COLOMBIA'].map((tag, i) => (
              <span
                key={tag}
                className="text-xs font-semibold tracking-widest text-[#587546] uppercase flex items-center gap-2"
              >
                {i > 0 && <span className="text-[#587546] opacity-40">·</span>}
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1B1818] leading-[1.1]">
            Juntos vigilamos<br />
            por una{' '}
            <em className="not-italic italic text-[#587546]">alimentación<br />digna para todos</em>
          </h1>

          <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
            Datos, tecnología y ciudadanía para transformar la vigilancia
            alimentaria en Colombia. Conectamos comunidades, líderes
            y entidades en tiempo real.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/573134689377"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-[#F4B534] text-[#1B1818] font-bold text-sm rounded-full hover:bg-[#e5a820] transition-colors flex items-center gap-2"
            >
              Participa ahora
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="#como-funciona"
              className="px-6 py-3.5 border-2 border-[#1C3828] text-[#1C3828] font-semibold text-sm rounded-full hover:bg-[#1C3828] hover:text-white transition-colors"
            >
              Ver cómo funciona
            </a>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['#1C3828', '#587546', '#F4B534', '#1B1818'].map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[#F5F3EE]"
                  style={{ background: color }}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500">
              <span className="font-bold text-[#1B1818]">+340 reportes comunitarios</span>{' '}
              en toda Colombia
            </p>
          </div>
        </div>

        {/* Columna derecha — Panel de alertas mockup */}
        <div className="relative">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">

            {/* Header del panel */}
            <div className="bg-[#1C3828] px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/logo-komared.svg" alt="" className="h-5 w-auto brightness-0 invert opacity-90" />
                <span className="text-white text-xs font-bold tracking-widest uppercase">KomaRed · Panel de Alertas</span>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-70" />
              </div>
            </div>

            {/* Alertas */}
            <div className="divide-y divide-gray-100">
              <AlertaItem
                badge="ALERTA ACTIVA — PAE"
                badgeColor="bg-orange-100 text-orange-700"
                titulo="Falta de entrega de raciones — Escuela Rural La Esperanza, Cajamarca"
                meta="3 días consecutivos"
                tag="Escalado"
                tagColor="bg-red-100 text-red-600"
              />
              <AlertaItem
                badge="RESUELTO — ICBF"
                badgeColor="bg-green-100 text-green-700"
                titulo="Contratista por desidia del operador — Comedor Comunitario, Chapinero"
                meta="Procesado en < 48h"
                tag="Resuelto"
                tagColor="bg-green-100 text-green-600"
              />
              <AlertaItem
                badge="NUEVO REPORTE"
                badgeColor="bg-blue-100 text-blue-700"
                titulo="Sin entrega — Comedor #13, San Isidro, Soledad/Atlántico"
                meta="Hace 36 min"
                tag="Nuevo"
                tagColor="bg-blue-100 text-blue-600"
              />
            </div>

            {/* Stats del panel */}
            <div className="grid grid-cols-4 border-t border-gray-100">
              {[
                { value: '342', label: 'Reportes' },
                { value: '18', label: 'Municipios' },
                { value: '94%', label: 'Verificados' },
                { value: '87%', label: 'Resueltos' },
              ].map((s) => (
                <div key={s.label} className="py-4 text-center border-r border-gray-100 last:border-r-0">
                  <p className="text-lg font-bold text-[#1C3828]">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Decoración */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-[#F4B534] opacity-20 -z-10" />
          <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-[#587546] opacity-20 -z-10" />
        </div>
      </div>
    </section>
  )
}

function AlertaItem({
  badge, badgeColor, titulo, meta, tag, tagColor
}: {
  badge: string; badgeColor: string; titulo: string
  meta: string; tag: string; tagColor: string
}) {
  return (
    <div className="px-5 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full self-start ${badgeColor}`}>
            {badge}
          </span>
          <p className="text-xs text-gray-700 leading-snug line-clamp-2">{titulo}</p>
          <p className="text-[10px] text-gray-400">{meta}</p>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap shrink-0 ${tagColor}`}>
          {tag}
        </span>
      </div>
    </div>
  )
}
