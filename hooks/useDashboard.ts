'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { Reporte } from '@/types/reportes'

const LIMIT = 20

export function useDashboard() {
  const [reportes, setReportes]         = useState<Reporte[]>([])
  const [cargando, setCargando]         = useState(true)
  const [actualizando, setActualizando] = useState<string | null>(null)
  const [pagina, setPagina]             = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [total, setTotal]               = useState(0)
  const paginaRef                       = useRef(1)

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  const cargarReportes = useCallback(async (p?: number) => {
    const paginaActual = p ?? paginaRef.current
    const res = await fetch(`/api/reportes?page=${paginaActual}&limit=${LIMIT}`)
    if (!res.ok) return
    const { data, total: totalGlobal, totalPaginas: paginas } = await res.json()
    setReportes(data as Reporte[])
    setTotal(totalGlobal)
    setTotalPaginas(paginas)
    setCargando(false)
  }, [])

  useEffect(() => {
    cargarReportes()
    const canal = supabase
      .channel('dashboard-reportes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reportes' }, () => cargarReportes())
      .subscribe()
    return () => { supabase.removeChannel(canal) }
  }, [cargarReportes, supabase])

  function irAPagina(n: number) {
    const siguiente = Math.max(1, Math.min(n, totalPaginas))
    paginaRef.current = siguiente
    setPagina(siguiente)
    cargarReportes(siguiente)
  }

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

  return { reportes, cargando, actualizando, cambiarEstado, pagina, totalPaginas, total, irAPagina }
}
