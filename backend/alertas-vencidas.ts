import { Resend } from 'resend'
import { getSupabaseAdmin } from './supabase-admin'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const ESTADOS_PENDIENTES = ['pendiente', 'en_curso', 'critico'] as const
const DIAS_LIMITE = 7
const FROM_EMAIL = 'KomaRed Alertas <alertas@komared.com>'

interface Reporte {
  id: string
  tipo: string
  municipio: string
  estado: string
  created_at: string
}

export async function procesarAlertasVencidas(): Promise<{ enviados: number; total: number }> {
  const supabase = getSupabaseAdmin()
  const fechaLimite = new Date(Date.now() - DIAS_LIMITE * 24 * 60 * 60 * 1000).toISOString()

  const { data: reportesVencidos, error: errorReportes } = await supabase
    .from('reportes')
    .select('id, tipo, municipio, estado, created_at')
    .in('estado', ESTADOS_PENDIENTES)
    .is('notificado_7d_at', null)
    .lt('updated_at', fechaLimite)

  if (errorReportes) throw new Error(`Error consultando reportes: ${errorReportes.message}`)
  if (!reportesVencidos || reportesVencidos.length === 0) return { enviados: 0, total: 0 }

  const { data: contactos, error: errorContactos } = await supabase
    .from('contactos_alerta')
    .select('email, nombre, municipio_id')
    .eq('activo', true)

  if (errorContactos) throw new Error(`Error consultando contactos: ${errorContactos.message}`)

  let enviados = 0

  for (const reporte of reportesVencidos) {
    // Re-verificar estado actual antes de notificar
    const { data: actual } = await supabase
      .from('reportes')
      .select('estado, notificado_7d_at')
      .eq('id', reporte.id)
      .single()

    if (!actual) continue
    if (!ESTADOS_PENDIENTES.includes(actual.estado as typeof ESTADOS_PENDIENTES[number])) continue
    if (actual.notificado_7d_at !== null) continue

    const destinatarios = (contactos ?? []).filter(
      (c) => c.municipio_id === null || c.municipio_id === reporte.municipio
    )

    if (destinatarios.length === 0) continue

    await Promise.all(destinatarios.map((c) => enviarEmail(c.email, c.nombre, reporte)))

    await supabase
      .from('reportes')
      .update({ notificado_7d_at: new Date().toISOString() })
      .eq('id', reporte.id)

    enviados++
  }

  return { enviados, total: reportesVencidos.length }
}

async function enviarEmail(para: string, nombre: string, reporte: Reporte) {
  const dias = Math.floor(
    (Date.now() - new Date(reporte.created_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: para,
    subject: `⚠️ Alerta sin resolución: ${reporte.municipio} — ${dias} días`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb;">

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C3828;">
          <tr>
            <td style="padding: 20px 28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right: 12px; vertical-align: middle;">
                    <div style="width: 36px; height: 46px; position: relative; display: inline-block;">
                      <div style="width: 36px; height: 36px; background: #1C3828; border-radius: 50%; border: 3px solid #F4B534; display: inline-block;"></div>
                    </div>
                  </td>
                  <td style="vertical-align: middle;">
                    <div style="color: #ffffff; font-size: 22px; font-weight: bold; line-height: 1;">Koma<span style="color: #F4B534;">Red</span></div>
                    <div style="color: #9ca3af; font-size: 9px; letter-spacing: 2px; margin-top: 3px;">VIGILANCIA CIUDADANA EN TORNO A LA ALIMENTACIÓN</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background: #587546; height: 5px; width: 50%;"></td>
            <td style="background: #F4B534; height: 5px; width: 50%;"></td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 28px;">

              <table cellpadding="0" cellspacing="0" style="margin-bottom: 22px;">
                <tr>
                  <td style="padding-right: 14px; vertical-align: middle;">
                    <div style="width: 48px; height: 48px; background: #e5e7eb; border-radius: 50%; text-align: center; line-height: 48px; font-size: 22px;">👤</div>
                  </td>
                  <td style="vertical-align: middle;">
                    <p style="margin: 0; color: #111827; font-size: 15px;">Estimado/a <strong>${nombre}</strong>,</p>
                    <p style="margin: 5px 0 0; color: #6b7280; font-size: 13px;">El siguiente reporte ciudadano lleva <strong>${dias} días</strong> sin ser resuelto:</p>
                  </td>
                </tr>
              </table>

              <div style="background: #FEF3C7; border-left: 4px solid #F4B534; padding: 14px 18px; margin-bottom: 22px; border-radius: 4px;">
                <span style="font-size: 17px;">⚠️</span>
                <strong style="color: #92400E; font-size: 15px; margin-left: 8px;">Alerta sin resolución — ${dias} días</strong>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; margin-bottom: 22px;">
                <tr>
                  <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb;">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="width: 32px; height: 32px; background: #1C3828; border-radius: 50%; text-align: center; vertical-align: middle; color: white; font-size: 14px; line-height: 32px;">📍</td>
                      <td style="padding-left: 10px; font-weight: bold; color: #111827; font-size: 14px;">Municipio</td>
                    </tr></table>
                  </td>
                  <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">${reporte.municipio}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb;">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="width: 32px; height: 32px; background: #1C3828; border-radius: 50%; text-align: center; vertical-align: middle; color: white; font-size: 14px; line-height: 32px;">🍽️</td>
                      <td style="padding-left: 10px; font-weight: bold; color: #111827; font-size: 14px;">Tipo</td>
                    </tr></table>
                  </td>
                  <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px; background: #f9fafb;">${reporte.tipo}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb;">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="width: 32px; height: 32px; background: #1C3828; border-radius: 50%; text-align: center; vertical-align: middle; color: white; font-size: 14px; line-height: 32px;">🕐</td>
                      <td style="padding-left: 10px; font-weight: bold; color: #111827; font-size: 14px;">Estado actual</td>
                    </tr></table>
                  </td>
                  <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">${reporte.estado}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 14px 16px;">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="width: 32px; height: 32px; background: #1C3828; border-radius: 50%; text-align: center; vertical-align: middle; color: white; font-size: 13px; font-weight: bold; line-height: 32px;">#</td>
                      <td style="padding-left: 10px; font-weight: bold; color: #111827; font-size: 14px;">ID del reporte</td>
                    </tr></table>
                  </td>
                  <td style="padding: 14px 16px; color: #6b7280; font-size: 12px; background: #f9fafb;">${reporte.id}</td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px;">
                <tr>
                  <td style="padding: 16px;">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="padding-right: 14px; vertical-align: top; font-size: 20px;">📋</td>
                      <td style="color: #374151; font-size: 14px;">Por favor tome las acciones necesarias para dar seguimiento a este caso.</td>
                    </tr></table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="background: #F5F3EE; border-top: 1px solid #e5e7eb;">
          <tr>
            <td style="padding: 22px 28px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 16px; font-weight: bold; color: #1C3828;">KomaRed</p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">Plataforma de veeduría ciudadana para una alimentación digna, justa y transparente.</p>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="background: #1C3828;">
          <tr>
            <td style="padding: 14px 28px; text-align: center;">
              <p style="margin: 0 0 4px; color: #9ca3af; font-size: 11px;">alertas@komared.com</p>
              <p style="margin: 0; color: #6b7280; font-size: 11px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
            </td>
          </tr>
        </table>

      </div>
    `,
  })

  if (error) {
    console.error(`[alertas] Error enviando a ${para}:`, error.message)
  } else {
    console.log(`[alertas] Email enviado → ${nombre} <${para}>`)
  }
}
