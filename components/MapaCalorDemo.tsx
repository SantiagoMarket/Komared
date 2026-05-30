'use client'

import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase, ReporteMapbox } from '@/lib/supabase'
import { ETIQUETAS_TIPO } from '@/lib/reportes-config'

type HeatLatLngTuple = [number, number, number]

const COLOMBIA_CENTER: L.LatLngTuple = [4.571, -74.297]
const ZOOM_INICIAL = 6

export default function MapaCalorDemo() {
  const containerRef    = useRef<HTMLDivElement>(null)
  const mapRef          = useRef<L.Map | null>(null)
  const heatLayerRef    = useRef<unknown>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)

  const renderizarDatos = useCallback((reportes: ReporteMapbox[]) => {
    const mapa = mapRef.current
    if (!mapa) return

    const puntos: HeatLatLngTuple[] = reportes.map((r) => [r.lat, r.lng, r.peso])

    if (heatLayerRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(heatLayerRef.current as any).setLatLngs(puntos)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const heat = (L as any).heatLayer(puntos, {
        radius: 35,
        blur: 25,
        maxZoom: 12,
        gradient: { 0.2: '#ffeb00', 0.4: '#ff8c00', 0.6: '#ff4500', 0.8: '#dc0000', 1.0: '#8b0000' },
      })
      heat.addTo(mapa)
      heatLayerRef.current = heat
    }

    markersLayerRef.current?.clearLayers()
    reportes.forEach((r) => {
      const color = r.estado === 'critico' ? '#dc2626' : '#f59e0b'
      const marker = L.circleMarker([r.lat, r.lng], {
        radius: 7,
        fillColor: color,
        color: '#fff',
        weight: 1.5,
        fillOpacity: 0.9,
      })
      marker.bindPopup(
        `<div style="min-width:160px">
          <p style="font-weight:600;margin:0 0 4px">${ETIQUETAS_TIPO[r.tipo] ?? r.tipo}</p>
          <p style="margin:0;font-size:12px">${r.nombre_lugar ?? r.municipio ?? '—'}</p>
          <p style="margin:0;font-size:11px;color:#888">${r.departamento ?? ''}</p>
          <span style="display:inline-block;margin-top:6px;padding:2px 8px;border-radius:99px;font-size:10px;background:${color};color:#fff">
            ${r.estado}
          </span>
        </div>`
      )
      markersLayerRef.current?.addLayer(marker)
    })
  }, [])

  const actualizarDatos = useCallback(async () => {
    const { data, error } = await supabase.from('mapa_reportes_prueba_publico').select('*')
    if (!error && data) renderizarDatos(data as ReporteMapbox[])
  }, [renderizarDatos])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const mapa = L.map(containerRef.current, { zoomControl: true }).setView(COLOMBIA_CENTER, ZOOM_INICIAL)
    mapRef.current = mapa

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapa)

    markersLayerRef.current = L.layerGroup().addTo(mapa)

    import('leaflet.heat').then(() => actualizarDatos())

    const canal = supabase
      .channel('reportes-prueba-mapa')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reportes_prueba' }, actualizarDatos)
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
      mapa.remove()
      mapRef.current    = null
      heatLayerRef.current = null
    }
  }, [actualizarDatos])

  return <div ref={containerRef} className="w-full h-full" />
}
