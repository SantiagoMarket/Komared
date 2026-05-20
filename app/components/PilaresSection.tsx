const pilares = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    titulo: 'Ciudadanía Activa',
    descripcion:
      'Empoderamos a las comunidades, líderes locales y Juntas de Acción Comunal con herramientas seguras para participar, reportar y exigir sus derechos en el territorio.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    titulo: 'Datos con Propósito',
    descripcion:
      'Transformamos los reportes comunitarios anónimos en información analítica georreferenciada útil para la toma de decisiones estratégicas y auditorías institucionales.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    titulo: 'Alimentación Digna',
    descripcion:
      'Trabajamos para que los programas del Estado, la Red ABACO y las agencias aliadas actúen de forma articulada, justa, transparente y oportuna.',
  },
]

export default function PilaresSection() {
  return (
    <section id="proposito" className="bg-[#1C3828] px-6 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto">

        <div className="mb-14">
          <p className="text-[#F4B534] text-xs font-bold tracking-widest uppercase mb-4">
            — Nuestro Propósito
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
            Tres pilares de{' '}
            <em className="italic text-[#F4B534] not-italic italic">impacto real</em>
          </h2>
          <p className="text-[#9ca3af] text-lg max-w-2xl leading-relaxed">
            Conectar a las personas con la información y las herramientas para
            mejorar la alimentación en sus comunidades.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {pilares.map((pilar) => (
            <div
              key={pilar.titulo}
              className="bg-white rounded-2xl p-7 flex flex-col gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F5F3EE] flex items-center justify-center text-[#1C3828]">
                {pilar.icon}
              </div>
              <h3 className="text-sm font-bold text-[#1B1818] uppercase tracking-wide">
                {pilar.titulo}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {pilar.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
