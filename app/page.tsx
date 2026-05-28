import { createClient } from '@supabase/supabase-js'

function getSupabasePublic() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import PilaresSection from './components/PilaresSection'
import ComoFuncionaSection from './components/ComoFuncionaSection'
import MapaSection from './components/MapaSection'
import UneteSection from './components/UneteSection'
import Footer from './components/Footer'

async function fetchStats() {
  try {
    const supabase = getSupabasePublic()

    const [
      { count: totalAlertas },
      { data: municipiosData },
      { data: personasData },
    ] = await Promise.all([
      supabase.from('reportes').select('*', { count: 'exact', head: true }),
      supabase.from('reportes').select('municipio'),
      supabase.from('reportes').select('personas_afectadas'),
    ])

    const municipiosActivos = new Set((municipiosData ?? []).map((r: { municipio: string }) => r.municipio)).size
    const personasAfectadas = (personasData ?? []).reduce(
      (acc: number, r: { personas_afectadas: number | null }) => acc + (r.personas_afectadas ?? 0),
      0
    )

    return {
      totalAlertas: totalAlertas ?? 0,
      municipiosActivos,
      personasAfectadas,
    }
  } catch {
    return { totalAlertas: 0, municipiosActivos: 0, personasAfectadas: 0 }
  }
}

export default async function Home() {
  const stats = await fetchStats()

  return (
    <>
      <Navbar />
      <main>
        <HeroSection stats={stats} />
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
