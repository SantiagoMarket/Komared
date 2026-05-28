type Props = {
  pagina: number
  totalPaginas: number
  onCambiar: (n: number) => void
}

export function Paginacion({ pagina, totalPaginas, onCambiar }: Props) {
  if (totalPaginas <= 1) return null

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      <span className="text-sm text-gray-500">
        Página {pagina} de {totalPaginas}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onCambiar(pagina - 1)}
          disabled={pagina === 1}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>
        <button
          onClick={() => onCambiar(pagina + 1)}
          disabled={pagina === totalPaginas}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
