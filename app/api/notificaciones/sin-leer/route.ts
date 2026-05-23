import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET - Contar notificaciones sin leer
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    const count = await prisma.notificacion.count({
      where: {
        usuario_id: session.id,
        leida: false,
      },
    })

    return NextResponse.json({
      success: true,
      count,
    })
  } catch (error: any) {
    console.error('[v0] Error counting unread:', error)
    return NextResponse.json(
      { error: error.message || 'Error al contar notificaciones' },
      { status: error.message === 'No autorizado' ? 401 : 500 }
    )
  }
}
