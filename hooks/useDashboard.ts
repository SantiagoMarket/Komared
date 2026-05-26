'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { Reporte } from '@/types/reportes'

export function useDashboard() {
  const [reportes, setReportes]         = useState<Reporte[]>([])
  const [cargando, setCargando]         = useState(true)
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

  return { reportes, cargando, actualizando, cambiarEstado }
}
