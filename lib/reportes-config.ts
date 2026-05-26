export const TIPOS_VALIDOS = [
  'comedor_sin_alimentos',
  'comedor_cerrado',
  'comedor_calidad_deficiente',
  'comedor_contratista_ausente',
  'pae_no_entregado',
  'pae_calidad_deficiente',
  'icbf_sin_entrega',
  'desnutricion_cronica',
  'deficit_alimentario',
  'otro',
] as const

export type TipoReporte = (typeof TIPOS_VALIDOS)[number]

export const TIPOS_CRITICOS = new Set<string>(['desnutricion_cronica'])

export type EstadoActivo = 'pendiente' | 'en_curso' | 'critico'

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

/** Etiquetas legibles de estado */
export const LABEL_ESTADO: Record<string, string> = {
  pendiente:   'Pendiente',
  critico:     'Crítico',
  en_curso:    'En curso',
  solucionado: 'Solucionado',
}

/** Transiciones de estado disponibles para cada estado activo */
export const ACCIONES_ESTADO: Record<EstadoActivo, { label: string; estado: string; cls: string }[]> = {
  pendiente: [
    { label: 'En curso',    estado: 'en_curso',    cls: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { label: 'Crítico',     estado: 'critico',     cls: 'bg-red-100 text-red-700 hover:bg-red-200' },
    { label: 'Solucionado', estado: 'solucionado', cls: 'bg-green-100 text-green-700 hover:bg-green-200' },
  ],
  critico: [
    { label: 'En curso',    estado: 'en_curso',    cls: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { label: 'Solucionado', estado: 'solucionado', cls: 'bg-green-100 text-green-700 hover:bg-green-200' },
  ],
  en_curso: [
    { label: 'Crítico',     estado: 'critico',     cls: 'bg-red-100 text-red-700 hover:bg-red-200' },
    { label: 'Solucionado', estado: 'solucionado', cls: 'bg-green-100 text-green-700 hover:bg-green-200' },
  ],
}

export const DEPARTAMENTOS_PRIORITARIOS = [
  'La Guajira',
  'Chocó',
  'Magdalena',
  'Cesar',
]
