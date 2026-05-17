'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

type Reporte = {
  id: string
  tipo: string
  nombre_lugar: string | null
  municipio: string | null
  departamento: string | null
  estado: string
  nombre_reportante: string | null
  telegram_username: string | null
  telefono_reporte: string
  created_at: string
}

const ETIQUETAS: Record<string, string> = {
  comedor_sin_alimentos: 'Sin alimentos',
  comedor_cerrado: 'Cerrado',
  comedor_calidad_deficiente: 'Calidad deficiente',
  comedor_contratista_ausente: 'Contratista ausente',
  pae_no_entregado: 'PAE no entregado',
  pae_calidad_deficiente: 'PAE calidad deficiente',
  icbf_sin_entrega: 'ICBF sin entrega',
  otro: 'Otro',
}

const COLORES_ESTADO: Record<string, string> = {
  aprobado: 'bg-green-100 text-green-800',
  critico: 'bg-red-100 text-red-800',
  resuelto: 'bg-gray-100 text-gray-500',
}

export default function Dashboard() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [resolviendo, setResolviendo] = useState<string | null>(null)

  const cargarReportes = useCallback(async () => {
    const { data } = await supabase
      .from('reportes')
      .select('id, tipo, nombre_lugar, municipio, departamento, estado, nombre_reportante, telegram_username, telefono_reporte, created_at')
      .in('estado', ['aprobado', 'critico'])
      .order('created_at', { ascending: false })
    setReportes((data as Reporte[]) ?? [])
    setCargando(false)
  }, [])

  useEffect(() => {
    cargarReportes()

    const canal = supabase
      .channel('dashboard-reportes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reportes' }, cargarReportes)
      .subscribe()

    return () => { supabase.removeChannel(canal) }
  }, [cargarReportes])

  async function resolver(id: string) {
    setResolviendo(id)
    await fetch(`/api/reportes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'resuelto' }),
    })
    setResolviendo(null)
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
                  <th className="pb-3 pr-4">Contacto</th>
                  <th className="pb-3 pr-4">Telegram</th>
                  <th className="pb-3 pr-4">Estado</th>
                  <th className="pb-3 pr-4">Fecha</th>
                  <th className="pb-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {reportes.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-900 transition-colors">
                    <td className="py-3 pr-4 text-white">{ETIQUETAS[r.tipo] ?? r.tipo}</td>
                    <td className="py-3 pr-4 text-gray-300">{r.nombre_lugar ?? '—'}</td>
                    <td className="py-3 pr-4 text-gray-300">
                      {[r.municipio, r.departamento].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="py-3 pr-4 text-gray-300">{r.nombre_reportante ?? '—'}</td>
                    <td className="py-3 pr-4">
                      {r.telegram_username ? (
                        <a
                          href={`https://t.me/${r.telegram_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          @{r.telegram_username}
                        </a>
                      ) : (
                        <span className="text-gray-500">ID: {r.telefono_reporte}</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${COLORES_ESTADO[r.estado] ?? ''}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">
                      {new Date(r.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => resolver(r.id)}
                        disabled={resolviendo === r.id}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white text-xs rounded-lg transition-colors"
                      >
                        {resolviendo === r.id ? 'Resolviendo...' : 'Marcar resuelto'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
