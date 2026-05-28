'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { ResumenPDF } from './ResumenPDF'
import type { FilaMunicipio, Reporte } from '@/types/reportes'

type Props = {
  totalGlobal: number
  municipiosAfectados: number
  totalPersonasGlobal: number
  depMasCritico: string
  ranking: FilaMunicipio[]
  reportesFiltrados: Reporte[]
  filtroFechaDesde: string
  filtroFechaHasta: string
  filtroDepartamento: string
  filtroMunicipio: string
  filtroEstado: string
  filtrosActivos: number
}

export function BotonDescargaPDF(props: Props) {
  const [generando, setGenerando] = useState(false)

  async function descargar() {
    setGenerando(true)
    try {
      const fechaGeneracion = new Date().toLocaleDateString('es-CO', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
      const nombreArchivo = `komared-reporte-${new Date().toISOString().split('T')[0]}.pdf`

      const blob = await pdf(
        <ResumenPDF {...props} fechaGeneracion={fechaGeneracion} />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href     = url
      a.download = nombreArchivo
      a.click()
      URL.revokeObjectURL(url)
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
