'use client'

import { useState } from 'react'

type Props = {
  filtroFechaDesde: string
  filtroFechaHasta: string
  filtroDepartamento: string
  filtroMunicipio: string
  filtroEstado: string
  filtrosActivos: number
  tab: string
}

export function BotonDescargaPDF({
  filtroFechaDesde, filtroFechaHasta, filtroDepartamento,
  filtroMunicipio, filtroEstado, filtrosActivos, tab,
}: Props) {
  const [generando, setGenerando] = useState(false)

  async function descargar() {
    setGenerando(true)
    try {
      const params = new URLSearchParams({
        fechaDesde:    filtroFechaDesde,
        fechaHasta:    filtroFechaHasta,
        departamento:  filtroDepartamento,
        municipio:     filtroMunicipio,
        estado:        filtroEstado,
        filtrosActivos: String(filtrosActivos),
        tab,
      })

      const res = await fetch(`/api/historico/pdf?${params}`)
      if (!res.ok) throw new Error('Error generando PDF')

      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `komared-reporte-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('No se pudo generar el PDF. Intenta de nuevo.')
    } finally {
      setGenerando(false)
    }
  }

  return (
    <button
      onClick={descargar}
      disabled={generando}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#1C3828] text-white hover:bg-[#2a5240] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {generando ? (
        <>
          <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Descargar PDF
        </>
      )}
    </button>
  )
}
