import { NextRequest, NextResponse } from 'next/server'
import { procesarAlertasVencidas } from '@/backend/alertas-vencidas'
import { notificarError } from '@/backend/notificar-error'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const resultado = await procesarAlertasVencidas()
    return NextResponse.json(resultado)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    await notificarError('cron/alertas-vencidas', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
