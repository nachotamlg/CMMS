import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET - Obtener documentos de un equipo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request)
    const { id } = await params
    const equipoId = parseInt(id)

    const documentos = await prisma.documento.findMany({
      where: { equipo_id: equipoId },
      orderBy: { created_at: 'desc' },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
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

// POST - Subir un nuevo documento
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.error('[v0] POST /documentos - === STARTING DOCUMENT UPLOAD ===')
    
    const session = await requireAuth(request)
    console.error('[v0] POST /documentos - Auth successful for user:', session.id, session.email)
    
    const { id } = await params
    const equipoId = parseInt(id)
    console.error('[v0] POST /documentos - Equipment ID:', equipoId)

    // Verificar que el equipo existe
    const equipo = await prisma.equipo.findUnique({
      where: { id: equipoId },
    })

    if (!equipo) {
      console.error('[v0] POST /documentos - Equipment not found:', equipoId)
      return NextResponse.json(
        { error: 'Equipo no encontrado' },
        { status: 404 }
      )
    }

    console.error('[v0] POST /documentos - Equipment found:', equipo.nombre)

    // Obtener el FormData
    const formData = await request.formData()
    const archivo = formData.get('archivo') as File
    const subidoPorId = formData.get('subido_por_id') as string

    console.error('[v0] POST /documentos - FormData entries:')
    for (const [key, value] of formData.entries()) {
      if (key === 'archivo' && value instanceof File) {
        console.error(`  - ${key}: File(${value.name}, ${value.size} bytes)`)
      } else {
        console.error(`  - ${key}: ${value}`)
      }
    }

    if (!archivo) {
      console.error('[v0] POST /documentos - Error: No file provided')
      return NextResponse.json(
        { error: 'No se proporciono archivo' },
        { status: 400 }
      )
    }

    if (!subidoPorId) {
      console.error('[v0] POST /documentos - Error: No subidoPorId provided')
      return NextResponse.json(
        { error: 'No se proporciono el ID del usuario que sube' },
        { status: 400 }
      )
    }

    console.error('[v0] POST /documentos - File validation passed:', archivo.name, archivo.size)

    // Validar que el archivo no sea muy grande (máximo 50MB)
    const maxSize = 50 * 1024 * 1024
    if (archivo.size > maxSize) {
      console.error('[v0] POST /documentos - File too large:', archivo.size)
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 50MB' },
        { status: 400 }
      )
    }

    // Crear documento en la base de datos
    console.error('[v0] POST /documentos - Creating document in database...')
    const documento = await prisma.documento.create({
      data: {
        nombre: archivo.name,
        tipo: 'archivo',
        ruta_archivo: `equipos/${equipoId}/${Date.now()}-${archivo.name}`,
        tipo_archivo: archivo.type,
        tamano: Math.ceil(archivo.size / 1024),
        equipo_id: equipoId,
        subido_por: parseInt(subidoPorId),
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    })

    console.error('[v0] POST /documentos - Document created successfully:', documento.id, documento.nombre)

    // Crear log
    await prisma.log.create({
      data: {
        usuario_id: session.id,
        accion: 'Subir',
        modulo: 'Documentos',
        descripcion: `Documento subido: ${archivo.name} para equipo ${equipo.nombre} (Código: ${equipo.codigo})`,
        datos: { documento_id: documento.id, equipo_id: equipoId },
      },
    })

    console.error('[v0] POST /documentos - === UPLOAD COMPLETED SUCCESSFULLY ===')
    return NextResponse.json(documento, { status: 201 })
  } catch (error: any) {
    console.error('[v0] POST /documentos - ERROR:', error)
    console.error('[v0] POST /documentos - Error message:', error.message)
    console.error('[v0] POST /documentos - Error stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Error al subir documento' },
      { status: error.message === 'No autorizado' ? 401 : 500 }
    )
  }
}
