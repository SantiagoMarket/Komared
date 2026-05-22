import { readFileSync } from 'fs'
import { Resend } from 'resend'

const env = Object.fromEntries(
  readFileSync('../.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map(p => p.trim()))
    .map(([k, ...v]) => [k, v.join('=')])
)

const resend = new Resend(env.RESEND_API_KEY)

const reportePrueba = {
  id: 'abc123-test',
  tipo: 'comedor_sin_alimentos',
  municipio: 'Riohacha',
  estado: 'pendiente',
  created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
}

const diasSinResolucion = 8
const nombreDestinatario = 'Santiago (prueba)'

console.log('Enviando email de prueba a sant4cubillos@gmail.com...')

const { data, error } = await resend.emails.send({
  from: 'KomaRed Alertas <alertas@komared.com>',
  to: 'Jenifergomezcorreos@gmail.com',
  subject: `⚠️ Alerta sin resolución: ${reportePrueba.municipio} — ${diasSinResolucion} días`,
  html: `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb;">

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C3828;">
        <tr>
          <td style="padding: 20px 28px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
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
                  <p style="margin: 0; color: #111827; font-size: 15px;">Estimado/a <strong>${nombreDestinatario}</strong>,</p>
                  <p style="margin: 5px 0 0; color: #6b7280; font-size: 13px;">El siguiente reporte ciudadano lleva <strong>${diasSinResolucion} días</strong> sin ser resuelto:</p>
                </td>
              </tr>
            </table>

            <div style="background: #FEF3C7; border-left: 4px solid #F4B534; padding: 14px 18px; margin-bottom: 22px; border-radius: 4px;">
              <span style="font-size: 17px;">⚠️</span>
              <strong style="color: #92400E; font-size: 15px; margin-left: 8px;">Alerta sin resolución — ${diasSinResolucion} días</strong>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; margin-bottom: 22px;">
              <tr>
                <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb;">
                  <table cellpadding="0" cellspacing="0"><tr>
                    <td style="width: 32px; height: 32px; background: #1C3828; border-radius: 50%; text-align: center; vertical-align: middle; color: white; font-size: 14px; line-height: 32px;">📍</td>
                    <td style="padding-left: 10px; font-weight: bold; color: #111827; font-size: 14px;">Municipio</td>
                  </tr></table>
                </td>
                <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">${reportePrueba.municipio}</td>
              </tr>
              <tr style="background: #f9fafb;">
                <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb;">
                  <table cellpadding="0" cellspacing="0"><tr>
                    <td style="width: 32px; height: 32px; background: #1C3828; border-radius: 50%; text-align: center; vertical-align: middle; color: white; font-size: 14px; line-height: 32px;">🍽️</td>
                    <td style="padding-left: 10px; font-weight: bold; color: #111827; font-size: 14px;">Tipo</td>
                  </tr></table>
                </td>
                <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px; background: #f9fafb;">${reportePrueba.tipo}</td>
              </tr>
              <tr>
                <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb;">
                  <table cellpadding="0" cellspacing="0"><tr>
                    <td style="width: 32px; height: 32px; background: #1C3828; border-radius: 50%; text-align: center; vertical-align: middle; color: white; font-size: 14px; line-height: 32px;">🕐</td>
                    <td style="padding-left: 10px; font-weight: bold; color: #111827; font-size: 14px;">Estado actual</td>
                  </tr></table>
                </td>
                <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">${reportePrueba.estado}</td>
              </tr>
              <tr style="background: #f9fafb;">
                <td style="padding: 14px 16px;">
                  <table cellpadding="0" cellspacing="0"><tr>
                    <td style="width: 32px; height: 32px; background: #1C3828; border-radius: 50%; text-align: center; vertical-align: middle; color: white; font-size: 13px; font-weight: bold; line-height: 32px;">#</td>
                    <td style="padding-left: 10px; font-weight: bold; color: #111827; font-size: 14px;">ID del reporte</td>
                  </tr></table>
                </td>
                <td style="padding: 14px 16px; color: #6b7280; font-size: 12px; background: #f9fafb;">${reportePrueba.id}</td>
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
  console.error('✗ Error:', error.message)
} else {
  console.log('✓ Email enviado. ID:', data.id)
}
