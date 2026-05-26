'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import NavbarApp from '@/app/components/NavbarApp'

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
  comedor_sin_alimentos:       'Sin alimentos',
  comedor_cerrado:             'Cerrado',
  comedor_calidad_deficiente:  'Calidad deficiente',
  comedor_contratista_ausente: 'Contratista ausente',
  pae_no_entregado:            'PAE no entregado',
  pae_calidad_deficiente:      'PAE calidad deficiente',
  icbf_sin_entrega:            'ICBF sin entrega',
  desnutricion_cronica:        'Desnutrición crónica',
  deficit_alimentario:         'Déficit alimentario',
  otro:                        'Otro',
}

const BADGE: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  critico:   'bg-red-100   text-red-700   ring-1 ring-red-200',
  en_curso:  'bg-blue-100  text-blue-700  ring-1 ring-blue-200',
}

const LABEL_ESTADO: Record<string, string> = {
  pendiente: 'Pendiente',
  critico:   'Crítico',
  en_curso:  'En curso',
}

const ACCIONES: Record<EstadoActivo, { label: string; estado: string; cls: string }[]> = {
  pendiente: [
    { label: 'En curso',    estado: 'en_curso',    cls: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { label: 'Crítico',     estado: 'critico',     cls: 'bg-red-100 text-red-700 hover:bg-red-200' },
    { label: 'Solucionado', estado: 'solucionado', cls: 'bg-green-100 text-green-700 hover:bg-green-200' },
  ],
  critico: [
    { label: 'En curso',    estado: 'en_curso',    cls: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { label: 'Solucionado', estado: 'solucionado', cls: 'bg-green-100 text-green-700 hover:bg-green-200' },
  ],
  en_curso: [
    { label: 'Crítico',     estado: 'critico',     cls: 'bg-red-100 text-red-700 hover:bg-red-200' },
    { label: 'Solucionado', estado: 'solucionado', cls: 'bg-green-100 text-green-700 hover:bg-green-200' },
  ],
}


export default function Dashboard() {
  const [reportes, setReportes]       = useState<Reporte[]>([])
  const [cargando, setCargando]       = useState(true)
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
    <main className="min-h-screen bg-gray-50">


      <NavbarApp />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h1 className="text-xl font-bold text-gray-900">Dashboard Validadores</h1>
            {!cargando && (
              <span className="ml-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                {reportes.length} activos
              </span>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {cargando ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-3">
                <div className="w-7 h-7 rounded-full border-2 border-[#587546] border-t-transparent animate-spin" />
                <p className="text-gray-400 text-sm">Cargando reportes...</p>
              </div>
            </div>
          ) : reportes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm font-medium">No hay reportes activos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">Tipo</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">Lugar</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">Municipio</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">Estado</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">Fecha</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">Acciones</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reportes.map((r) => {
                    const acciones = ACCIONES[r.estado as EstadoActivo] ?? []
                    const ocupado  = actualizando === r.id
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/70 transition-colors group">
                        <td className="px-5 py-4 text-gray-900 font-medium whitespace-nowrap">
                          {ETIQUETAS[r.tipo] ?? r.tipo}
                        </td>
                        <td className="px-4 py-4 text-gray-600 max-w-[220px] truncate">
                          {r.nombre_lugar ?? '—'}
                        </td>
                        <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                          {[r.municipio, r.departamento].filter(Boolean).join(', ') || '—'}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${BADGE[r.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                            {LABEL_ESTADO[r.estado] ?? r.estado}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(r.created_at).toLocaleDateString('es-CO', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            {acciones.map((a) => (
                              <button
                                key={a.estado}
                                onClick={() => cambiarEstado(r.id, a.estado)}
                                disabled={ocupado}
                                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors disabled:opacity-40 ${a.cls}`}
                              >
                                {ocupado ? '…' : a.label}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <a
                            href={`/dashboard/${r.id}`}
                            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#1C3828] font-medium transition-colors group-hover:text-[#587546]"
                          >
                            Ver
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
