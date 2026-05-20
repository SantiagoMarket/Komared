import { getSupabaseAdmin } from '@/backend/supabase-admin'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import PilaresSection from './components/PilaresSection'
import ComoFuncionaSection from './components/ComoFuncionaSection'
import MapaSection from './components/MapaSection'
import UneteSection from './components/UneteSection'
import Footer from './components/Footer'

async function fetchStats() {
  try {
    const supabase = getSupabaseAdmin()

    const [
      { count: totalAlertas },
      { data: municipiosData },
      { count: aprobados },
    ] = await Promise.all([
      supabase.from('reportes').select('*', { count: 'exact', head: true }),
      supabase.from('reportes').select('municipio'),
      supabase.from('reportes').select('*', { count: 'exact', head: true }).eq('estado', 'aprobado'),
    ])

    const municipiosActivos = new Set((municipiosData ?? []).map((r) => r.municipio)).size
    const tasaResolucion = totalAlertas
      ? Math.round(((aprobados ?? 0) / totalAlertas) * 100)
      : 0

    return {
      totalAlertas: totalAlertas ?? 0,
      municipiosActivos,
      tasaResolucion,
    }
  } catch {
    return { totalAlertas: 0, municipiosActivos: 0, tasaResolucion: 0 }
  }
}

export default async function Home() {
  const stats = await fetchStats()

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <PilaresSection />
        <ComoFuncionaSection />
        <MapaSection stats={stats} />
        {/*
          ALIADOS — sección pendiente
          Agregar <Aliados /> aquí cuando haya logos confirmados
        */}
        <UneteSection />
      </main>
      <Footer />
    </>
  )
}
