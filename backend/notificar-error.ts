import { Resend } from 'resend'

const ADMIN_EMAIL = 'sant4cubillos@outlook.com'
const FROM_EMAIL = 'Dossier Errores <alertas@santiagocoder.com>'

export async function notificarError(origen: string, err: unknown) {
  const mensaje = err instanceof Error ? err.message : String(err)
  const stack = err instanceof Error ? (err.stack ?? '') : ''

  console.error(`[${origen}]`, mensaje)

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🚨 Error en Dossier — ${origen}`,
      html: `
        <div style="font-family: monospace; max-width: 700px; margin: 0 auto;">
          <h2 style="color: #b91c1c;">🚨 Error en el sistema</h2>
          <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
            <tr style="background:#f3f4f6;">
              <td style="padding:8px; font-weight:bold; width:120px;">Origen</td>
              <td style="padding:8px;">${origen}</td>
            </tr>
            <tr>
              <td style="padding:8px; font-weight:bold;">Fecha</td>
              <td style="padding:8px;">${new Date().toISOString()}</td>
            </tr>
            <tr style="background:#f3f4f6;">
              <td style="padding:8px; font-weight:bold;">Error</td>
              <td style="padding:8px; color:#b91c1c;">${mensaje}</td>
            </tr>
          </table>
          ${stack ? `<pre style="background:#1f2937; color:#f9fafb; padding:16px; border-radius:6px; font-size:12px; overflow-x:auto; white-space:pre-wrap;">${stack}</pre>` : ''}
          <hr style="border:none; border-top:1px solid #e5e7eb; margin: 24px 0;">
          <p style="font-size:12px; color:#9ca3af;">Dossier — Sistema de monitoreo</p>
        </div>
      `,
    })
  } catch (emailErr) {
    // Nunca dejar que el manejo de errores genere otro error
    console.error('[notificar-error] Falló el envío del email de error:', emailErr)
  }
}
