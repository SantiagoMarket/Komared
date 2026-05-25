import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const esCliente = user?.app_metadata?.role === 'cliente'
  const { pathname } = req.nextUrl

  // Usuario no autenticado intentando acceder a ruta protegida
  if (!user) {
    if (pathname.startsWith('/dashboard') || pathname === '/historico') {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    return res
  }

  // Cliente autenticado intentando acceder a rutas de validadores
  if (esCliente && pathname.startsWith('/dashboard')) {
    const url = req.nextUrl.clone()
    url.pathname = '/historico'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Cliente o validador ya autenticado visitando /login → redirigir a su home
  if (pathname === '/login') {
    const url = req.nextUrl.clone()
    url.pathname = esCliente ? '/historico' : '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/historico', '/login'],
}
