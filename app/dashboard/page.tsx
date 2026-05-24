'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Reporte = {
  id: string
  tipo: string
  nombre_lugar: string | null
  municipio: string | null
  departamento: string | null
  estado: string
  created_at: string
}

type EstadoActivo = 'pendiente' | 'en_curso' | 'critico'

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
  pendiente: 'bg-yellow-900/40 text-yellow-400 ring-1 ring-yellow-700',
  critico:   'bg-red-900/40   text-red-400   ring-1 ring-red-700',
  en_curso:  'bg-blue-900/40  text-blue-400  ring-1 ring-blue-700',
}

const LABEL_ESTADO: Record<string, string> = {
  pendiente: 'Pendiente',
  critico:   'Crítico',
  en_curso:  'En curso',
}

// Qué acciones se muestran según el estado actual del reporte
const ACCIONES: Record<EstadoActivo, { label: string; estado: string; cls: string }[]> = {
  pendiente: [
    { label: 'En curso',    estado: 'en_curso',    cls: 'bg-blue-800 hover:bg-blue-700 text-blue-100' },
    { label: 'Crítico',     estado: 'critico',     cls: 'bg-red-800 hover:bg-red-700 text-red-100' },
    { label: 'Solucionado', estado: 'solucionado', cls: 'bg-green-800 hover:bg-green-700 text-green-100' },
  ],
  critico: [
    { label: 'En curso',    estado: 'en_curso',    cls: 'bg-blue-800 hover:bg-blue-700 text-blue-100' },
    { label: 'Solucionado', estado: 'solucionado', cls: 'bg-green-800 hover:bg-green-700 text-green-100' },
  ],
  en_curso: [
    { label: 'Crítico',     estado: 'critico',     cls: 'bg-red-800 hover:bg-red-700 text-red-100' },
    { label: 'Solucionado', estado: 'solucionado', cls: 'bg-green-800 hover:bg-green-700 text-green-100' },
  ],
}

export default function Dashboard() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState<string | null>(null)

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  const cargarReportes = useCallback(async () => {
    const res = await fetch('/api/reportes')
    if (!res.ok) return
    const data: Reporte[] = await res.json()
    setReportes(data.filter((r) => r.estado !== 'solucionado'))
    setCargando(false)
  }, [])

  useEffect(() => {
    cargarReportes()

    const canal = supabase
      .channel('dashboard-reportes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reportes' }, cargarReportes)
      .subscribe()

    return () => { supabase.removeChannel(canal) }
  }, [cargarReportes, supabase])

  async function cambiarEstado(id: string, nuevoEstado: string) {
    if (nuevoEstado === 'solucionado') {
      const confirmado = window.confirm('¿Confirmas que este reporte fue resuelto?')
      if (!confirmado) return
    }
    setActualizando(id)
    await fetch(`/api/reportes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    })
    setActualizando(null)
    cargarReportes()
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="px-6 py-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          <h1 className="font-semibold text-sm tracking-wide uppercase">Dashboard Validadores</h1>
        </div>
        <div className="flex items-center gap-4">
          <a href="/historico" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Ver histórico →
          </a>
          <span className="text-gray-400 text-sm">{reportes.length} reportes activos</span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-xs text-gray-500 hover:text-red-400 transition-colors">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <div className="p-6">
        {cargando ? (
          <p className="text-gray-500 text-center py-20">Cargando reportes...</p>
        ) : reportes.length === 0 ? (
          <p className="text-gray-500 text-center py-20">No hay reportes activos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="pb-3 pr-4">Tipo</th>
                  <th className="pb-3 pr-4">Lugar</th>
                  <th className="pb-3 pr-4">Municipio</th>
                  <th className="pb-3 pr-4">Estado</th>
                  <th className="pb-3 pr-4">Fecha</th>
                  <th className="pb-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {reportes.map((r) => {
                  const acciones = ACCIONES[r.estado as EstadoActivo] ?? []
                  const ocupado = actualizando === r.id
                  return (
                    <tr key={r.id} className="hover:bg-gray-900 transition-colors">
                      <td className="py-3 pr-4 text-white">{ETIQUETAS[r.tipo] ?? r.tipo}</td>
                      <td className="py-3 pr-4 text-gray-300">{r.nombre_lugar ?? '—'}</td>
                      <td className="py-3 pr-4 text-gray-300">
                        {[r.municipio, r.departamento].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${BADGE[r.estado] ?? ''}`}>
                          {LABEL_ESTADO[r.estado] ?? r.estado}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-500 text-xs">
                        {new Date(r.created_at).toLocaleDateString('es-CO', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {acciones.map((a) => (
                            <button
                              key={a.estado}
                              onClick={() => cambiarEstado(r.id, a.estado)}
                              disabled={ocupado}
                              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors disabled:opacity-40 ${a.cls}`}
                            >
                              {ocupado ? '…' : a.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
