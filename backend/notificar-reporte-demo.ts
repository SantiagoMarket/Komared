import { Resend } from 'resend'
import { getSupabaseBot } from '@/backend/supabase-bot'
import { notificarError } from '@/backend/notificar-error'
import { emailWrapper, emailHeader, emailColorBar, emailFooterDark } from '@/backend/email-layout'

const FROM_EMAIL = 'KomaRed Demo <alertas@komared.com>'

const ETIQUETAS: Record<string, string> = {
  comedor_sin_alimentos:       'Comedor sin alimentos',
  comedor_cerrado:             'Comedor cerrado',
  comedor_calidad_deficiente:  'Comedor — calidad deficiente',
  comedor_contratista_ausente: 'Contratista ausente',
  pae_no_entregado:            'PAE no entregado',
  pae_calidad_deficiente:      'PAE — calidad deficiente',
  icbf_sin_entrega:            'ICBF sin entrega',
  desnutricion_cronica:        'Desnutrición crónica',
  deficit_alimentario:         'Déficit alimentario',
  otro:                        'Otro',
}

interface DatosReporte {
  tipo: string
  nombre_lugar: string
  municipio: string | null
  departamento: string | null
  personas_afectadas: number | null
  tiempo_situacion_dias: number | null
  canal: string
}

export async function notificarReporteDemo(reporte: DatosReporte): Promise<void> {
  const { data: validadores } = await getSupabaseBot()
    .from('validadores_temporales')
    .select('nombre, correo')

  if (!validadores || validadores.length === 0) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const tipoLabel = ETIQUETAS[reporte.tipo] ?? reporte.tipo
  const lugar = [reporte.nombre_lugar, reporte.municipio, reporte.departamento]
    .filter(Boolean)
    .join(', ')

  await Promise.all(
    validadores.map(async (v) => {
      const body = `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 28px;">
              <p style="margin: 0 0 6px; color: #111827; font-size: 15px;">Hola <strong>${v.nombre}</strong>,</p>
              <p style="margin: 0 0 22px; color: #6b7280; font-size: 13px;">Acaba de llegar un nuevo reporte al sistema de monitoreo. Puedes verlo en vivo en el mapa.</p>

              <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 14px 18px; margin-bottom: 22px; border-radius: 4px;">
                <span style="font-size: 17px;">🆕</span>
                <strong style="color: #1E40AF; font-size: 15px; margin-left: 8px;">Nuevo reporte recibido</strong>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; margin-bottom: 22px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151; width: 140px; background: #f9fafb;">Tipo</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #374151;">${tipoLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151; background: #f9fafb;">Lugar</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #374151;">${lugar}</td>
                </tr>
                ${reporte.personas_afectadas ? `
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151; background: #f9fafb;">Personas afectadas</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #374151;">${reporte.personas_afectadas}</td>
                </tr>` : ''}
                ${reporte.tiempo_situacion_dias ? `
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151; background: #f9fafb;">Tiempo reportado</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #374151;">${reporte.tiempo_situacion_dias} días</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 12px 16px; font-weight: bold; color: #374151; background: #f9fafb;">Canal</td>
                  <td style="padding: 12px 16px; color: #374151; text-transform: capitalize;">${reporte.canal}</td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://komared.com/demo/mapa" style="display: inline-block; background: #1C3828; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: bold;">Ver en el mapa →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        ${emailFooterDark(['KomaRed Demo — Este es un correo automático del entorno de demostración.'])}`

      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: v.correo,
        subject: `🆕 Nuevo reporte demo — ${tipoLabel} en ${reporte.municipio ?? reporte.nombre_lugar}`,
        html: emailWrapper(emailHeader() + emailColorBar() + body),
      })

      if (error) {
        notificarError(`notificarReporteDemo → ${v.correo}`, new Error(error.message)).catch(() => {})
      }
    })
  )
}
