'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type Reporte = {
  id: string
  tipo: string
  nombre_lugar: string | null
  municipio: string | null
  departamento: string | null
  estado: string
  created_at: string
}

type EstadoActivo = 'pendiente' | 'en_curso' | 'critico'

const ETIQUETAS: Record<string, string> = {
  comedor_sin_alimentos: 'Sin alimentos',
  comedor_cerrado: 'Cerrado',
  comedor_calidad_deficiente: 'Calidad deficiente',
  comedor_contratista_ausente: 'Contratista ausente',
  pae_no_entregado: 'PAE no entregado',
  pae_calidad_deficiente: 'PAE calidad deficiente',
  icbf_sin_entrega: 'ICBF sin entrega',
  desnutricion_cronica: 'Desnutrición crónica',
  deficit_alimentario: 'Déficit alimentario',
  otro: 'Otro',
}

const BADGE: Record<string, string> = {
  pendiente: 'bg-yellow-900/40 text-yellow-400 ring-1 ring-yellow-700',
  critico:   'bg-red-900/40   text-red-400   ring-1 ring-red-700',
  en_curso:  'bg-blue-900/40  text-blue-400  ring-1 ring-blue-700',
}

const LABEL_ESTADO: Record<string, string> = {
  pendiente: 'Pendiente',
  critico:   'Crítico',
  en_curso:  'En curso',
}

// Qué acciones se muestran según el estado actual del reporte
const ACCIONES: Record<EstadoActivo, { label: string; estado: string; cls: string }[]> = {
  pendiente: [
    { label: 'En curso',    estado: 'en_curso',    cls: 'bg-blue-800 hover:bg-blue-700 text-blue-100' },
    { label: 'Crítico',     estado: 'critico',     cls: 'bg-red-800 hover:bg-red-700 text-red-100' },
    { label: 'Solucionado', estado: 'solucionado', cls: 'bg-green-800 hover:bg-green-700 text-green-100' },
  ],
  critico: [
    { label: 'En curso',    estado: 'en_curso',    cls: 'bg-blue-800 hover:bg-blue-700 text-blue-100' },
    { label: 'Solucionado', estado: 'solucionado', cls: 'bg-green-800 hover:bg-green-700 text-green-100' },
  ],
  en_curso: [
    { label: 'Crítico',     estado: 'critico',     cls: 'bg-red-800 hover:bg-red-700 text-red-100' },
    { label: 'Solucionado', estado: 'solucionado', cls: 'bg-green-800 hover:bg-green-700 text-green-100' },
  ],
}

type FormCliente = {
  nombre: string
  empresa: string
  email: string
  password: string
  ciudad: string
  municipio: string
  departamento: string
}

const FORM_VACIO: FormCliente = {
  nombre: '', empresa: '', email: '', password: '',
  ciudad: '', municipio: '', departamento: '',
}

function ModalCliente({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<FormCliente>(FORM_VACIO)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  function campo(k: keyof FormCliente) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    const res = await fetch('/api/admin/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setEnviando(false)
    if (res.status === 409) { setError('Ya existe un usuario con ese correo.'); return }
    if (!res.ok) { setError('Error al crear el cliente. Intenta de nuevo.'); return }
    setExito(true)
  }

  if (exito) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm text-center space-y-4">
          <p className="text-green-400 font-semibold">Cliente creado</p>
          <p className="text-gray-400 text-sm">
            Se creó la cuenta para <span className="text-white">{form.email}</span>.
            Ya puede iniciar sesión en <span className="text-white">/login</span>.
          </p>
          <button onClick={onClose} className="w-full bg-white text-gray-900 font-semibold text-sm rounded-lg py-2.5">
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">Nuevo cliente</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Nombre</span>
              <input value={form.nombre} onChange={campo('nombre')} required
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Empresa / Organización</span>
              <input value={form.empresa} onChange={campo('empresa')} required
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500" />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Correo electrónico</span>
            <input type="email" value={form.email} onChange={campo('email')} required
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400">Contraseña temporal</span>
            <input type="password" value={form.password} onChange={campo('password')} required minLength={8}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500"
              placeholder="Mínimo 8 caracteres" />
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Ciudad</span>
              <input value={form.ciudad} onChange={campo('ciudad')}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Municipio</span>
              <input value={form.municipio} onChange={campo('municipio')}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Departamento</span>
              <input value={form.departamento} onChange={campo('departamento')}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500" />
            </label>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-700 text-gray-300 text-sm rounded-lg py-2.5 hover:bg-gray-800 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={enviando}
              className="flex-1 bg-white text-gray-900 font-semibold text-sm rounded-lg py-2.5 hover:bg-gray-100 disabled:opacity-50 transition-colors">
              {enviando ? 'Creando...' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState<string | null>(null)
  const [modalCliente, setModalCliente] = useState(false)

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  const cargarReportes = useCallback(async () => {
    const res = await fetch('/api/reportes')
    if (!res.ok) return
    const data: Reporte[] = await res.json()
    setReportes(data.filter((r) => r.estado !== 'solucionado'))
    setCargando(false)
  }, [])

  useEffect(() => {
    cargarReportes()

    const canal = supabase
      .channel('dashboard-reportes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reportes' }, cargarReportes)
      .subscribe()

    return () => { supabase.removeChannel(canal) }
  }, [cargarReportes, supabase])

  async function cambiarEstado(id: string, nuevoEstado: string) {
    if (nuevoEstado === 'solucionado') {
      const confirmado = window.confirm('¿Confirmas que este reporte fue resuelto?')
      if (!confirmado) return
    }
    setActualizando(id)
    await fetch(`/api/reportes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    })
    setActualizando(null)
    cargarReportes()
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {modalCliente && <ModalCliente onClose={() => setModalCliente(false)} />}

      <header className="px-6 py-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          <h1 className="font-semibold text-sm tracking-wide uppercase">Dashboard Validadores</h1>
        </div>
        <div className="flex items-center gap-4">
          <a href="/historico" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Ver histórico →
          </a>
          <button
            onClick={() => setModalCliente(true)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            + Cliente
          </button>
          <span className="text-gray-400 text-sm">{reportes.length} reportes activos</span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-xs text-gray-500 hover:text-red-400 transition-colors">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <div className="p-6">
        {cargando ? (
          <p className="text-gray-500 text-center py-20">Cargando reportes...</p>
        ) : reportes.length === 0 ? (
          <p className="text-gray-500 text-center py-20">No hay reportes activos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="pb-3 pr-4">Tipo</th>
                  <th className="pb-3 pr-4">Lugar</th>
                  <th className="pb-3 pr-4">Municipio</th>
                  <th className="pb-3 pr-4">Estado</th>
                  <th className="pb-3 pr-4">Fecha</th>
                  <th className="pb-3 pr-4">Acciones</th>
                  <th className="pb-3">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {reportes.map((r) => {
                  const acciones = ACCIONES[r.estado as EstadoActivo] ?? []
                  const ocupado = actualizando === r.id
                  return (
                    <tr key={r.id} className="hover:bg-gray-900 transition-colors">
                      <td className="py-3 pr-4 text-white">{ETIQUETAS[r.tipo] ?? r.tipo}</td>
                      <td className="py-3 pr-4 text-gray-300">{r.nombre_lugar ?? '—'}</td>
                      <td className="py-3 pr-4 text-gray-300">
                        {[r.municipio, r.departamento].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${BADGE[r.estado] ?? ''}`}>
                          {LABEL_ESTADO[r.estado] ?? r.estado}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-500 text-xs">
                        {new Date(r.created_at).toLocaleDateString('es-CO', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {acciones.map((a) => (
                            <button
                              key={a.estado}
                              onClick={() => cambiarEstado(r.id, a.estado)}
                              disabled={ocupado}
                              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors disabled:opacity-40 ${a.cls}`}
                            >
                              {ocupado ? '…' : a.label}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3">
                        <a
                          href={`/dashboard/${r.id}`}
                          className="text-xs text-gray-500 hover:text-blue-400 transition-colors"
                        >
                          Ver →
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
