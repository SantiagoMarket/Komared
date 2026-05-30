'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const MapaCalorDemo = dynamic(() => import('@/components/MapaCalorDemo'), { ssr: false })

export default function MapaDemo() {
  return (
    <main className="flex flex-col h-screen bg-gray-950">
      <header className="flex items-center gap-3 px-5 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
        <h1 className="text-white font-semibold text-sm tracking-wide uppercase">
          KomaRed · Demo — Reportes en vivo
        </h1>
        <nav className="ml-auto flex items-center gap-3">
          <Link href="/demo/historico" className="px-4 py-1.5 bg-[#1C3828] text-white text-xs font-semibold rounded-full hover:bg-[#2a5040] transition-colors">
            Histórico
          </Link>
        </nav>
      </header>
      <div className="flex-1">
        <MapaCalorDemo />
      </div>
    </main>
  )
}
