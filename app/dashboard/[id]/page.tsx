'use client'

import { use, useEffect, useState } from 'react'

type ReporteDetalle = {
  id: string
  tipo: string
  nombre_lugar: string | null
  municipio: string | null
  departamento: string | null
  estado: string
  created_at: string
  personas_afectadas: number | null
  tiempo_situacion_dias: number | null
  canal: string | null
  media_url: string | null
  media_mime_type: string | null
}

const ETIQUETAS: Record<string, string> = {
  comedor_sin_alimentos: 'Sin alimentos',
  comedor_cerrado: 'Cerrado',
  comedor_calidad_deficiente: 'Calidad deficiente',
  comedor_contratista_ausente: 'Contratista ausente',
  pae_no_entregado: 'PAE no entregado',
  pae_calidad_deficiente: 'PAE calidad deficiente',
  icbf_sin_entrega: 'ICBF sin entrega',
  desnutricion_cronica: 'Desnutrición crónica',
  deficit_alimentario: 'Déficit alimentario',
  otro: 'Otro',
}

const BADGE: Record<string, string> = {
  pendiente:   'bg-yellow-900/40 text-yellow-400 ring-1 ring-yellow-700',
  critico:     'bg-red-900/40 text-red-400 ring-1 ring-red-700',
  en_curso:    'bg-blue-900/40 text-blue-400 ring-1 ring-blue-700',
  solucionado: 'bg-green-900/40 text-green-400 ring-1 ring-green-700',
}

const LABEL_ESTADO: Record<string, string> = {
  pendiente:   'Pendiente',
  critico:     'Crítico',
  en_curso:    'En curso',
  solucionado: 'Solucionado',
}

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
          <button
            onClick={() => window.history.back()}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            ← Volver
          </button>
        </div>
      </main>
    )
  }

  const esImagen = reporte.media_mime_type?.startsWith('image/')
  const esVideo  = reporte.media_mime_type?.startsWith('video/')

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="px-6 py-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Volver al dashboard
        </button>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${BADGE[reporte.estado] ?? ''}`}>
          {LABEL_ESTADO[reporte.estado] ?? reporte.estado}
        </span>
      </header>

      <div className="max-w-2xl mx-auto p-6 space-y-6">

        {/* Cabecera del reporte */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
            {ETIQUETAS[reporte.tipo] ?? reporte.tipo}
          </p>
          <h1 className="text-xl font-bold text-white mb-1">
            {reporte.nombre_lugar ?? '—'}
          </h1>
          <p className="text-gray-400 text-sm">
            {[reporte.municipio, reporte.departamento].filter(Boolean).join(', ') || '—'}
          </p>
          <p className="text-gray-600 text-xs mt-2">
            {new Date(reporte.created_at).toLocaleDateString('es-CO', {
              day: '2-digit', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
            {reporte.canal && ` · vía ${reporte.canal}`}
          </p>
        </div>

        {/* Métricas */}
        {(reporte.personas_afectadas || reporte.tiempo_situacion_dias) && (
          <div className="grid grid-cols-2 gap-4">
            {reporte.personas_afectadas && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Personas afectadas</p>
                <p className="text-2xl font-bold text-amber-400">
                  {reporte.personas_afectadas.toLocaleString('es-CO')}
                </p>
              </div>
            )}
            {reporte.tiempo_situacion_dias && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Tiempo en situación</p>
                <p className="text-2xl font-bold text-red-400">{reporte.tiempo_situacion_dias} días</p>
              </div>
            )}
          </div>
        )}

        {/* Media */}
        {reporte.media_url && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <p className="text-gray-500 text-xs uppercase tracking-wide px-5 pt-4 pb-3">Evidencia multimedia</p>
            {esImagen && (
              <img
                src={reporte.media_url}
                alt="Evidencia del reporte"
                className="w-full object-contain max-h-[480px] bg-black"
              />
            )}
            {esVideo && (
              <video
                src={reporte.media_url}
                controls
                className="w-full max-h-[480px] bg-black"
              />
            )}
            {!esImagen && !esVideo && (
              <div className="px-5 pb-5">
                <a
                  href={reporte.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-sm underline"
                >
                  Abrir archivo adjunto
                </a>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  )
}
