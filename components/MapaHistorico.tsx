'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ETIQUETAS_TIPO, LABEL_ESTADO } from '@/lib/reportes-config'
import { COLOR_ESTADO_HEX } from '@/lib/reportes-ui'
import type { ReporteGeo } from '@/types/reportes'

const COLOMBIA_CENTER: L.LatLngTuple = [4.571, -74.297]

export default function MapaHistorico({ reportes }: { reportes: ReporteGeo[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)

  // Inicializar mapa una sola vez
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const mapa = L.map(containerRef.current, { zoomControl: true }).setView(COLOMBIA_CENTER, 5)
    mapRef.current = mapa

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapa)

    layerRef.current = L.layerGroup().addTo(mapa)

    return () => {
      mapa.remove()
      mapRef.current = null
    }
  }, [])

  // Re-renderizar marcadores cuando cambian los reportes
  useEffect(() => {
    const mapa = mapRef.current
    const layer = layerRef.current
    if (!mapa || !layer) return

    layer.clearLayers()

    const conCoordenadas = reportes.filter(
      (r): r is ReporteGeo & { lat: number; lng: number } => r.lat != null && r.lng != null
    )
    if (conCoordenadas.length === 0) return

    conCoordenadas.forEach((r) => {
      const color = COLOR_ESTADO_HEX[r.estado] ?? '#6b7280'
      const marker = L.circleMarker([r.lat, r.lng], {
        radius: 7,
        fillColor: color,
        color: '#fff',
        weight: 1.5,
        fillOpacity: 0.9,
      })
      marker.bindPopup(
        `<div style="min-width:150px">
          <p style="font-weight:600;margin:0 0 3px;font-size:13px">${ETIQUETAS_TIPO[r.tipo] ?? r.tipo}</p>
          <p style="margin:0;font-size:12px;color:#555">${r.nombre_lugar ?? r.municipio ?? '—'}</p>
          <span style="display:inline-block;margin-top:6px;padding:2px 8px;border-radius:99px;font-size:10px;background:${color};color:#fff">
            ${LABEL_ESTADO[r.estado] ?? r.estado}
          </span>
        </div>`
      )
      layer.addLayer(marker)
    })

    // Ajustar vista a los marcadores visibles
    const bounds = L.latLngBounds(conCoordenadas.map((r) => [r.lat, r.lng] as L.LatLngTuple))
    mapa.fitBounds(bounds, { padding: [32, 32], maxZoom: 10 })
  }, [reportes])

  return (
    <div className="flex flex-col h-full">
      {/* Leyenda */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-b border-gray-100">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Mapa</span>
        <div className="flex items-center gap-3 ml-auto">
          {Object.entries(LABEL_ESTADO).map(([estado, label]) => (
            <span key={estado} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR_ESTADO_HEX[estado] }} />
              {label}
            </span>
          ))}
        </div>
      </div>
      <div ref={containerRef} className="flex-1 w-full min-h-0" />
    </div>
  )
}
