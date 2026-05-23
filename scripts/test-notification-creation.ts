import { prisma } from '@/lib/prisma'

/**
 * Script de prueba para verificar que se pueden crear notificaciones correctamente
 * Ejecutar: npx ts-node scripts/test-notification-creation.ts
 */

async function testNotificationCreation() {
  console.log('[TEST] Starting notification creation test...')
  
  try {
    // 1. Obtener un usuario para hacer la prueba
    const usuario = await prisma.usuario.findFirst({
      where: { activo: true },
    })
    
    if (!usuario) {
      console.error('[TEST] No active users found. Please create a user first.')
      return
    }
    
    console.log(`[TEST] Using user: ${usuario.nombre} (ID: ${usuario.id})`)
    
    // 2. Crear una notificación de prueba directamente
    console.log('[TEST] Creating test notification...')
    const testNotif = await prisma.notificacion.create({
      data: {
        usuario_id: usuario.id,
        tipo: 'test',
        titulo: 'Test Notification',
        mensaje: 'This is a test notification',
        datos: {
          test: true,
          timestamp: new Date().toISOString(),
        },
      },
    })
    
    console.log('[TEST] Notification created successfully:')
    console.log(`  - ID: ${testNotif.id}`)
    console.log(`  - Usuario ID: ${testNotif.usuario_id}`)
    console.log(`  - Tipo: ${testNotif.tipo}`)
    console.log(`  - Titulo: ${testNotif.titulo}`)
    console.log(`  - Mensaje: ${testNotif.mensaje}`)
    console.log(`  - Leida: ${testNotif.leida}`)
    console.log(`  - Datos: ${JSON.stringify(testNotif.datos)}`)
    console.log(`  - Created at: ${testNotif.created_at}`)
    
    // 3. Leer la notificación de vuelta para verificar
    console.log('[TEST] Reading notification from database...')
    const retrieved = await prisma.notificacion.findUnique({
      where: { id: testNotif.id },
    })
    
    if (!retrieved) {
      console.error('[TEST] FAILED: Notification not found after creation!')
      return
    }
    
    console.log('[TEST] SUCCESS: Notification retrieved from database')
    console.log(`  - Title: ${retrieved.titulo}`)
    console.log(`  - Message: ${retrieved.mensaje}`)
    
    // 4. Crear múltiples notificaciones para testing
    console.log('[TEST] Creating batch of test notifications...')
    const batchResults = await Promise.all([
      prisma.notificacion.create({
        data: {
          usuario_id: usuario.id,
          tipo: 'orden_asignada',
          titulo: 'Test - Orden Asignada',
          mensaje: 'Testing batch creation - order assignment',
        },
      }),
      prisma.notificacion.create({
        data: {
          usuario_id: usuario.id,
          tipo: 'mantenimiento_vencido',
          titulo: 'Test - Mantenimiento Vencido',
          mensaje: 'Testing batch creation - maintenance overdue',
        },
      }),
      prisma.notificacion.create({
        data: {
          usuario_id: usuario.id,
          tipo: 'orden_actualizada',
          titulo: 'Test - Orden Actualizada',
          mensaje: 'Testing batch creation - order updated',
        },
      }),
    ])
    
    console.log(`[TEST] Created ${batchResults.length} test notifications`)
    
    // 5. Verificar que todas aparecen en el listado
    console.log('[TEST] Verifying all notifications are retrievable...')
    const allNotifications = await prisma.notificacion.findMany({
      where: { usuario_id: usuario.id },
      orderBy: { created_at: 'desc' },
      take: 10,
    })
    
    console.log(`[TEST] Total notifications for user: ${allNotifications.length}`)
    for (const notif of allNotifications) {
      console.log(`  - ${notif.tipo}: ${notif.titulo}`)
    }
    
    console.log('[TEST] All tests completed successfully!')
  } catch (error) {
    console.error('[TEST] Error during testing:', error)
    if (error instanceof Error) {
      console.error('[TEST] Error details:', error.message)
      console.error('[TEST] Stack:', error.stack)
    }
  } finally {
    await prisma.$disconnect()
  }
}

testNotificationCreation()
