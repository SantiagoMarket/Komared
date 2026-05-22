const links = {
  Plataforma: [
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Mapa vivo', href: '#mapa' },
    { label: 'Reportar problema', href: '#unete' },
  ],
  Institucional: [
    { label: 'Propósito', href: '#proposito' },
    { label: 'Únete a la red', href: '#unete' },
    { label: 'Acceso validadores', href: '/login' },
    { label: 'Política de privacidad', href: '/politica-de-privacidad' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#1B1818] px-6 py-14">
      <div className="max-w-7xl mx-auto">

        <div className="grid md:grid-cols-3 gap-12 mb-12">

          {/* Marca */}
          <div className="flex flex-col gap-4">
            <a href="#" className="flex items-center gap-2.5">
              <img src="/logo-komared.svg" alt="KomaRed" className="h-8 w-auto" />
              <span className="font-bold text-xl text-white">
                Koma<span className="text-[#F4B534]">Red</span>
              </span>
            </a>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Vigilancia ciudadana en torno a la alimentación. Plataforma de
              veeduría para una alimentación digna, justa y transparente.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([categoria, items]) => (
            <div key={categoria}>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                {categoria}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-500 hover:text-white transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} KomaRed · Vigilancia ciudadana en torno a la alimentación
          </p>
          <p className="text-gray-700 text-xs">
            Datos de tu comunidad · Para tu comunidad
          </p>
        </div>
      </div>
    </footer>
  )
}
