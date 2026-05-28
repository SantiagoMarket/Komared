import { type NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { getSupabaseAdmin } from '@/backend/supabase-admin'
import { verificarSesion } from '@/lib/auth-server'
import { notificarError } from '@/backend/notificar-error'
import { calcularRanking, calcularDepMasCritico, type Tab } from '@/lib/ranking-aggregation'
import { ResumenPDF } from '@/app/historico/components/ResumenPDF'
import type { Reporte } from '@/types/reportes'

export const dynamic = 'force-dynamic'

const CAMPOS = 'id, tipo, nombre_lugar, municipio, departamento, estado, created_at, lat, lng, personas_afectadas, tiempo_situacion_dias, canal'

function aplicarFiltros(reportes: Reporte[], params: URLSearchParams): Reporte[] {
  const fechaDesde     = params.get('fechaDesde') ?? ''
  const fechaHasta     = params.get('fechaHasta') ?? ''
  const filtroMunicipio = params.get('municipio') ?? 'todos'
  const filtroEstado    = params.get('estado')    ?? 'todos'

  return reportes.filter((r) => {
    if (fechaDesde && r.created_at < fechaDesde)                        return false
    if (fechaHasta && r.created_at > fechaHasta + 'T23:59:59')         return false
    if (filtroMunicipio !== 'todos' && r.municipio !== filtroMunicipio) return false
    if (filtroEstado    !== 'todos' && r.estado    !== filtroEstado)    return false
    return true
  })
}

export async function GET(req: NextRequest) {
  if (!await verificarSesion()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const filtroDepartamento = searchParams.get('departamento') ?? 'todos'
  const tab                = (searchParams.get('tab') ?? 'reportes') as Tab
  const filtroFechaDesde   = searchParams.get('fechaDesde')  ?? ''
  const filtroFechaHasta   = searchParams.get('fechaHasta')  ?? ''
  const filtroMunicipio    = searchParams.get('municipio')   ?? 'todos'
  const filtroEstado       = searchParams.get('estado')      ?? 'todos'
  const filtrosActivos     = parseInt(searchParams.get('filtrosActivos') ?? '0')

  const { data, error } = await getSupabaseAdmin()
    .from('reportes')
    .select(CAMPOS)
    .neq('estado', 'solucionado')
    .order('created_at', { ascending: false })

  if (error) {
    await notificarError('api/historico/pdf GET', error)
    return NextResponse.json({ error: 'Error al obtener reportes' }, { status: 500 })
  }

  const reportesFiltrados  = aplicarFiltros(data as Reporte[], searchParams)
  const ranking            = calcularRanking(reportesFiltrados, filtroDepartamento, tab)
  const depMasCritico      = calcularDepMasCritico(reportesFiltrados)
  const totalGlobal        = reportesFiltrados.length
  const municipiosAfectados = new Set(reportesFiltrados.map((r) => r.municipio).filter(Boolean)).size
  const totalPersonasGlobal = reportesFiltrados.reduce((acc, r) => acc + (r.personas_afectadas ?? 0), 0)

  const fechaGeneracion = new Date().toLocaleDateString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const buffer = await renderToBuffer(
    <ResumenPDF
      totalGlobal={totalGlobal}
      municipiosAfectados={municipiosAfectados}
      totalPersonasGlobal={totalPersonasGlobal}
      depMasCritico={depMasCritico}
      ranking={ranking}
      reportesFiltrados={reportesFiltrados}
      filtroFechaDesde={filtroFechaDesde}
      filtroFechaHasta={filtroFechaHasta}
      filtroDepartamento={filtroDepartamento}
      filtroMunicipio={filtroMunicipio}
      filtroEstado={filtroEstado}
      filtrosActivos={filtrosActivos}
      fechaGeneracion={fechaGeneracion}
    />
  )

  const fecha = new Date().toISOString().split('T')[0]

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="komared-reporte-${fecha}.pdf"`,
      'Cache-Control':       'no-store',
    },
  })
}
