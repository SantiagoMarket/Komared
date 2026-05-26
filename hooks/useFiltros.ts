'use client'

import { useState, useMemo } from 'react'
import type { Reporte } from '@/types/reportes'

export function useFiltros(reportes: Reporte[]) {
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [filtroMunicipio, setFiltroMunicipio]   = useState('todos')
  const [filtroEstado, setFiltroEstado]         = useState('todos')
  const [filtroDepartamento, setFiltroDepartamento] = useState('todos')

  const reportesFiltrados = useMemo(() => {
    return reportes.filter((r) => {
      if (filtroFechaDesde && r.created_at < filtroFechaDesde) return false
      if (filtroFechaHasta && r.created_at > filtroFechaHasta + 'T23:59:59') return false
      if (filtroMunicipio !== 'todos' && r.municipio !== filtroMunicipio) return false
      if (filtroEstado !== 'todos' && r.estado !== filtroEstado) return false
      return true
    })
  }, [reportes, filtroFechaDesde, filtroFechaHasta, filtroMunicipio, filtroEstado])

  const departamentos = useMemo(() => {
    const deps = new Set(reportes.map((r) => r.departamento).filter(Boolean) as string[])
    return Array.from(deps).sort()
  }, [reportes])

  const municipios = useMemo(() => {
    const ms = new Set(reportes.map((r) => r.municipio).filter(Boolean) as string[])
    return Array.from(ms).sort()
  }, [reportes])

  const filtrosActivos = [
    filtroFechaDesde,
    filtroFechaHasta,
    filtroMunicipio !== 'todos' ? filtroMunicipio : '',
    filtroEstado !== 'todos' ? filtroEstado : '',
    filtroDepartamento !== 'todos' ? filtroDepartamento : '',
  ].filter(Boolean).length

  function limpiarFiltros(onLimpiar?: () => void) {
    setFiltroFechaDesde('')
    setFiltroFechaHasta('')
    setFiltroMunicipio('todos')
    setFiltroEstado('todos')
    setFiltroDepartamento('todos')
    onLimpiar?.()
  }

  return {
    filtroFechaDesde, setFiltroFechaDesde,
    filtroFechaHasta, setFiltroFechaHasta,
    filtroMunicipio,  setFiltroMunicipio,
    filtroEstado,     setFiltroEstado,
    filtroDepartamento, setFiltroDepartamento,
    reportesFiltrados,
    departamentos,
    municipios,
    filtrosActivos,
    limpiarFiltros,
  }
}
