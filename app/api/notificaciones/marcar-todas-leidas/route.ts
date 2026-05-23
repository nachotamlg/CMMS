import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// POST - Marcar todas las notificaciones como leídas
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    await prisma.notificacion.updateMany({
      where: {
        usuario_id: session.id,
        leida: false,
      },
      data: {
        leida: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[v0] Error marking all as read:', error)
    return NextResponse.json(
      { error: error.message || 'Error al marcar como leídas' },
      { status: error.message === 'No autorizado' ? 401 : 500 }
    )
  }
}
