import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateMaintenanceNotifications } from '@/app/actions/notificaciones'

/**
 * DEBUG endpoint para probar la generación de notificaciones
 * GET /api/debug/test-notifications
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG] Testing notification generation...')
    
    // Step 1: Verify database connection
    console.log('[DEBUG] Step 1: Testing database connection...')
    const userCount = await prisma.usuario.count()
    console.log('[DEBUG] Users in DB:', userCount)
    
    // Step 2: Check for active admin/gestor users
    console.log('[DEBUG] Step 2: Checking for active admin/gestor users...')
    const activeAdmins = await prisma.usuario.findMany({
      where: {
        activo: true,
        rol: { in: ['admin', 'gestor'] }
      },
    })
    console.log('[DEBUG] Active admins/gestors:', activeAdmins.length)
    activeAdmins.forEach(u => console.log(`  - ${u.nombre} (${u.email}) - ${u.rol}`))
    
    // Step 3: Check for maintenances
    console.log('[DEBUG] Step 3: Checking for maintenances...')
    const allMaintenances = await prisma.mantenimiento.findMany()
    console.log('[DEBUG] Total maintenances:', allMaintenances.length)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const overdueMaintenances = await prisma.mantenimiento.findMany({
      where: {
        activo: true,
        proxima_programada: { lt: today },
      },
      include: { equipo: true }
    })
    console.log('[DEBUG] Overdue maintenances:', overdueMaintenances.length)
    
    const semanaDespues = new Date(today)
    semanaDespues.setDate(semanaDespues.getDate() + 7)
    
    const upcomingMaintenances = await prisma.mantenimiento.findMany({
      where: {
        activo: true,
        proxima_programada: {
          gte: today,
          lte: semanaDespues,
        },
      },
      include: { equipo: true }
    })
    console.log('[DEBUG] Upcoming maintenances:', upcomingMaintenances.length)
    
    // Step 4: Check for maintenance orders without technician
    console.log('[DEBUG] Step 4: Checking for maintenance orders without technician...')
    const unassignedOrders = await prisma.ordenTrabajo.findMany({
      where: {
        tipo: { in: ['mantenimiento', 'preventivo', 'correctivo'] },
        asignado_a: null,
        estado: { not: 'completado' },
      },
      include: { equipo: true }
    })
    console.log('[DEBUG] Unassigned maintenance orders:', unassignedOrders.length)
    
    // Step 5: Run the generation
    console.log('[DEBUG] Step 5: Running generateMaintenanceNotifications...')
    const result = await generateMaintenanceNotifications()
    console.log('[DEBUG] Generation result:', result)
    
    // Step 6: Check notifications created
    console.log('[DEBUG] Step 6: Verifying notifications were created...')
    const notificationsCount = await prisma.notificacion.count()
    console.log('[DEBUG] Total notifications in DB:', notificationsCount)
    
    const recentNotifications = await prisma.notificacion.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      include: { usuario: true }
    })
    console.log('[DEBUG] Recent notifications:')
    recentNotifications.forEach(n => {
      console.log(`  - ${n.titulo} (${n.usuario.nombre}) - ${n.tipo}`)
    })
    
    return NextResponse.json({
      success: true,
      debug: {
        userCount,
        activeAdminsCount: activeAdmins.length,
        activeAdmins: activeAdmins.map(u => ({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol })),
        totalMaintenances: allMaintenances.length,
        overdueMaintenances: overdueMaintenances.length,
        upcomingMaintenances: upcomingMaintenances.length,
        unassignedOrders: unassignedOrders.length,
        generationResult: result,
        totalNotificationsInDB: notificationsCount,
        recentNotifications: recentNotifications.map(n => ({
          id: n.id,
          titulo: n.titulo,
          tipo: n.tipo,
          usuario: n.usuario.nombre,
          created_at: n.created_at
        }))
      }
    }, { status: 200 })
  } catch (error) {
    console.error('[DEBUG] Error testing notifications:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
