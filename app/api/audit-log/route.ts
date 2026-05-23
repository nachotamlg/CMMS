import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    const body = await request.json()
    const { accion, modulo, descripcion, datos } = body

    // Create the audit log
    const log = await prisma.log.create({
      data: {
        usuario_id: session.id,
        accion,
        modulo,
        descripcion,
        datos: datos || {},
      },
    })

    return NextResponse.json(
      { success: true, data: log },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Error creating audit log:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error creating audit log',
      },
      { status: 500 }
    )
  }
}
