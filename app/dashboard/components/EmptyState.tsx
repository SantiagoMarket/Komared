export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-2">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-gray-400 text-sm font-medium">No hay reportes activos</p>
    </div>
  )
}
