import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad · KomaRed',
  description: 'Política de privacidad y tratamiento de datos personales de KomaRed.',
}

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-[#1B1818] text-gray-300">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8"
          >
            ← Volver al inicio
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <img src="/logo-komared.svg" alt="KomaRed" className="h-8 w-auto" />
            <span className="font-bold text-xl text-white">
              Koma<span className="text-[#F4B534]">Red</span>
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">Política de Privacidad</h1>
          <p className="text-sm text-gray-500">Última actualización: mayo de 2026</p>
        </div>

        {/* Contenido */}
        <div className="flex flex-col gap-10 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-white mb-3">1. Responsable del tratamiento</h2>
            <p>
              KomaRed es una plataforma de veeduría ciudadana para el monitoreo de comedores comunitarios
              y el Programa de Alimentación Escolar (PAE) en Colombia. La plataforma es operada de forma
              independiente con fines de interés público y transparencia alimentaria.
            </p>
            <p className="mt-2">
              Para cualquier consulta relacionada con el tratamiento de datos puedes escribirnos a{' '}
              <a href="mailto:sant4cubillos@outlook.com" className="text-[#F4B534] hover:underline">
                sant4cubillos@outlook.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">2. Datos que recopilamos</h2>
            <p className="mb-3">Recopilamos únicamente los datos necesarios para el funcionamiento de la plataforma:</p>
            <ul className="list-disc list-inside flex flex-col gap-2 text-gray-400">
              <li>
                <span className="text-gray-300">Reportes ciudadanos:</span> tipo de problema, nombre del lugar,
                municipio, descripción y evidencia (foto o audio) proporcionados voluntariamente por el usuario.
              </li>
              <li>
                <span className="text-gray-300">Datos de contacto del bot:</span> identificador de Telegram
                (ID numérico), nombre de usuario y nombre de pila, necesarios para gestionar la conversación.
              </li>
              <li>
                <span className="text-gray-300">Datos de validadores:</span> correo electrónico y contraseña
                (cifrada) de las personas que acceden al panel de administración.
              </li>
            </ul>
            <p className="mt-3">
              No recopilamos datos de geolocalización del dispositivo del usuario. Las coordenadas almacenadas
              corresponden al municipio seleccionado, no a la ubicación física del reportante.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">3. Finalidad del tratamiento</h2>
            <ul className="list-disc list-inside flex flex-col gap-2 text-gray-400">
              <li>Registrar y publicar reportes ciudadanos sobre irregularidades en comedores y el PAE.</li>
              <li>Mostrar la información en un mapa público de acceso libre para fines de transparencia.</li>
              <li>Gestionar alertas y seguimiento por parte de validadores autorizados.</li>
              <li>Enviar notificaciones operativas relacionadas con los reportes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">4. Base legal</h2>
            <p>
              El tratamiento se basa en el consentimiento del usuario, otorgado de forma libre al momento
              de enviar un reporte a través del bot de Telegram o del formulario de la plataforma. Los
              reportes son de carácter público e implican que el usuario acepta que la información
              (excluyendo el ID de Telegram) pueda ser visible en el mapa.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">5. Datos publicados vs. datos privados</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse mt-2">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 font-semibold py-2 pr-4">Dato</th>
                    <th className="text-left text-gray-400 font-semibold py-2">Visibilidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ['Tipo de problema', 'Público (mapa)'],
                    ['Nombre del lugar', 'Público (mapa)'],
                    ['Municipio / Departamento', 'Público (mapa)'],
                    ['Descripción / evidencia', 'Público (mapa)'],
                    ['Nombre de pila del reportante', 'Solo validadores'],
                    ['Nombre de usuario de Telegram', 'Solo validadores'],
                    ['ID numérico de Telegram', 'Privado (servidor)'],
                    ['Correo del validador', 'Privado (servidor)'],
                  ].map(([dato, vis]) => (
                    <tr key={dato}>
                      <td className="py-2 pr-4 text-gray-300">{dato}</td>
                      <td className={`py-2 ${vis.startsWith('Público') ? 'text-[#F4B534]' : vis.startsWith('Solo') ? 'text-gray-400' : 'text-gray-500'}`}>{vis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">6. Transferencias y terceros</h2>
            <p className="mb-2">Utilizamos los siguientes servicios de terceros para operar la plataforma:</p>
            <ul className="list-disc list-inside flex flex-col gap-2 text-gray-400">
              <li><span className="text-gray-300">Supabase</span> — base de datos y autenticación (servidores en la Unión Europea).</li>
              <li><span className="text-gray-300">Telegram</span> — canal de recepción de reportes.</li>
              <li><span className="text-gray-300">Google Gemini</span> — procesamiento de lenguaje natural para el bot (los mensajes se envían a la API de Google).</li>
              <li><span className="text-gray-300">Resend</span> — envío de notificaciones por correo electrónico.</li>
              <li><span className="text-gray-300">Vercel</span> — alojamiento de la plataforma.</li>
            </ul>
            <p className="mt-3">No vendemos ni cedemos datos a terceros con fines comerciales.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">7. Conservación de los datos</h2>
            <p>
              Los reportes se conservan de forma indefinida con fines de transparencia e histórico ciudadano.
              Las sesiones del bot se eliminan automáticamente tras 2 horas de inactividad o al completarse
              el reporte. Los datos de validadores se conservan mientras la cuenta esté activa.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">8. Derechos del usuario</h2>
            <p className="mb-2">
              De acuerdo con la Ley 1581 de 2012 (Colombia) y sus decretos reglamentarios, tienes derecho a:
            </p>
            <ul className="list-disc list-inside flex flex-col gap-2 text-gray-400">
              <li>Conocer, actualizar y rectificar tus datos personales.</li>
              <li>Solicitar la supresión de tus datos cuando no exista una obligación legal de conservarlos.</li>
              <li>Revocar la autorización otorgada para el tratamiento.</li>
              <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).</li>
            </ul>
            <p className="mt-3">
              Para ejercer cualquiera de estos derechos escríbenos a{' '}
              <a href="mailto:sant4cubillos@outlook.com" className="text-[#F4B534] hover:underline">
                sant4cubillos@outlook.com
              </a>{' '}
              indicando tu solicitud y el dato al que hace referencia.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">9. Seguridad</h2>
            <p>
              Aplicamos medidas técnicas y organizativas razonables para proteger los datos: autenticación
              con Row Level Security (RLS) en Supabase, comunicación cifrada (HTTPS/TLS), secretos de
              webhook para validar el origen de los mensajes de Telegram, y acceso restringido al panel
              de administración mediante credenciales verificadas.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">10. Cambios a esta política</h2>
            <p>
              Podemos actualizar esta política cuando sea necesario. La fecha de última actualización
              aparece al inicio del documento. El uso continuado de la plataforma tras un cambio
              implica la aceptación de la nueva versión.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
            ← Volver al inicio
          </Link>
          <p className="text-xs text-gray-700">© {new Date().getFullYear()} KomaRed</p>
        </div>

      </div>
    </div>
  )
}
