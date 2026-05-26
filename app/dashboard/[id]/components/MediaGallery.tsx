import type { MediaArchivo } from '@/types/reportes'

type Props = {
  archivos: MediaArchivo[]
}

export function MediaGallery({ archivos }: Props) {
  if (archivos.length === 0) return null

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <p className="text-gray-500 text-xs uppercase tracking-wide px-5 pt-4 pb-3">
        Evidencia multimedia
        {archivos.length > 1 && <span className="ml-2 text-gray-600">({archivos.length})</span>}
      </p>
      <div className={archivos.length > 1 ? 'grid grid-cols-2 gap-px bg-gray-800' : ''}>
        {archivos.map((archivo, i) => {
          const esImg = archivo.mime_type?.startsWith('image/')
          const esVid = archivo.mime_type?.startsWith('video/')
          return (
            <div key={i} className="bg-black">
              {esImg && (
                <img
                  src={archivo.signed_url}
                  alt={`Evidencia ${i + 1}`}
                  className="w-full object-contain max-h-[480px]"
                />
              )}
              {esVid && (
                <video src={archivo.signed_url} controls className="w-full max-h-[480px]" />
              )}
              {!esImg && !esVid && (
                <div className="px-5 py-4">
                  <a
                    href={archivo.signed_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-sm underline"
                  >
                    Abrir archivo {archivos.length > 1 ? i + 1 : ''}
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
