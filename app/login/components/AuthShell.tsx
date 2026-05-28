type Props = {
  subtitulo: string
  children: React.ReactNode
}

export function AuthShell({ subtitulo, children }: Props) {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-3">
            <img src="/logo_komared.png" alt="KomaRed" className="h-8 w-auto" />
            <span className="text-white font-bold text-xl">Koma<span style={{ color: '#F4B534' }}>Red</span></span>
          </div>
          <p className="text-gray-400 text-sm">{subtitulo}</p>
        </div>
        {children}
      </div>
    </main>
  )
}
