import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// GET - Listar documentos
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const equipo_id = searchParams.get('equipo_id')
    const orden_id = searchParams.get('orden_id')
    const tipo = searchParams.get('tipo')
    
    const where: any = {}
    
    if (equipo_id) where.equipo_id = parseInt(equipo_id)
    if (orden_id) where.orden_id = parseInt(orden_id)
    if (tipo) where.tipo = tipo
    
    const documentos = await prisma.documento.findMany({
      where,
      orderBy: { created_at: 'desc' },
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
        orden: {
          select: {
            id: true,
            numero_orden: true,
          },
        },
      },
    })
    
    return NextResponse.json(documentos)
  } catch (error: any) {
    console.error('[v0] Error fetching documentos:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener documentos' },
      { status: error.message === 'No autorizado' ? 401 : 500 }
    )
  }
}

// POST - Subir documento
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const tipo = formData.get('tipo') as string
    const descripcion = formData.get('descripcion') as string | null
    const equipo_id = formData.get('equipo_id') as string | null
    const orden_id = formData.get('orden_id') as string | null
    
    if (!file) {
      return NextResponse.json(
        { error: 'Archivo requerido' },
        { status: 400 }
      )
    }
    
    if (!tipo) {
      return NextResponse.json(
        { error: 'Tipo de documento requerido' },
        { status: 400 }
      )
    }
    
    // Validar tamaño (50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Archivo demasiado grande (máximo 50MB)' },
        { status: 400 }
      )
    }
    
    // Leer contenido del archivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Crear registro en BD con contenido del archivo
    const documento = await prisma.documento.create({
      data: {
        tipo,
        nombre: file.name,
        descripcion: descripcion || undefined,
        contenido_archivo: buffer,
        tipo_archivo: file.type,
        tamano: Math.ceil(file.size / 1024),
        equipo_id: equipo_id ? parseInt(equipo_id) : undefined,
        orden_id: orden_id ? parseInt(orden_id) : undefined,
        subido_por: session.id,
        almacenado_en_bd: true,
      },
      include: {
        subidoPor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    })
    
    // Crear log
    await prisma.log.create({
      data: {
        usuario_id: session.id,
        accion: 'SUBIR',
        modulo: 'DOCUMENTOS',
        descripcion: `Documento subido: ${file.name}`,
        datos: { documento_id: documento.id },
      },
    })
    
    return NextResponse.json(documento, { status: 201 })
  } catch (error: any) {
    console.error('[v0] Error uploading documento:', error)
    return NextResponse.json(
      { error: error.message || 'Error al subir documento' },
      { status: error.message === 'No autorizado' ? 401 : 500 }
    )
  }
}
