'use client'

import NavbarApp from '@/app/components/NavbarApp'
import { useDashboard } from '@/hooks/useDashboard'
import { DashboardHeader } from './components/DashboardHeader'
import { ReportesTable } from './components/ReportesTable'

export default function Dashboard() {
  const { reportes, cargando, actualizando, cambiarEstado } = useDashboard()

  return (
    <main className="min-h-screen bg-gray-50">
      <NavbarApp />
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        <DashboardHeader count={reportes.length} cargando={cargando} />
        <ReportesTable
          reportes={reportes}
          cargando={cargando}
          actualizando={actualizando}
          onCambiarEstado={cambiarEstado}
        />
      </div>
    </main>
  )
}
