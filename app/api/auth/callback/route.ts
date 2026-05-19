import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  if (code) {
    const supabase = await createSupabaseServer()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL('/login/nueva-contrasena', req.url))
    }
  }

  return NextResponse.redirect(new URL('/login/recuperar?error=expired', req.url))
}
