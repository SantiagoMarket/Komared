import { Resend } from 'resend'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'sant4cubillos@outlook.com'
const FROM_EMAIL = 'KomaRed Errores <alertas@santiagocoder.com>'

export async function notificarError(origen: string, err: unknown) {
  const mensaje = err instanceof Error ? err.message : String(err)
  const stack = err instanceof Error ? (err.stack ?? '') : ''

  console.error(`[${origen}]`, mensaje)

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🚨 Error en KomaRed — ${origen}`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb;">

          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C3828;">
            <tr>
              <td style="padding: 20px 28px;">
                <span style="color: #ffffff; font-size: 20px; font-weight: bold; font-family: Arial, sans-serif;">Koma<span style="color: #F4B534;">Red</span></span>
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
                <h2 style="color: #b91c1c; margin: 0 0 20px; font-size: 18px;">🚨 Error en el sistema</h2>

                <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;">
                  <tr style="background: #f9fafb;">
                    <td style="padding: 10px 14px; font-weight: bold; width: 110px; color: #374151; border-bottom: 1px solid #e5e7eb;">Origen</td>
                    <td style="padding: 10px 14px; color: #374151; border-bottom: 1px solid #e5e7eb;">${origen}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; font-weight: bold; color: #374151; border-bottom: 1px solid #e5e7eb;">Fecha</td>
                    <td style="padding: 10px 14px; color: #374151; border-bottom: 1px solid #e5e7eb;">${new Date().toISOString()}</td>
                  </tr>
                  <tr style="background: #fef2f2;">
                    <td style="padding: 10px 14px; font-weight: bold; color: #374151;">Error</td>
                    <td style="padding: 10px 14px; color: #b91c1c;">${mensaje}</td>
                  </tr>
                </table>

                ${stack ? `<pre style="background: #1f2937; color: #f9fafb; padding: 16px; border-radius: 6px; font-size: 12px; overflow-x: auto; white-space: pre-wrap; margin-top: 16px;">${stack}</pre>` : ''}
              </td>
            </tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="background: #1C3828;">
            <tr>
              <td style="padding: 14px 28px; text-align: center;">
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">KomaRed — Sistema de monitoreo</p>
              </td>
            </tr>
          </table>

        </div>
      `,
    })
  } catch (emailErr) {
    // Nunca dejar que el manejo de errores genere otro error
    console.error('[notificar-error] Falló el envío del email de error:', emailErr)
  }
}
