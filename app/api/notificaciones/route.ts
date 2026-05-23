import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET - Obtener notificaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const leida = searchParams.get('leida')
    const limit = searchParams.get('limit')
    
    const where: any = {
      usuario_id: session.id,
    }
    
    if (leida !== null) {
      where.leida = leida === 'true'
    }
    
    const notificaciones = await prisma.notificacion.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit ? parseInt(limit) : undefined,
    })
    
    return NextResponse.json(notificaciones)
  } catch (error: any) {
    console.error('[v0] Error fetching notificaciones:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener notificaciones' },
      { status: error.message === 'No autorizado' ? 401 : 500 }
    )
  }
}

// POST - Crear una nueva notificación (uso interno)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { usuario_id, tipo, titulo, mensaje, datos } = body

    console.log('[v0] POST /api/notificaciones - Creating notification:', {
      usuario_id,
      tipo,
      titulo,
      mensaje,
      datos_type: typeof datos,
    })

    if (!usuario_id || !titulo || !mensaje) {
      console.error('[v0] Missing required fields:', { usuario_id, titulo, mensaje })
      return NextResponse.json(
        { error: 'Campos requeridos faltantes' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id: usuario_id },
    })

    if (!usuarioExiste) {
      console.error('[v0] Usuario no encontrado:', usuario_id)
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const notificacion = await prisma.notificacion.create({
      data: {
        usuario_id,
        tipo: tipo || 'info',
        titulo,
        mensaje,
        datos: datos ? JSON.parse(JSON.stringify(datos)) : null,
        leida: false,
      },
    })

    console.log('[v0] Notification created successfully:', {
      id: notificacion.id,
      usuario_id: notificacion.usuario_id,
      tipo: notificacion.tipo,
      created_at: notificacion.created_at,
    })

    return NextResponse.json(notificacion, { status: 201 })
  } catch (error: any) {
    console.error('[v0] Error creating notificacion:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    })
    return NextResponse.json(
      { error: error.message || 'Error al crear notificación' },
      { status: 500 }
    )
  }
}
