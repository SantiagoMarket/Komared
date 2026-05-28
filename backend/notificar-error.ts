import { Resend } from 'resend'
import { emailWrapper, emailHeader, emailColorBar, emailFooterDark } from '@/backend/email-layout'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!
const FROM_EMAIL = 'KomaRed Errores <alertas@komared.com>'

export async function notificarError(origen: string, err: unknown) {
  const mensaje = err instanceof Error ? err.message : String(err)
  const stack = err instanceof Error ? (err.stack ?? '') : ''

  console.error(`[${origen}]`, mensaje)

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const body = `
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
      ${emailFooterDark(['KomaRed — Sistema de monitoreo'])}`

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🚨 Error en KomaRed — ${origen}`,
      html: emailWrapper(emailHeader() + emailColorBar() + body),
    })
  } catch (emailErr) {
    // Nunca dejar que el manejo de errores genere otro error
    console.error('[notificar-error] Falló el envío del email de error:', emailErr)
  }
}
