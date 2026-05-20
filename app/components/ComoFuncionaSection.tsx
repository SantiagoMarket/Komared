const pasos = [
  {
    numero: '01',
    titulo: 'El Reporte Local — WhatsApp / SMS',
    descripcion:
      'El ciudadano toma una foto o envía un mensaje de WhatsApp. Solo necesita WhatsApp o un mensaje de texto.',
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

const chatMensajes = [
  { tipo: 'recibido', texto: 'Hola 👋 Soy KomaBot. ¿Quieres reportar un problema con el programa de alimentación?' },
  { tipo: 'enviado', texto: 'Si. Hoy no llegó el almuerzo del PAE 🥺' },
  { tipo: 'recibido', texto: '¿En qué institución? Puedes escribir el nombre o el municipio.' },
  { tipo: 'enviado', texto: 'Escuela Rural La Esperanza, Cajamarca, Tolima' },
  { tipo: 'separador', texto: '2 días seguidos' },
  { tipo: 'recibido', texto: '¿Cuántos días seguidos ha fallado?' },
  { tipo: 'enviado', texto: '3 días seguidos 😔' },
  {
    tipo: 'sistema',
    texto: '✅ Reporte registrado de forma anónima. Tu identidad está protegida. ABACO y los entes de control han sido alertados. Gracias por cuidar a tu comunidad. 🙌',
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

          {/* Chat mockup */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

            {/* Header */}
            <div className="bg-[#1C3828] px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F4B534] flex items-center justify-center shrink-0">
                <img src="/logo-komared.svg" alt="" className="h-4 w-auto brightness-0" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">KomaBot</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <p className="text-green-400 text-[10px]">Canal seguro y anónimo</p>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div className="px-4 py-5 flex flex-col gap-3 bg-[#f0f0f0]">
              {chatMensajes.map((msg, i) => {
                if (msg.tipo === 'separador') {
                  return (
                    <div key={i} className="flex items-center gap-2 my-1">
                      <div className="flex-1 h-px bg-gray-300" />
                      <span className="text-[10px] text-gray-400">{msg.texto}</span>
                      <div className="flex-1 h-px bg-gray-300" />
                    </div>
                  )
                }
                if (msg.tipo === 'sistema') {
                  return (
                    <div key={i} className="bg-[#1C3828] text-white text-xs rounded-xl px-4 py-3 leading-relaxed mx-2">
                      {msg.texto}
                    </div>
                  )
                }
                return (
                  <div
                    key={i}
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed shadow-sm ${
                      msg.tipo === 'enviado'
                        ? 'bg-[#DCF8C6] text-gray-800 self-end rounded-br-none'
                        : 'bg-white text-gray-800 self-start rounded-bl-none'
                    }`}
                  >
                    {msg.texto}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
