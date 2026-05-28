'use client'

import { useState, useRef, useEffect } from 'react'

type MensajeUI = {
  role: 'user' | 'bot'
  text: string
  sistema?: boolean
}

type GeminiPart = { text: string }
type GeminiContent = { role: 'user' | 'model'; parts: GeminiPart[] }

const SALUDO = 'Hola 👋 Soy KomaBot. Estoy aquí para ayudarte a reportar problemas con el PAE o los comedores comunitarios de forma anónima y segura. ¿Qué está pasando en tu comunidad?'

export default function KomaBotChat() {
  const [mensajes, setMensajes] = useState<MensajeUI[]>([{ role: 'bot', text: SALUDO }])
  const [historial, setHistorial] = useState<GeminiContent[]>([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [terminado, setTerminado] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando])

  async function enviar() {
    const texto = input.trim()
    if (!texto || cargando || terminado) return
    setInput('')

    const nuevoHistorial: GeminiContent[] = [
      ...historial,
      { role: 'user', parts: [{ text: texto }] },
    ]

    setMensajes((prev) => [...prev, { role: 'user', text: texto }])
    setHistorial(nuevoHistorial)
    setCargando(true)

    try {
      const res = await fetch('/api/chat-reporte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nuevoHistorial }),
      })

      const json = await res.json()
      const replyText: string = json.reply ?? '⚠️ No pude procesar tu mensaje. Intenta de nuevo.'

      setMensajes((prev) => [
        ...prev,
        { role: 'bot', text: replyText, sistema: !!json.done },
      ])

      if (json.done) {
        setTerminado(true)
      } else {
        setHistorial((prev) => [
          ...prev,
          { role: 'model', parts: [{ text: replyText }] },
        ])
        setTimeout(() => inputRef.current?.focus(), 50)
      }
    } catch {
      setMensajes((prev) => [
        ...prev,
        { role: 'bot', text: '⚠️ Error de conexión. Por favor intenta de nuevo.' },
      ])
    } finally {
      setCargando(false)
    }
  }

  function reiniciar() {
    setMensajes([{ role: 'bot', text: SALUDO }])
    setHistorial([])
    setInput('')
    setTerminado(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

      {/* Header */}
      <div className="bg-[#1C3828] px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#F4B534] flex items-center justify-center shrink-0">
          <img src="/logo-komared.svg" alt="" className="h-4 w-auto brightness-0" />
        </div>
        <div>
          <p className="text-white text-sm font-bold">KomaBot</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <p className="text-green-400 text-[10px]">Canal seguro y anónimo</p>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="px-4 py-5 flex flex-col gap-3 bg-[#f0f0f0] h-80 overflow-y-auto">
        {mensajes.map((msg, i) => {
          if (msg.sistema) {
            return (
              <div
                key={i}
                className="bg-[#1C3828] text-white text-xs rounded-xl px-4 py-3 leading-relaxed mx-2 whitespace-pre-line"
              >
                {msg.text}
              </div>
            )
          }
          return (
            <div
              key={i}
              className={`max-w-[82%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#DCF8C6] text-gray-800 self-end rounded-br-none'
                  : 'bg-white text-gray-800 self-start rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          )
        })}

        {cargando && (
          <div className="bg-white text-gray-400 text-xs self-start px-3.5 py-2.5 rounded-xl rounded-bl-none shadow-sm">
            <span className="animate-pulse">KomaBot está escribiendo...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        {terminado ? (
          <button
            onClick={reiniciar}
            className="w-full py-2.5 bg-[#1C3828] text-white text-xs font-semibold rounded-xl hover:bg-[#152d1e] transition-colors"
          >
            Enviar otro reporte
          </button>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); enviar() }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={cargando}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#587546] disabled:opacity-50 bg-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || cargando}
              className="px-4 py-2.5 bg-[#F4B534] text-[#1B1818] font-bold text-xs rounded-xl hover:bg-[#e5a820] disabled:opacity-40 transition-colors"
            >
              →
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
