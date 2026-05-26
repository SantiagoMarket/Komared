export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-[#587546] border-t-transparent animate-spin" />
        <p className="text-gray-400 text-sm">Cargando reportes...</p>
      </div>
    </div>
  )
}
