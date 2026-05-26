export const ETIQUETAS_TIPO: Record<string, string> = {
  comedor_sin_alimentos:       'Sin alimentos',
  comedor_cerrado:             'Cerrado',
  comedor_calidad_deficiente:  'Calidad deficiente',
  comedor_contratista_ausente: 'Contratista ausente',
  pae_no_entregado:            'PAE no entregado',
  pae_calidad_deficiente:      'PAE calidad',
  icbf_sin_entrega:            'ICBF sin entrega',
  desnutricion_cronica:        'Desnutrición crónica',
  deficit_alimentario:         'Déficit alimentario',
  otro:                        'Otro',
}

/** Colores hex para marcadores Leaflet */
export const COLOR_ESTADO_HEX: Record<string, string> = {
  pendiente:   '#f59e0b',
  critico:     '#ef4444',
  en_curso:    '#3b82f6',
  solucionado: '#22c55e',
}

/** Etiquetas legibles de estado */
export const LABEL_ESTADO: Record<string, string> = {
  pendiente:   'Pendiente',
  critico:     'Crítico',
  en_curso:    'En curso',
  solucionado: 'Solucionado',
}

/** Clases Tailwind para chips/badges de estado */
export const COLORES_ESTADO_CSS: Record<string, string> = {
  pendiente:   'bg-yellow-100 text-yellow-700',
  critico:     'bg-red-100 text-red-700',
  en_curso:    'bg-blue-100 text-blue-700',
  solucionado: 'bg-gray-100 text-gray-500',
}

/** Clases Tailwind para chips de tipo en el ranking */
export const CHIPS_TIPO: Record<string, string> = {
  comedor_sin_alimentos:       'bg-red-100 text-red-700',
  comedor_cerrado:             'bg-orange-100 text-orange-700',
  comedor_calidad_deficiente:  'bg-yellow-100 text-yellow-700',
  comedor_contratista_ausente: 'bg-purple-100 text-purple-700',
  pae_no_entregado:            'bg-blue-100 text-blue-700',
  pae_calidad_deficiente:      'bg-cyan-100 text-cyan-700',
  icbf_sin_entrega:            'bg-pink-100 text-pink-700',
  desnutricion_cronica:        'bg-red-100 text-red-800',
  deficit_alimentario:         'bg-amber-100 text-amber-700',
  otro:                        'bg-gray-100 text-gray-600',
}

/** Clases Tailwind para puntos de color por tipo */
export const COLORES_DOT: Record<string, string> = {
  comedor_sin_alimentos:       'bg-red-500',
  comedor_cerrado:             'bg-orange-500',
  comedor_calidad_deficiente:  'bg-yellow-500',
  comedor_contratista_ausente: 'bg-purple-500',
  pae_no_entregado:            'bg-blue-500',
  pae_calidad_deficiente:      'bg-cyan-500',
  icbf_sin_entrega:            'bg-pink-500',
  desnutricion_cronica:        'bg-red-700',
  deficit_alimentario:         'bg-amber-600',
  otro:                        'bg-gray-400',
}

export const DEPARTAMENTOS_PRIORITARIOS = [
  'La Guajira',
  'Chocó',
  'Magdalena',
  'Cesar',
]
