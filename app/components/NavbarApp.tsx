'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const NAV_ADMIN = [
  { label: 'Dashboard',  href: '/dashboard' },
  { label: 'Reportes',   href: '/historico' },
  { label: 'Municipios', href: '/municipios' },
]

export default function NavbarApp() {
  const [esAdmin, setEsAdmin]         = useState<boolean | null>(null)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [pathname, setPathname]       = useState('')

  useEffect(() => {
    setPathname(window.location.pathname)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setEsAdmin(null); return }
      setEsAdmin(session.user.app_metadata?.role !== 'cliente')
    })
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <a
          href={esAdmin === null ? '/historico' : esAdmin === false ? '/historico' : '/dashboard'}
          className="flex items-center gap-2.5 shrink-0"
        >
          <img src="/logo_komared.png" alt="KomaRed" className="h-7 w-auto" />
          <span className="font-bold text-lg text-[#1B1818]">
            Koma<span className="text-[#587546]">Red</span>
          </span>
        </a>

        {/* Nav links — solo admin, oculto mientras carga */}
        {esAdmin && (
          <nav className="flex items-center">
            {NAV_ADMIN.map(({ label, href }) => {
              const activo = pathname === href
              return (
                <a
                  key={href}
                  href={href}
                  className={`px-5 py-4 text-sm transition-colors border-b-2 ${
                    activo
                      ? 'text-[#1C3828] font-semibold border-[#587546]'
                      : 'text-gray-500 hover:text-[#1C3828] border-transparent font-medium'
                  }`}
                >
                  {label}
                </a>
              )
            })}
          </nav>
        )}

        {/* User menu — solo visible cuando hay sesión */}
        {esAdmin !== null && <div className="relative shrink-0">
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Menú de usuario"
          >
            <div className="w-8 h-8 rounded-full bg-[#1C3828] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {menuAbierto && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(false)} />
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 overflow-hidden">
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </form>
              </div>
            </>
          )}
        </div>}

      </div>
    </header>
  )
}
