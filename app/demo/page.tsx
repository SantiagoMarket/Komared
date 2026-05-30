'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DemoRegistro() {
  const [nombre,   setNombre]   = useState('')
  const [correo,   setCorreo]   = useState('')
  const [enviado,  setEnviado]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setCargando(true)

    const res = await fetch('/api/demo/validadores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo }),
    })

    setCargando(false)
    if (!res.ok) {
      setError('Hubo un error al registrarte. Intenta de nuevo.')
      return
    }
    setEnviado(true)
  }

  return (
    <main className="min-h-screen bg-[#1C3828] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo / Marca */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white font-bold text-xl tracking-tight">KomaRed</span>
          </div>
          <h1 className="text-white text-2xl font-bold">Bienvenido al demo</h1>
          <p className="text-green-200/70 text-sm mt-1">
            Regístrate para vivir la experiencia completa
          </p>
        </div>

        {enviado ? (
          <div className="bg-white rounded-2xl p-8 text-center space-y-4">
            <div className="text-4xl">✓</div>
            <h2 className="text-gray-900 font-semibold text-lg">¡Listo, {nombre}!</h2>
            <p className="text-gray-500 text-sm">
              Ya puedes explorar el sistema. Escanea el código QR para hacer un reporte
              por WhatsApp y verlo aparecer en tiempo real.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/demo/mapa"
                className="block w-full bg-[#1C3828] text-white py-3 rounded-xl font-medium text-center hover:bg-[#2a5040] transition-colors"
              >
                Ver mapa en vivo
              </Link>
              <Link
                href="/demo/historico"
                className="block w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-medium text-center hover:bg-gray-50 transition-colors"
              >
                Ver histórico de reportes
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre completo
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1C3828] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1C3828] focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-[#1C3828] text-white py-3 rounded-xl font-medium hover:bg-[#2a5040] disabled:opacity-60 transition-colors"
            >
              {cargando ? 'Registrando...' : 'Ingresar al demo'}
            </button>

          </form>
        )}
      </div>
    </main>
  )
}
