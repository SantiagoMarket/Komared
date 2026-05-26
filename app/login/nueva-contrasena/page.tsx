'use client'

import { useEffect, useRef, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { AuthShell } from '@/app/login/components/AuthShell'

type Estado = 'esperando' | 'listo' | 'guardado' | 'error_token'

export default function NuevaContrasena() {
  const [estado, setEstado] = useState<Estado>('esperando')
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const supabaseRef = useRef(createSupabaseBrowser())
  const supabase = supabaseRef.current

  useEffect(() => {
    // El callback del servidor ya intercambió el código y guardó la sesión en cookies.
    // Solo verificamos que haya una sesión activa.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setEstado('listo')
      } else {
        setEstado('error_token')
      }
    })
  }, [])

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (!/[A-Z]/.test(password)) {
      setError('La contraseña debe incluir al menos una letra mayúscula.')
      return
    }
    if (!/[0-9]/.test(password)) {
      setError('La contraseña debe incluir al menos un número.')
      return
    }

    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setCargando(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('No se pudo actualizar la contraseña. ' + error.message)
      setCargando(false)
      return
    }

    await supabase.auth.signOut()
    setEstado('guardado')
    setTimeout(() => { window.location.href = '/login' }, 2500)
  }

  return (
    <AuthShell subtitulo="Nueva contraseña">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          {estado === 'esperando' && (
            <p className="text-gray-400 text-sm text-center py-4">Verificando sesión...</p>
          )}

          {estado === 'error_token' && (
            <div className="text-center space-y-3">
              <p className="text-red-400 text-sm font-medium">Enlace inválido o expirado</p>
              <p className="text-gray-400 text-xs">
                Este enlace ya fue usado o ha expirado. Solicita uno nuevo.
              </p>
              <a href="/login/recuperar" className="block text-xs text-gray-400 hover:text-white transition-colors mt-2">
                Solicitar nuevo enlace →
              </a>
            </div>
          )}

          {estado === 'listo' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Nueva contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-gray-500"
                />
                <p className="text-gray-600 text-xs mt-1.5">Mínimo 8 caracteres, una mayúscula y un número.</p>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirmacion}
                  onChange={(e) => setConfirmacion(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-gray-500"
                />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-white text-gray-900 font-semibold text-sm rounded-lg py-2.5 hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                {cargando ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </form>
          )}

          {estado === 'guardado' && (
            <div className="text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-green-900 flex items-center justify-center mx-auto">
                <span className="text-green-400 text-lg">✓</span>
              </div>
              <p className="text-white text-sm font-medium">Contraseña actualizada</p>
              <p className="text-gray-400 text-xs">Redirigiendo al inicio de sesión...</p>
            </div>
          )}
        </div>
    </AuthShell>
  )
}
