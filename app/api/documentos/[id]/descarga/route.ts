import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/documentos/[id]/descarga
 * Descargar un documento y registrar auditoría
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;
    const documentoId = parseInt(id);

    console.log('[v0] GET /documentos/[id]/descarga - Starting download for doc:', documentoId);

    // Obtener documento
    const documento = await prisma.documento.findUnique({
      where: { id: documentoId },
      include: {
        usuario: {
          select: {
            nombre: true,
            email: true,
          },
        },
      },
    });

    if (!documento) {
      console.log('[v0] GET /documentos/[id]/descarga - Document not found:', documentoId);
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el documento está activo
    if (documento.estado !== 'activo') {
      console.log('[v0] GET /documentos/[id]/descarga - Document not active:', documento.estado);
      return NextResponse.json(
        { error: 'Documento no está disponible' },
        { status: 403 }
      );
    }

    console.log('[v0] GET /documentos/[id]/descarga - Document found:', documento.nombre);

    // Si está almacenado en BD, devolver contenido
    if (documento.almacenado_en_bd && documento.contenido_archivo) {
      console.log('[v0] GET /documentos/[id]/descarga - Returning content from DB');

      // Registrar auditoría
      await prisma.auditoriaDocumento.create({
        data: {
          documento_id: documentoId,
          usuario_id: session.id,
          accion: 'descarga',
          descripcion: `Documento "${documento.nombre}" descargado`,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          user_agent: request.headers.get('user-agent') || undefined,
        },
      }).catch(err => console.error('[v0] Error registering audit:', err));

      // Crear log
      await prisma.log.create({
        data: {
          usuario_id: session.id,
          accion: 'Descargar',
          modulo: 'Documentos',
          descripcion: `Documento descargado: ${documento.nombre}`,
          datos: { documento_id: documentoId },
        },
      }).catch(err => console.error('[v0] Error creating log:', err));

      // Devolver archivo
      return new NextResponse(documento.contenido_archivo, {
        headers: {
          'Content-Type': documento.tipo_archivo || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${documento.nombre}"`,
          'Content-Length': documento.tamano.toString(),
        },
      });
    }

    // Si está en almacenamiento externo, redirigir
    if (documento.ruta_archivo) {
      console.log('[v0] GET /documentos/[id]/descarga - Redirecting to external storage');

      // Registrar auditoría
      await prisma.auditoriaDocumento.create({
        data: {
          documento_id: documentoId,
          usuario_id: session.id,
          accion: 'descarga',
          descripcion: `Documento "${documento.nombre}" descargado desde almacenamiento externo`,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          user_agent: request.headers.get('user-agent') || undefined,
        },
      }).catch(err => console.error('[v0] Error registering audit:', err));

      return NextResponse.redirect(documento.ruta_archivo);
    }

    console.log('[v0] GET /documentos/[id]/descarga - No content found');
    return NextResponse.json(
      { error: 'El documento no tiene contenido disponible' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('[v0] GET /documentos/[id]/descarga - ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'Error al descargar documento' },
      { status: error.message === 'No autorizado' ? 401 : 500 }
    );
  }
}
