import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

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
    })
    
    if (!documento) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      )
    }
    
    // Priorizar contenido en BD
    if (documento.contenido_archivo && documento.almacenado_en_bd) {
      const headers = new Headers()
      headers.set('Content-Type', documento.tipo_archivo || 'application/octet-stream')
      headers.set('Content-Disposition', `attachment; filename="${documento.nombre}"`)
      headers.set('Content-Length', documento.contenido_archivo.length.toString())
      
      return new NextResponse(documento.contenido_archivo, {
        status: 200,
        headers,
      })
    }
    
    // Fallback para archivos antiguos en filesystem
    const filePath = documento.ruta_archivo
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'Archivo no disponible' },
        { status: 404 }
      )
    }
    
    // Si es URL, redirigir
    if (filePath.startsWith('http')) {
      return NextResponse.redirect(filePath)
    }
    
    // Intenta leer del filesystem
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Archivo no encontrado' },
        { status: 404 }
      )
    }
    
    const fileBuffer = await readFile(filePath)
    
    const headers = new Headers()
    headers.set('Content-Type', documento.tipo_archivo || 'application/octet-stream')
    headers.set('Content-Disposition', `attachment; filename="${documento.nombre}"`)
    headers.set('Content-Length', fileBuffer.length.toString())
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    })
  } catch (error: any) {
    console.error('[v0] Error downloading documento:', error)
    return NextResponse.json(
      { error: error.message || 'Error al descargar documento' },
      { status: error.message === 'No autorizado' ? 401 : 500 }
    )
  }
}
