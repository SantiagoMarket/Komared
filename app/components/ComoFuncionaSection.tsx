import KomaBotChat from '@/app/components/KomaBotChat'

const pasos = [
  {
    numero: '01',
    titulo: 'El Reporte Local — WhatsApp / Web',
    descripcion:
      'El ciudadano toma una foto o envía un mensaje de WhatsApp o desde esta página. Solo necesita WhatsApp o acceso a internet.',
    tag: '📱 Sin APP · SIN INTERNET RÁPIDO',
  },
  {
    numero: '02',
    titulo: 'Procesamiento y Anonimización — IA',
    descripcion:
      'Nuestro bot de IA procesa la alerta, extrae las coordenadas y elimina de forma estricta los metadatos de identidad para garantizar la seguridad física y anónima.',
    tag: '🔐 IDENTIDAD PROTEGIDA SIEMPRE',
  },
  {
    numero: '03',
    titulo: 'Enrutamiento de Impacto — Solución en Red',
    descripcion:
      'El caso se georreferencia al mapa de calor dinámico, alertando simultáneamente al Banco de Alimentos más cercano (ABACO), a la prensa de investigación (CLIP) y a los entes de control estatales.',
    tag: '📡 ALERTA SIMULTÁNEA A TODOS LOS ACTORES',
  },
]

export default function ComoFuncionaSection() {
  return (
    <section id="como-funciona" className="bg-[#F5F3EE] px-6 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto">

        <div className="mb-14">
          <p className="text-[#587546] text-xs font-bold tracking-widest uppercase mb-4">
            — Cómo Funciona
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1B1818] leading-tight mb-5">
            Simple, seguro y{' '}
            <em className="italic text-[#587546]">de bajísima fricción</em>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">
            Diseñado para comunidades con conectividad limitada. Sin apps, sin
            barreras, sin miedo.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-14 items-start">

          {/* Pasos */}
          <div className="flex flex-col gap-8">
            {pasos.map((paso) => (
              <div key={paso.numero} className="flex gap-5">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-[#1C3828] flex items-center justify-center">
                  <span className="text-[#F4B534] text-sm font-bold">{paso.numero}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-[#1B1818] text-base">{paso.titulo}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{paso.descripcion}</p>
                  <span className="text-[10px] font-bold tracking-wider text-[#587546] uppercase mt-1">
                    {paso.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chat funcional con KomaBot */}
          <KomaBotChat />
        </div>
      </div>
    </section>
  )
}
