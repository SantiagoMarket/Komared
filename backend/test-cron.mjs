// Script de prueba para la lógica del cron de alertas vencidas.
// Ejecutar: node test-cron.mjs
// Requiere NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY y CRON_SECRET en .env.local

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// Leer .env.local manualmente
const env = Object.fromEntries(
  readFileSync('../.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map(p => p.trim()))
    .map(([k, ...v]) => [k, v.join('=')])
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const ESTADOS_PENDIENTES = ['pendiente', 'en_revision']

console.log('=== Test cron alertas-vencidas ===\n')

// 1. Simular un reporte de prueba con updated_at hace 8 días para poder testear
const fechaVencida = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()

console.log('▶ Insertando reporte de prueba con updated_at = hace 8 días...')
const { data: reportePrueba, error: errInsert } = await supabase
  .from('reportes')
  .insert({
    tipo: 'comedor_sin_alimentos',
    telefono_reporte: '+570000000000',
    municipio: 'Riohacha',
    estado: 'pendiente',
    canal: 'web',
    descripcion: '[TEST] Reporte para probar cron de alertas vencidas',
    updated_at: fechaVencida,
  })
  .select('id, estado, municipio, updated_at')
  .single()

if (errInsert) {
  console.error('✗ Error insertando reporte de prueba:', errInsert.message)
  process.exit(1)
}
console.log(`✓ Reporte creado: ${reportePrueba.id} | municipio: ${reportePrueba.municipio}\n`)

// 2. Consultar reportes vencidos (misma query del cron)
console.log('▶ Consultando reportes vencidos...')
const { data: reportesVencidos, error: errVencidos } = await supabase
  .from('reportes')
  .select('id, tipo, municipio, estado, created_at')
  .in('estado', ESTADOS_PENDIENTES)
  .is('notificado_7d_at', null)
  .lt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

if (errVencidos) {
  console.error('✗ Error consultando reportes:', errVencidos.message)
} else {
  console.log(`✓ Reportes vencidos encontrados: ${reportesVencidos.length}`)
  reportesVencidos.forEach(r => console.log(`  - ${r.id} | ${r.municipio} | ${r.estado}`))
}

// 3. Re-verificar estado (simula la verificación antes de notificar)
console.log('\n▶ Re-verificando estado del reporte de prueba...')
const { data: verificado } = await supabase
  .from('reportes')
  .select('estado, notificado_7d_at')
  .eq('id', reportePrueba.id)
  .single()

const sigueVencido = ESTADOS_PENDIENTES.includes(verificado.estado) && verificado.notificado_7d_at === null
console.log(`✓ Estado actual: ${verificado.estado} | notificado_7d_at: ${verificado.notificado_7d_at}`)
console.log(`✓ Procede notificar: ${sigueVencido}`)

// 4. Consultar contactos que recibirían la notificación para ese municipio
console.log('\n▶ Consultando contactos para Riohacha...')
const { data: contactos } = await supabase
  .from('contactos_alerta')
  .select('email, nombre, municipio_id')
  .eq('activo', true)

const destinatarios = (contactos ?? []).filter(
  c => c.municipio_id === null || c.municipio_id === reportePrueba.municipio
)
console.log(`✓ Destinatarios que recibirían el email: ${destinatarios.length}`)
destinatarios.forEach(c => console.log(`  - ${c.nombre} <${c.email}> | municipio_id: ${c.municipio_id ?? 'GLOBAL'}`))

// 5. Marcar como notificado
console.log('\n▶ Marcando reporte como notificado...')
const { error: errUpdate } = await supabase
  .from('reportes')
  .update({ notificado_7d_at: new Date().toISOString() })
  .eq('id', reportePrueba.id)

if (errUpdate) {
  console.error('✗ Error actualizando notificado_7d_at:', errUpdate.message)
} else {
  console.log('✓ notificado_7d_at actualizado correctamente')
}

// 6. Confirmar que el cron ya no lo volvería a procesar
const { data: postUpdate } = await supabase
  .from('reportes')
  .select('notificado_7d_at')
  .eq('id', reportePrueba.id)
  .single()

const renotificaría = postUpdate.notificado_7d_at === null
console.log(`✓ El cron lo volvería a procesar: ${renotificaría} (debe ser false)`)

// Limpieza — borrar el reporte de prueba
await supabase.from('reportes').delete().eq('id', reportePrueba.id)
console.log('\n✓ Reporte de prueba eliminado')
console.log('\n=== Test completado ===')
