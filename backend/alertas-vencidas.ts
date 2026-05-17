import { Resend } from 'resend'
import { getSupabaseAdmin } from './supabase-admin'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const ESTADOS_PENDIENTES = ['pendiente', 'en_revision'] as const
const DIAS_LIMITE = 7
const FROM_EMAIL = 'Dossier Alertas <alertas@santiagocoder.com>'

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
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #b91c1c;">⚠️ Alerta sin resolución — ${dias} días</h2>
        <p>Estimado/a <strong>${nombre}</strong>,</p>
        <p>El siguiente reporte ciudadano lleva <strong>${dias} días</strong> sin ser resuelto:</p>
        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr style="background:#f3f4f6;">
            <td style="padding:8px; font-weight:bold;">Municipio</td>
            <td style="padding:8px;">${reporte.municipio}</td>
          </tr>
          <tr>
            <td style="padding:8px; font-weight:bold;">Tipo</td>
            <td style="padding:8px;">${reporte.tipo}</td>
          </tr>
          <tr style="background:#f3f4f6;">
            <td style="padding:8px; font-weight:bold;">Estado actual</td>
            <td style="padding:8px;">${reporte.estado}</td>
          </tr>
          <tr>
            <td style="padding:8px; font-weight:bold;">ID del reporte</td>
            <td style="padding:8px; font-size:12px; color:#6b7280;">${reporte.id}</td>
          </tr>
        </table>
        <p>Por favor tome las acciones necesarias para dar seguimiento a este caso.</p>
        <hr style="border:none; border-top:1px solid #e5e7eb; margin: 24px 0;">
        <p style="font-size:12px; color:#9ca3af;">Dossier — Plataforma de veeduría ciudadana</p>
      </div>
    `,
  })

  if (error) {
    console.error(`[alertas] Error enviando a ${para}:`, error.message)
  } else {
    console.log(`[alertas] Email enviado → ${nombre} <${para}>`)
  }
}
