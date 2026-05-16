'use client'

import dynamic from 'next/dynamic'

const MapaCalor = dynamic(() => import('@/components/MapaCalor'), { ssr: false })

export default function PaginaMapa() {
  return (
    <main className="flex flex-col h-screen bg-gray-950">
      <header className="flex items-center gap-3 px-5 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
        <h1 className="text-white font-semibold text-sm tracking-wide uppercase">
          Monitor PAE / Comedores — Colombia
        </h1>
        <span className="ml-auto text-xs text-gray-500">En vivo · Reportes verificados</span>
      </header>
      <div className="flex-1">
        <MapaCalor />
      </div>
    </main>
  )
}
