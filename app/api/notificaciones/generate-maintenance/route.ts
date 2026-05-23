import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { generateMaintenanceNotifications } from '@/app/actions/notificaciones'

/**
 * Endpoint para generar automáticamente notificaciones de mantenimiento
 * Solo accesible para administradores y gestores
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    // Verificar que el usuario está autenticado
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    // Verificar que es admin o gestor
    if (!['admin', 'gestor'].includes(session.rol)) {
      return NextResponse.json(
        { error: 'Permiso denegado' },
        { status: 403 }
      )
    }
    
    console.log('[v0] Starting maintenance notifications generation via API')
    
    // Ejecutar la generación de notificaciones
    await generateMaintenanceNotifications()
    
    return NextResponse.json(
      { success: true, message: 'Notificaciones de mantenimiento generadas correctamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error in maintenance notifications API:', error)
    return NextResponse.json(
      { error: 'Error al generar notificaciones' },
      { status: 500 }
    )
  }
}

/**
 * Endpoint GET para verificar el estado de generación
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    if (!['admin', 'gestor'].includes(session.rol)) {
      return NextResponse.json(
        { error: 'Permiso denegado' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { 
        message: 'Endpoint para generar notificaciones de mantenimiento',
        usage: 'POST /api/notificaciones/generate-maintenance'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { error: 'Error' },
      { status: 500 }
    )
  }
}
