import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { FilaMunicipio, Reporte } from '@/types/reportes'
import { ETIQUETAS_TIPO, LABEL_ESTADO } from '@/lib/reportes-config'

const VERDE_OSCURO = '#1C3828'
const VERDE_MEDIO  = '#587546'
const GRIS_TEXTO   = '#374151'
const GRIS_CLARO   = '#9CA3AF'
const ROJO         = '#DC2626'
const FONDO_GRIS   = '#F9FAFB'
const BORDE        = '#E5E7EB'

const s = StyleSheet.create({
  page:           { fontFamily: 'Helvetica', fontSize: 9, color: GRIS_TEXTO, padding: 40, backgroundColor: '#FFFFFF' },

  // Header
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  marca:          { fontSize: 18, fontFamily: 'Helvetica-Bold', color: VERDE_OSCURO, letterSpacing: 1 },
  subtitulo:      { fontSize: 10, color: GRIS_CLARO, marginTop: 3 },
  fechaGen:       { fontSize: 8, color: GRIS_CLARO, textAlign: 'right', marginTop: 4 },

  divider:        { height: 1, backgroundColor: BORDE, marginBottom: 18 },

  // Secciones
  seccionLabel:   { fontSize: 7, fontFamily: 'Helvetica-Bold', color: GRIS_CLARO, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  seccion:        { marginBottom: 20 },

  // Filtros
  filtrosRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  filtroTag:      { backgroundColor: FONDO_GRIS, borderWidth: 1, borderColor: BORDE, borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8, fontSize: 8 },
  filtroLabel:    { fontFamily: 'Helvetica-Bold', color: VERDE_OSCURO },

  // KPIs
  kpiRow:         { flexDirection: 'row', gap: 8 },
  kpiBox:         { flex: 1, backgroundColor: FONDO_GRIS, borderWidth: 1, borderColor: BORDE, borderRadius: 6, padding: 12 },
  kpiValor:       { fontSize: 20, fontFamily: 'Helvetica-Bold', color: VERDE_OSCURO, marginBottom: 3 },
  kpiValorRojo:   { fontSize: 16, fontFamily: 'Helvetica-Bold', color: ROJO, marginBottom: 3 },
  kpiNombre:      { fontSize: 7, color: GRIS_CLARO, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Distribución
  distGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  distItem:       { flexDirection: 'row', alignItems: 'center', gap: 5, width: '31%' },
  distBullet:     { width: 6, height: 6, borderRadius: 3, backgroundColor: VERDE_MEDIO },
  distNombre:     { fontSize: 8, flex: 1 },
  distConteo:     { fontSize: 8, fontFamily: 'Helvetica-Bold', color: VERDE_OSCURO },

  // Tabla ranking
  tablaHeader:    { flexDirection: 'row', backgroundColor: VERDE_OSCURO, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 4, marginBottom: 2 },
  tablaHeaderTxt: { fontFamily: 'Helvetica-Bold', fontSize: 7, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },
  tablaFila:      { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: BORDE },
  tablaFilaAlt:   { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: BORDE, backgroundColor: FONDO_GRIS },
  filaTxt:        { fontSize: 8, color: GRIS_TEXTO },
  filaTxtBold:    { fontSize: 8, fontFamily: 'Helvetica-Bold', color: VERDE_OSCURO },
  filaTxtRojo:    { fontSize: 8, fontFamily: 'Helvetica-Bold', color: ROJO },

  colNum:         { width: 24 },
  colMunicipio:   { flex: 2 },
  colDpto:        { flex: 2 },
  colReportes:    { width: 56, textAlign: 'right' },
  colPersonas:    { width: 64, textAlign: 'right' },
  colEstado:      { width: 56, textAlign: 'right' },

  // Footer
  footer:         { position: 'absolute', bottom: 28, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerTxt:      { fontSize: 7, color: GRIS_CLARO },
  footerMarca:    { fontSize: 7, fontFamily: 'Helvetica-Bold', color: VERDE_OSCURO },
})

type Props = {
  totalGlobal: number
  municipiosAfectados: number
  totalPersonasGlobal: number
  depMasCritico: string
  ranking: FilaMunicipio[]
  reportesFiltrados: Reporte[]
  filtroFechaDesde: string
  filtroFechaHasta: string
  filtroDepartamento: string
  filtroMunicipio: string
  filtroEstado: string
  filtrosActivos: number
  fechaGeneracion: string
}

function calcularDistribucion(reportes: Reporte[]) {
  const acc: Record<string, number> = {}
  for (const r of reportes) acc[r.tipo] = (acc[r.tipo] ?? 0) + 1
  return Object.entries(acc).sort((a, b) => b[1] - a[1])
}

export function ResumenPDF({
  totalGlobal, municipiosAfectados, totalPersonasGlobal, depMasCritico,
  ranking, reportesFiltrados,
  filtroFechaDesde, filtroFechaHasta, filtroDepartamento, filtroMunicipio, filtroEstado,
  filtrosActivos, fechaGeneracion,
}: Props) {
  const top10        = ranking.slice(0, 10)
  const distribucion = calcularDistribucion(reportesFiltrados)

  return (
    <Document title="Informe KomaRed" author="KomaRed">
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.marca}>KOMARED</Text>
            <Text style={s.subtitulo}>Informe de Reportes PAE</Text>
          </View>
          <Text style={s.fechaGen}>Generado el {fechaGeneracion}</Text>
        </View>

        <View style={s.divider} />

        {/* Filtros activos */}
        {filtrosActivos > 0 && (
          <View style={s.seccion}>
            <Text style={s.seccionLabel}>Filtros aplicados</Text>
            <View style={s.filtrosRow}>
              {filtroFechaDesde && (
                <View style={s.filtroTag}>
                  <Text><Text style={s.filtroLabel}>Desde: </Text>{filtroFechaDesde}</Text>
                </View>
              )}
              {filtroFechaHasta && (
                <View style={s.filtroTag}>
                  <Text><Text style={s.filtroLabel}>Hasta: </Text>{filtroFechaHasta}</Text>
                </View>
              )}
              {filtroDepartamento && filtroDepartamento !== 'todos' && (
                <View style={s.filtroTag}>
                  <Text><Text style={s.filtroLabel}>Departamento: </Text>{filtroDepartamento}</Text>
                </View>
              )}
              {filtroMunicipio && filtroMunicipio !== 'todos' && (
                <View style={s.filtroTag}>
                  <Text><Text style={s.filtroLabel}>Municipio: </Text>{filtroMunicipio}</Text>
                </View>
              )}
              {filtroEstado && filtroEstado !== 'todos' && (
                <View style={s.filtroTag}>
                  <Text><Text style={s.filtroLabel}>Estado: </Text>{LABEL_ESTADO[filtroEstado] ?? filtroEstado}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* KPIs */}
        <View style={s.seccion}>
          <Text style={s.seccionLabel}>Indicadores clave</Text>
          <View style={s.kpiRow}>
            <View style={s.kpiBox}>
              <Text style={s.kpiValor}>{totalGlobal}</Text>
              <Text style={s.kpiNombre}>Total reportes</Text>
            </View>
            <View style={s.kpiBox}>
              <Text style={s.kpiValor}>{municipiosAfectados}</Text>
              <Text style={s.kpiNombre}>Municipios afectados</Text>
            </View>
            <View style={s.kpiBox}>
              <Text style={s.kpiValor}>
                {totalPersonasGlobal > 0 ? totalPersonasGlobal.toLocaleString('es-CO') : '—'}
              </Text>
              <Text style={s.kpiNombre}>Personas afectadas</Text>
            </View>
            <View style={s.kpiBox}>
              <Text style={s.kpiValorRojo}>{depMasCritico || '—'}</Text>
              <Text style={s.kpiNombre}>Departamento más crítico</Text>
            </View>
          </View>
        </View>

        {/* Distribución por tipo */}
        {distribucion.length > 0 && (
          <View style={s.seccion}>
            <Text style={s.seccionLabel}>Distribución por tipo de reporte</Text>
            <View style={s.distGrid}>
              {distribucion.map(([tipo, conteo]) => (
                <View key={tipo} style={s.distItem}>
                  <View style={s.distBullet} />
                  <Text style={s.distNombre}>{ETIQUETAS_TIPO[tipo] ?? tipo}</Text>
                  <Text style={s.distConteo}>{conteo}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tabla top 10 */}
        {top10.length > 0 && (
          <View style={s.seccion}>
            <Text style={s.seccionLabel}>Top {top10.length} municipios con más reportes</Text>
            <View style={s.tablaHeader}>
              <Text style={[s.tablaHeaderTxt, s.colNum]}>#</Text>
              <Text style={[s.tablaHeaderTxt, s.colMunicipio]}>Municipio</Text>
              <Text style={[s.tablaHeaderTxt, s.colDpto]}>Departamento</Text>
              <Text style={[s.tablaHeaderTxt, s.colReportes]}>Reportes</Text>
              <Text style={[s.tablaHeaderTxt, s.colPersonas]}>Personas</Text>
            </View>
            {top10.map((fila, i) => (
              <View key={fila.municipio} style={i % 2 === 0 ? s.tablaFila : s.tablaFilaAlt}>
                <Text style={[fila.tieneCritico ? s.filaTxtRojo : s.filaTxtBold, s.colNum]}>{i + 1}</Text>
                <Text style={[s.filaTxt, s.colMunicipio]}>{fila.municipio}</Text>
                <Text style={[s.filaTxt, s.colDpto]}>{fila.departamento}</Text>
                <Text style={[s.filaTxtBold, s.colReportes]}>{fila.total}</Text>
                <Text style={[s.filaTxt, s.colPersonas]}>
                  {fila.totalPersonas > 0 ? fila.totalPersonas.toLocaleString('es-CO') : '—'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerMarca}>KomaRed</Text>
          <Text style={s.footerTxt}>Plataforma de Monitoreo PAE — Reporte confidencial</Text>
          <Text style={s.footerTxt} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

      </Page>
    </Document>
  )
}
