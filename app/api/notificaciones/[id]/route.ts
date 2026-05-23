import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// DELETE - Eliminar una notificación
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const notificacion = await prisma.notificacion.findUnique({
      where: { id: parseInt(id) },
    })

    if (!notificacion) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      )
    }

    if (notificacion.usuario_id !== session.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    await prisma.notificacion.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[v0] Error deleting notificacion:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar notificación' },
      { status: error.message === 'No autorizado' ? 401 : 500 }
    )
  }
}
