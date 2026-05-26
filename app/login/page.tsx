'use client'

import { Suspense, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { AuthShell } from './components/AuthShell'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const supabase = createSupabaseBrowser()

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setCargando(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Correo o contraseña incorrectos.')
      setCargando(false)
      return
    }

    // Usar el user que viene directo del signIn — tiene app_metadata garantizado
    const esCliente = data.user?.app_metadata?.role === 'cliente'

    const params = new URLSearchParams(window.location.search)
    const next = params.get('next')
    // Solo permitir rutas relativas internas — bloquea open redirect a dominios externos
    const nextSeguro = next && next.startsWith('/') && !next.startsWith('//') ? next : null

    // Los clientes solo pueden ir a /historico, nunca a /dashboard
    const destino = esCliente
      ? '/historico'
      : (nextSeguro ?? '/dashboard')

    window.location.href = destino
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
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

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-gray-500"
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}

      <button
        type="submit"
        disabled={cargando}
        className="w-full bg-white text-gray-900 font-semibold text-sm rounded-lg py-2.5 hover:bg-gray-100 disabled:opacity-50 transition-colors"
      >
        {cargando ? 'Entrando...' : 'Entrar'}
      </button>

      <a href="/login/recuperar" className="block text-center text-xs text-gray-500 hover:text-gray-300 transition-colors">
        ¿Olvidaste tu contraseña?
      </a>
    </form>
  )
}

export default function Login() {
  return (
    <AuthShell subtitulo="Acceso restringido">
      <Suspense fallback={<div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-48" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
