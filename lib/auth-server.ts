import { createSupabaseServer } from '@/lib/supabase-server'

export async function verificarSesion() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
