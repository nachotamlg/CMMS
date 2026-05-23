import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[v0] Download route called')
  try {
    await requireAuth(request)
    console.log('[v0] Auth passed')
    
    const { id } = await params
    console.log('[v0] Document ID:', id)
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
    
    // Check if file exists on disk
    const filePath = documento.ruta_archivo || documento.url_archivo
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'Archivo no disponible' },
        { status: 404 }
      )
    }
    
    // If it's a URL, redirect to it
    if (filePath.startsWith('http')) {
      return NextResponse.redirect(filePath)
    }
    
    // Check if file exists locally
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Archivo no encontrado en el servidor' },
        { status: 404 }
      )
    }
    
    // Read and return file
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
