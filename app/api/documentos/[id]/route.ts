import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'

// GET - Obtener documento por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request)
    
    const { id } = await params
    const documentoId = parseInt(id)
    
    if (isNaN(documentoId)) {
      return NextResponse.json(
        { error: 'ID de documento inválido' },
        { status: 400 }
      )
    }
    
    const documento = await prisma.documento.findUnique({
      where: { id: documentoId },
      include: {
        subidoPor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        equipo: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
      },
    })
    
    if (!documento) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(documento)
  } catch (error: any) {
    console.error('[v0] Error fetching documento:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener documento' },
      { status: error.message === 'No autorizado' ? 401 : 500 }
    )
  }
}

// DELETE - Eliminar documento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request)
    
    const { id } = await params
    const documentoId = parseInt(id)
    
    if (isNaN(documentoId)) {
      return NextResponse.json(
        { error: 'ID de documento inválido' },
        { status: 400 }
      )
    }
    
    const documento = await prisma.documento.findUnique({
      where: { id: documentoId },
    })
    
    if (!documento) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      )
    }
    
    // Try to delete file from disk
    const filePath = documento.ruta_archivo || documento.url_archivo
    if (filePath && !filePath.startsWith('http') && existsSync(filePath)) {
      try {
        await unlink(filePath)
      } catch (fileError) {
        console.error('[v0] Error deleting file from disk:', fileError)
        // Continue with database deletion even if file deletion fails
      }
    }
    
    // Delete from database
    await prisma.documento.delete({
      where: { id: documentoId },
    })
    
    // Create audit log
    await prisma.log.create({
      data: {
        usuario_id: session.id,
        accion: 'ELIMINAR',
        modulo: 'DOCUMENTOS',
        descripcion: `Documento eliminado: ${documento.nombre}`,
        datos: { documento_id: documentoId, nombre: documento.nombre },
      },
    }).catch(err => console.error('[v0] Error creating audit log:', err))
    
    return NextResponse.json({ success: true, message: 'Documento eliminado correctamente' })
  } catch (error: any) {
    console.error('[v0] Error deleting documento:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar documento' },
      { status: error.message === 'No autorizado' ? 401 : 500 }
    )
  }
}
