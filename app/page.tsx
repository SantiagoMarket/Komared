import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-2xl flex flex-col items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-sm font-medium tracking-widest uppercase">En vivo</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          Veeduría ciudadana<br />
          <span className="text-red-400">contra el hambre</span>
        </h1>

        <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
          Monitoreo participativo de comedores comunitarios y el Programa de
          Alimentación Escolar (PAE) en Colombia. Datos ciudadanos verificados,
          en tiempo real.
        </p>

        <Link
          href="/mapa"
          className="mt-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-semibold text-lg rounded-full transition-colors"
        >
          Ver mapa de reportes
        </Link>

        <div className="flex gap-10 mt-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">La Guajira</p>
            <p className="text-gray-500 text-sm">Zona prioritaria</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">Chocó</p>
            <p className="text-gray-500 text-sm">Zona prioritaria</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">PAE</p>
            <p className="text-gray-500 text-sm">Programa monitoreado</p>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-6 text-gray-600 text-xs">
        Dossier · Inteligencia cívica sobre seguridad alimentaria
      </footer>
    </main>
  )
}
