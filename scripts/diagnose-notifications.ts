import { prisma } from '@/lib/prisma'

/**
 * Script de diagnóstico para verificar que las notificaciones se guardan correctamente
 * Ejecutar: npx ts-node scripts/diagnose-notifications.ts
 */

async function diagnoseNotifications() {
  console.log('[DIAGNOSE] Starting notification diagnosis...')
  
  try {
    // 1. Contar notificaciones totales
    const totalCount = await prisma.notificacion.count()
    console.log('[DIAGNOSE] Total notifications in database:', totalCount)
    
    // 2. Contar notificaciones por tipo
    const byType = await prisma.notificacion.groupBy({
      by: ['tipo'],
      _count: {
        id: true,
      },
    })
    console.log('[DIAGNOSE] Notifications by type:')
    for (const record of byType) {
      console.log(`  - ${record.tipo}: ${record._count.id}`)
    }
    
    // 3. Contar notificaciones por usuario
    const byUser = await prisma.notificacion.groupBy({
      by: ['usuario_id'],
      _count: {
        id: true,
      },
    })
    console.log('[DIAGNOSE] Notifications by user:')
    for (const record of byUser) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: record.usuario_id },
        select: { nombre: true, email: true },
      })
      console.log(`  - User ${record.usuario_id} (${usuario?.email}): ${record._count.id} notifications`)
    }
    
    // 4. Ver últimas 10 notificaciones
    console.log('[DIAGNOSE] Last 10 notifications:')
    const recent = await prisma.notificacion.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      include: {
        usuario: {
          select: { nombre: true, email: true },
        },
      },
    })
    
    for (const notif of recent) {
      console.log(`  - ${notif.created_at.toISOString()} | ${notif.usuario.email} | ${notif.tipo} | ${notif.titulo}`)
      if (notif.datos) {
        console.log(`    Data: ${JSON.stringify(notif.datos)}`)
      }
    }
    
    // 5. Verificar integridad de datos
    const withoutData = await prisma.notificacion.count({
      where: { datos: null },
    })
    console.log('[DIAGNOSE] Notifications without data field:', withoutData)
    
    const unread = await prisma.notificacion.count({
      where: { leida: false },
    })
    console.log('[DIAGNOSE] Unread notifications:', unread)
    
    console.log('[DIAGNOSE] Diagnosis complete!')
  } catch (error) {
    console.error('[DIAGNOSE] Error during diagnosis:', error)
  } finally {
    await prisma.$disconnect()
  }
}

diagnoseNotifications()
