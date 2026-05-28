'use client'

import { useState } from 'react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <a href="#" className="flex items-center gap-2.5">
          <img src="/logo-komared.svg" alt="KomaRed" className="h-8 w-auto" />
          <span className="font-bold text-xl text-[#1B1818]">
            Koma<span className="text-[#587546]">Red</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#proposito" className="text-sm text-gray-600 hover:text-[#1C3828] transition-colors font-medium">
            Propósito
          </a>
          <a href="#como-funciona" className="text-sm text-gray-600 hover:text-[#1C3828] transition-colors font-medium">
            Cómo Funciona
          </a>
          <a href="#mapa" className="text-sm text-gray-600 hover:text-[#1C3828] transition-colors font-medium">
            Mapa Vivo
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://wa.me/573134689377"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#F4B534] text-[#1B1818] font-semibold text-sm rounded-full hover:bg-[#e5a820] transition-colors"
          >
            Participa →
          </a>
        </div>

        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 px-6 py-4 flex flex-col gap-4 bg-white">
          <a href="#proposito" onClick={() => setOpen(false)} className="text-sm text-gray-600 font-medium">Propósito</a>
          <a href="#como-funciona" onClick={() => setOpen(false)} className="text-sm text-gray-600 font-medium">Cómo Funciona</a>
          <a href="#mapa" onClick={() => setOpen(false)} className="text-sm text-gray-600 font-medium">Mapa Vivo</a>
          <a
            href="https://wa.me/573134689377"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="px-5 py-2.5 bg-[#F4B534] text-[#1B1818] font-semibold text-sm rounded-full text-center"
          >
            Participa →
          </a>
        </div>
      )}
    </nav>
  )
}
