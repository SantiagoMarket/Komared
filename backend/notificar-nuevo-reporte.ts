import { Resend } from 'resend'
import { getSupabaseBot } from '@/backend/supabase-bot'
import { notificarError } from '@/backend/notificar-error'

const FROM_EMAIL = 'KomaRed Reportes <alertas@komared.com>'

const ETIQUETAS: Record<string, string> = {
  comedor_sin_alimentos: 'Comedor sin alimentos',
  comedor_cerrado: 'Comedor cerrado',
  comedor_calidad_deficiente: 'Comedor — calidad deficiente',
  comedor_contratista_ausente: 'Contratista ausente',
  pae_no_entregado: 'PAE no entregado',
  pae_calidad_deficiente: 'PAE — calidad deficiente',
  icbf_sin_entrega: 'ICBF sin entrega',
  desnutricion_cronica: 'Desnutrición crónica',
  deficit_alimentario: 'Déficit alimentario',
  otro: 'Otro',
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

export async function notificarNuevoReporte(reporte: DatosReporte): Promise<void> {
  const { data: contactos } = await getSupabaseBot()
    .from('contactos_alerta')
    .select('email, nombre, municipio_id')
    .eq('activo', true)

  if (!contactos || contactos.length === 0) return

  const destinatarios = contactos.filter(
    (c) => c.municipio_id === null || c.municipio_id === reporte.municipio
  )

  if (destinatarios.length === 0) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const tipoLabel = ETIQUETAS[reporte.tipo] ?? reporte.tipo
  const lugar = [reporte.nombre_lugar, reporte.municipio, reporte.departamento]
    .filter(Boolean)
    .join(', ')

  await Promise.all(
    destinatarios.map(async (c) => {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: c.email,
        subject: `🆕 Nuevo reporte — ${tipoLabel} en ${reporte.municipio ?? reporte.nombre_lugar}`,
        html: `
          <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb;">

            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C3828;">
              <tr>
                <td style="padding: 20px 28px;">
                  <span style="color: #ffffff; font-size: 20px; font-weight: bold;">Koma<span style="color: #F4B534;">Red</span></span>
                  <span style="color: #9ca3af; font-size: 10px; letter-spacing: 2px; margin-left: 12px;">SISTEMA DE MONITOREO</span>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background: #587546; height: 4px; width: 50%;"></td>
                <td style="background: #F4B534; height: 4px; width: 50%;"></td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding: 28px;">
                  <p style="margin: 0 0 6px; color: #111827; font-size: 15px;">Estimado/a <strong>${c.nombre}</strong>,</p>
                  <p style="margin: 0 0 22px; color: #6b7280; font-size: 13px;">Se acaba de registrar un nuevo reporte ciudadano a través de KomaBot.</p>

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
                        <a href="https://komared.com/mapa" style="display: inline-block; background: #1C3828; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: bold;">Ver en el mapa →</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="background: #1C3828;">
              <tr>
                <td style="padding: 14px 28px; text-align: center;">
                  <p style="margin: 0; color: #9ca3af; font-size: 11px;">KomaRed — Este es un correo automático, por favor no respondas a este mensaje.</p>
                </td>
              </tr>
            </table>

          </div>
        `,
      })

      if (error) {
        notificarError(`notificarNuevoReporte → ${c.email}`, new Error(error.message)).catch(() => {})
      }
    })
  )
}
