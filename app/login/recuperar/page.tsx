'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function Recuperar() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setCargando(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    })

    if (error) {
      setError(error.message)
      setCargando(false)
      return
    }

    setEnviado(true)
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-3">
            <img src="/logo-komared.svg" alt="KomaRed" className="h-8 w-auto" />
            <span className="text-white font-bold text-xl">Koma<span style={{color:'#F4B534'}}>Red</span></span>
          </div>
          <p className="text-gray-400 text-sm">Recuperar contraseña</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          {enviado ? (
            <div className="text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-green-900 flex items-center justify-center mx-auto">
                <span className="text-green-400 text-lg">✓</span>
              </div>
              <p className="text-white text-sm font-medium">Revisa tu correo</p>
              <p className="text-gray-400 text-xs">
                Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.
              </p>
              <a href="/login" className="block text-xs text-gray-500 hover:text-gray-300 transition-colors mt-4">
                ← Volver al inicio de sesión
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-gray-400 text-xs">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-gray-500 placeholder-gray-600"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-white text-gray-900 font-semibold text-sm rounded-lg py-2.5 hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                {cargando ? 'Enviando...' : 'Enviar enlace'}
              </button>

              <a href="/login" className="block text-center text-xs text-gray-500 hover:text-gray-300 transition-colors">
                ← Volver al inicio de sesión
              </a>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
