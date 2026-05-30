'use client'

import { useEffect, useState } from 'react'
import type { Reporte } from '@/types/reportes'

export function useHistoricoDemo() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const res = await fetch('/api/demo/reportes?all=true')
      if (!res.ok) return
      const { data } = await res.json()
      setReportes(data)
      setCargando(false)
    }
    cargar()
  }, [])

  return { reportes, cargando }
}
