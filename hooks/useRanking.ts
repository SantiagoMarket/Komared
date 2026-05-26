'use client'

import { useMemo } from 'react'
import type { Reporte, FilaMunicipio } from '@/types/reportes'
import { calcularRanking, calcularDepMasCritico, type Tab } from '@/lib/ranking-aggregation'

export type { Tab }

export function useRanking(
  reportesFiltrados: Reporte[],
  filtroDepartamento: string,
  tab: Tab
) {
  const ranking = useMemo<FilaMunicipio[]>(
    () => calcularRanking(reportesFiltrados, filtroDepartamento, tab),
    [reportesFiltrados, filtroDepartamento, tab]
  )

  const maxTotal    = ranking[0]?.total ?? 1
  const maxTiempo   = ranking[0]?.promedioTiempo ?? 1
  const maxPersonas = ranking[0]?.totalPersonas ?? 1

  const depMasCritico = useMemo(
    () => calcularDepMasCritico(reportesFiltrados),
    [reportesFiltrados]
  )

  return { ranking, maxTotal, maxTiempo, maxPersonas, depMasCritico }
}
