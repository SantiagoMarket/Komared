'use client'

import { use, useEffect, useState } from 'react'
import type { ReporteDetalle, MediaArchivo } from '@/types/reportes'
import { DetalleHeader } from './components/DetalleHeader'
import { DetalleInfo } from './components/DetalleInfo'
import { DetalleMetricas } from './components/DetalleMetricas'
import { MediaGallery } from './components/MediaGallery'

export default function DetalleReporte({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [reporte, setReporte] = useState<ReporteDetalle | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function cargar() {
      const res = await fetch(`/api/reportes/${id}`)
      if (!res.ok) { setError(true); setCargando(false); return }
      setReporte(await res.json())
      setCargando(false)
    }
    cargar()
  }, [id])

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-500">Cargando reporte...</p>
      </main>
    )
  }

  if (error || !reporte) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Reporte no encontrado.</p>
          <button onClick={() => window.history.back()} className="text-xs text-gray-500 hover:text-gray-300">
            ← Volver
          </button>
        </div>
      </main>
    )
  }

  // Fallback para reportes viejos sin entradas en reportes_media
  const archivos: MediaArchivo[] = reporte.media_archivos?.length > 0
    ? reporte.media_archivos
    : reporte.media_signed_url
      ? [{ signed_url: reporte.media_signed_url, mime_type: reporte.media_mime_type }]
      : []

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <DetalleHeader estado={reporte.estado} />
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <DetalleInfo
          tipo={reporte.tipo}
          nombre_lugar={reporte.nombre_lugar}
          municipio={reporte.municipio}
          departamento={reporte.departamento}
          created_at={reporte.created_at}
          canal={reporte.canal}
        />
        <DetalleMetricas
          personasAfectadas={reporte.personas_afectadas}
          tiempoSituacionDias={reporte.tiempo_situacion_dias}
        />
        <MediaGallery archivos={archivos} />
      </div>
    </main>
  )
}
