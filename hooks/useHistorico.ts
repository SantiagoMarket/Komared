'use client'

import { useEffect, useState } from 'react'
import type { Reporte } from '@/types/reportes'

export function useHistorico() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const res = await fetch('/api/reportes')
      if (res.status === 401) { window.location.href = '/login?next=/historico'; return }
      if (!res.ok) return
      setReportes(await res.json())
      setCargando(false)
    }
    cargar()
  }, [])

  return { reportes, cargando }
}
