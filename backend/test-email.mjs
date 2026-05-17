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

console.log('Enviando email de prueba a sant4cubillos@gmail.com...')

const { data, error } = await resend.emails.send({
  from: 'Dossier Alertas <alertas@santiagocoder.com>',
  to: 'Jenifergomezcorreos@gmail.com',
  subject: `⚠️ Alerta sin resolución: ${reportePrueba.municipio} — ${diasSinResolucion} días`,
  html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #b91c1c;">⚠️ Alerta sin resolución — ${diasSinResolucion} días</h2>
      <p>Estimado/a <strong>Santiago (prueba)</strong>,</p>
      <p>El siguiente reporte ciudadano lleva <strong>${diasSinResolucion} días</strong> sin ser resuelto:</p>
      <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
        <tr style="background:#f3f4f6;">
          <td style="padding:8px; font-weight:bold;">Municipio</td>
          <td style="padding:8px;">${reportePrueba.municipio}</td>
        </tr>
        <tr>
          <td style="padding:8px; font-weight:bold;">Tipo</td>
          <td style="padding:8px;">${reportePrueba.tipo}</td>
        </tr>
        <tr style="background:#f3f4f6;">
          <td style="padding:8px; font-weight:bold;">Estado actual</td>
          <td style="padding:8px;">${reportePrueba.estado}</td>
        </tr>
        <tr>
          <td style="padding:8px; font-weight:bold;">ID del reporte</td>
          <td style="padding:8px; font-size:12px; color:#6b7280;">${reportePrueba.id}</td>
        </tr>
      </table>
      <p>Por favor tome las acciones necesarias para dar seguimiento a este caso.</p>
      <hr style="border:none; border-top:1px solid #e5e7eb; margin: 24px 0;">
      <p style="font-size:12px; color:#9ca3af;">Dossier — Plataforma de veeduría ciudadana</p>
    </div>
  `,
})

if (error) {
  console.error('✗ Error:', error.message)
} else {
  console.log('✓ Email enviado. ID:', data.id)
}
