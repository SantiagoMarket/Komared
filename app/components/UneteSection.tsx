'use client'

import { useState } from 'react'

const beneficios = [
  'Sin costo. Sin app. Solo WhatsApp.',
  'Anonimato garantizado por diseño.',
  'Tus datos son de tu comunidad.',
]

const rolesOpciones = [
  'Selecciona tu rol...',
  'Ciudadano / Líder comunitario',
  'Periodista / Investigador',
  'Funcionario público',
  'ONG / Organización social',
  'Empresa / RSE',
  'Otro',
]

export default function UneteSection() {
  const [enviado, setEnviado] = useState(false)
  const [form, setForm] = useState({ nombre: '', whatsapp: '', municipio: '', rol: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setEnviado(true)
  }

  return (
    <section id="unete" className="bg-[#1C3828] px-6 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* Izquierda */}
        <div className="flex flex-col gap-7">
          <p className="text-[#F4B534] text-xs font-bold tracking-widest uppercase">
            — Únete a la red
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            La información es el primer paso para{' '}
            <em className="italic text-[#F4B534]">cambiar la realidad</em>
          </h2>
          <p className="text-[#9ca3af] text-lg leading-relaxed">
            Vigilemos juntos por una alimentación digna. Si eres líder comunal,
            aliado institucional, investigador o simplemente crees que la
            alimentación digna es un derecho, esta red es tuya.
          </p>
          <ul className="flex flex-col gap-3">
            {beneficios.map((b) => (
              <li key={b} className="flex items-center gap-3 text-white text-sm">
                <span className="w-5 h-5 rounded-full bg-[#F4B534] flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-[#1B1818]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl p-8">
          {enviado ? (
            <div className="text-center py-8 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#F5F3EE] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#587546]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1B1818]">¡Bienvenido a la red!</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Gracias por unirte. Pronto recibirás instrucciones en tu WhatsApp.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <h3 className="text-lg font-bold text-[#1B1818] mb-1">Súmate a la vigilancia ciudadana →</h3>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Tu nombre"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#1C3828] transition-colors placeholder-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  WhatsApp / Teléfono
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleChange}
                  required
                  placeholder="+57 300 000 0000"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#1C3828] transition-colors placeholder-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Municipio
                </label>
                <input
                  type="text"
                  name="municipio"
                  value={form.municipio}
                  onChange={handleChange}
                  required
                  placeholder="Ej. Riohacha, La Guajira"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#1C3828] transition-colors placeholder-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  ¿Cómo quieres participar?
                </label>
                <select
                  name="rol"
                  value={form.rol}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#1C3828] transition-colors bg-white appearance-none"
                >
                  {rolesOpciones.map((r) => (
                    <option key={r} value={r === rolesOpciones[0] ? '' : r} disabled={r === rolesOpciones[0]}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#F4B534] text-[#1B1818] font-bold py-3.5 rounded-full hover:bg-[#e5a820] transition-colors text-sm mt-1"
              >
                Quiero participar →
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
