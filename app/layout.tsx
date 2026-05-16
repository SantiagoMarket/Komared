import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dossier · Monitor PAE y Comedores',
  description: 'Veeduría ciudadana contra el hambre en Colombia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  )
}
