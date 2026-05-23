'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export type Notification = {
  id: number
  usuario_id: number
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  created_at: Date
  updated_at: Date
  datos?: any
}

export async function getNotificationsForUser(userId?: number): Promise<Notification[]> {
  try {
    console.log('[v0] getNotificationsForUser - userId param:', userId)
    
    // If userId is provided, use it directly
    if (userId) {
      console.log('[v0] getNotificationsForUser - using provided userId:', userId)
      const notifications = await prisma.notificacion.findMany({
        where: { usuario_id: userId },
        orderBy: { created_at: 'desc' },
        take: 50,
      })
      console.log('[v0] getNotificationsForUser - found', notifications.length, 'notifications')
      return notifications as Notification[]
    }
    
    // Fallback: try to get session from cookies
    console.log('[v0] getNotificationsForUser - attempting to get session')
    const session = await getSession()
    console.log('[v0] getNotificationsForUser - session:', !!session, session?.email, session?.id)
    
    if (!session) {
      console.log('[v0] getNotificationsForUser - no session found, returning empty notifications')
      return []
    }
    
    const notifications = await prisma.notificacion.findMany({
      where: { usuario_id: session.id },
      orderBy: { created_at: 'desc' },
      take: 50,
    })
    
    return notifications as Notification[]
  } catch (error: any) {
    console.error('[v0] Error fetching notifications:', error?.message)
    return []
  }
}

export async function markNotificationAsRead(notificationId: number, userId?: number) {
  try {
    console.log('[v0] markNotificationAsRead - notificationId:', notificationId, 'userId:', userId)
    
    // If userId is provided, verify the notification belongs to this user
    if (userId) {
      const notification = await prisma.notificacion.findFirst({
        where: { 
          id: notificationId,
          usuario_id: userId
        }
      })
      
      if (!notification) {
        throw new Error('Notification not found or unauthorized')
      }
    }

    const result = await prisma.notificacion.update({
      where: { id: notificationId },
      data: { leida: true },
    })

    console.log('[v0] markNotificationAsRead - success')
    return result
  } catch (error) {
    console.error('[v0] Error marking notification as read:', error)
    throw error
  }
}

export async function markAllNotificationsAsRead(userId?: number) {
  try {
    console.log('[v0] markAllNotificationsAsRead - userId:', userId)
    
    if (!userId) {
      throw new Error('userId is required')
    }

    const result = await prisma.notificacion.updateMany({
      where: { usuario_id: userId, leida: false },
      data: { leida: true },
    })

    console.log('[v0] markAllNotificationsAsRead - updated', result.count, 'notifications')
    return result
  } catch (error) {
    console.error('[v0] Error marking all notifications as read:', error)
    throw error
  }
}

export async function deleteNotificationAction(notificationId: number) {
  try {
    const session = await getSession()
    if (!session) {
      throw new Error('Not authenticated')
    }

    const result = await prisma.notificacion.delete({
      where: { id: notificationId },
    })

    return result
  } catch (error) {
    console.error('[v0] Error deleting notification:', error)
    throw error
  }
}

export async function getUnreadCount(): Promise<number> {
  try {
    const session = await getSession()
    if (!session) {
      return 0
    }

    const count = await prisma.notificacion.count({
      where: { usuario_id: session.id, leida: false },
    })

    return count
  } catch (error) {
    console.error('[v0] Error getting unread count:', error)
    return 0
  }
}

export async function generateMaintenanceNotifications(): Promise<{ notificaciones_creadas: number }> {
  let totalCreadas = 0

  try {
    console.log('[v0] Starting automatic maintenance notifications generation')

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    console.log('[v0] Today date for comparison:', today)

    // Get all active users (to notify about maintenances)
    console.log('[v0] Fetching all active users...')
    const usuarios = await prisma.usuario.findMany({
      where: {
        activo: true,
      },
    })

    console.log('[v0] Found', usuarios.length, 'active users with admin/gestor role')

    if (usuarios.length === 0) {
      console.log('[v0] No active users found to receive maintenance notifications')
      return { notificaciones_creadas: 0 }
    }

    // 1. Get overdue maintenances
    console.log('[v0] Searching for overdue maintenances...')
    const mantenimientosVencidos = await prisma.mantenimiento.findMany({
      where: {
        activo: true,
        proxima_programada: { lt: today },
      },
      include: {
        equipo: true,
      },
    })

    console.log('[v0] Found', mantenimientosVencidos.length, 'overdue maintenances')

    for (const mant of mantenimientosVencidos) {
      const diasVencido = Math.floor((today.getTime() - mant.proxima_programada.getTime()) / (1000 * 60 * 60 * 24))
      const titulo = `Mantenimiento vencido: ${mant.equipo.nombre}`
      const mensaje = `El mantenimiento ${mant.tipo} del equipo ${mant.equipo.nombre} estaba programado para hace ${diasVencido} días.`

      const creadas = await createMaintenanceNotificationForAllUsers(
        usuarios,
        titulo,
        mensaje,
        'mantenimiento_vencido',
        mant.id
      )
      totalCreadas += creadas
    }

    // 2. Get upcoming maintenances
    const semanaDespues = new Date(today)
    semanaDespues.setDate(semanaDespues.getDate() + 7)
    console.log('[v0] Searching for upcoming maintenances (next 7 days)...')

    const mantenimientosProximos = await prisma.mantenimiento.findMany({
      where: {
        activo: true,
        proxima_programada: {
          gte: today,
          lte: semanaDespues,
        },
      },
      include: {
        equipo: true,
      },
    })

    console.log('[v0] Found', mantenimientosProximos.length, 'upcoming maintenances')

    for (const mant of mantenimientosProximos) {
      const diasFaltantes = Math.floor((mant.proxima_programada.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const titulo = `Mantenimiento próximo: ${mant.equipo.nombre}`
      const mensaje = `El mantenimiento ${mant.tipo} del equipo ${mant.equipo.nombre} está programado para ${diasFaltantes} día(s).`

      const creadas = await createMaintenanceNotificationForAllUsers(
        usuarios,
        titulo,
        mensaje,
        'mantenimiento_proximo',
        mant.id
      )
      totalCreadas += creadas
    }

    // 3. Get unassigned maintenance orders
    console.log('[v0] Searching for maintenance orders without assigned technician...')
    const ordenesMantenimientoSinAsignar = await prisma.ordenTrabajo.findMany({
      where: {
        tipo: { in: ['mantenimiento', 'preventivo', 'correctivo'] },
        asignado_a: null,
        estado: { not: 'completado' },
      },
      include: {
        equipo: true,
      },
    })

    console.log('[v0] Found', ordenesMantenimientoSinAsignar.length, 'maintenance orders without technician')

    for (const orden of ordenesMantenimientoSinAsignar) {
      const titulo = `Orden de mantenimiento sin asignar: ${orden.equipo.nombre}`
      const mensaje = `La orden #${orden.numero_orden} no tiene técnico asignado.`

      const creadas = await createMaintenanceNotificationForAllUsers(
        usuarios,
        titulo,
        mensaje,
        'mantenimiento_sin_asignar',
        orden.id
      )
      totalCreadas += creadas
    }

    console.log('[v0] Automatic maintenance notifications generation completed. Total created:', totalCreadas)
    return { notificaciones_creadas: totalCreadas }
  } catch (error: any) {
    console.error('[v0] Error generating maintenance notifications:', error?.message)
    if (error?.stack) {
      console.error('[v0] Stack:', error.stack)
    }
    return { notificaciones_creadas: 0 }
  }
}

async function createMaintenanceNotificationForAllUsers(
  usuarios: any[],
  titulo: string,
  mensaje: string,
  tipo: string,
  referencia_id: number
): Promise<number> {
  try {
    console.log('[v0] Creating notifications for', usuarios.length, 'users, tipo:', tipo)
    let creadas = 0
    const horaAtras = new Date(Date.now() - 24 * 60 * 60 * 1000)

    for (const usuario of usuarios) {
      try {
        console.log('[v0] Processing user:', usuario.id, usuario.email)
        
        // Check if notification already exists
        const notificacionExistente = await prisma.notificacion.findFirst({
          where: {
            usuario_id: usuario.id,
            tipo: tipo,
            titulo: titulo,
            created_at: { gte: horaAtras },
          },
        })

        console.log('[v0] Existing notification found:', !!notificacionExistente)

        if (!notificacionExistente) {
          try {
            console.log('[v0] Attempting to create notification for user', usuario.id)
            
            const created = await prisma.notificacion.create({
              data: {
                usuario_id: usuario.id,
                tipo: tipo,
                titulo: titulo,
                mensaje: mensaje,
                datos: {
                  referencia_id: referencia_id,
                  generada_automaticamente: true,
                },
              },
            })

            console.log('[v0] Notification created successfully:', created.id)
            creadas++
          } catch (createError: any) {
            console.error('[v0] Error creating notification:', createError?.message)
          }
        }
      } catch (userError: any) {
        console.error('[v0] Error processing user:', usuario.id, userError?.message)
      }
    }

    console.log('[v0] Total notifications created for this batch:', creadas)
    return creadas
  } catch (error: any) {
    console.error('[v0] Error in createMaintenanceNotificationForAllUsers:', error?.message)
    return 0
  }
}
