import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createAuditLog } from '@/app/actions/logs'
import type { OrdenTrabajo } from '@/lib/api/ordenes-trabajo'

// Helper to transform database record to OrdenTrabajo type
function transformFromDB(record: any): OrdenTrabajo {
  return {
    id: record.id,
    numeroOrden: record.numero_orden,
    equipoId: record.equipo_id,
    equipoNombre: record.equipo?.nombre || '',
    tipo: record.tipo,
    prioridad: record.prioridad,
    estado: record.estado,
    descripcion: record.descripcion,
    fechaCreacion: record.fecha_solicitud?.toISOString() || record.fecha_programada?.toISOString(),
    fechaInicio: record.fecha_inicio?.toISOString(),
    fechaFinalizacion: record.fecha_finalizacion?.toISOString(),
    tecnicoAsignadoId: record.asignado_a,
    tecnicoAsignadoNombre: record.tecnico?.nombre || '',
    horasTrabajadas: record.tiempo_estimado,
    costoRepuestos: record.costo_estimado ? Number(record.costo_estimado) : undefined,
    costoTotal: record.costo_real ? Number(record.costo_real) : undefined,
    createdAt: record.created_at?.toISOString(),
    updatedAt: record.updated_at?.toISOString(),
    observaciones: record.notas || '',
  }
}

export async function createOrdenDB(data: any): Promise<OrdenTrabajo> {
  console.log('[v0] createOrdenDB - Creating with data:', data)

  try {
    const orden = await prisma.ordenTrabajo.create({
      data: {
        numero_orden: data.numero_orden || `ORD-${Date.now()}`,
        equipo_id: data.equipo_id,
        tipo: data.tipo,
        prioridad: data.prioridad,
        descripcion: data.descripcion,
        estado: 'pendiente',
        fecha_programada: data.fecha_programada ? new Date(data.fecha_programada) : null,
        fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : null,
        fecha_finalizacion: data.fecha_finalizacion ? new Date(data.fecha_finalizacion) : null,
        tiempo_estimado: data.tiempo_estimado ? parseInt(data.tiempo_estimado) : null,
        costo_estimado: data.costo_estimado ? parseFloat(data.costo_estimado) : null,
        costo_real: data.costo_real ? parseFloat(data.costo_real) : null,
        asignado_a: data.asignado_a || null,
        creado_por: data.creado_por || 1,
      },
      include: {
        equipo: true,
        tecnico: true,
        creador: true,
      },
    })

    console.log('[v0] createOrdenDB - Created orden:', orden.id)
    
    // Log the creation
    const session = await getSession()
    await createAuditLog({
      usuario_id: session?.id,
      accion: 'CREAR',
      modulo: 'ORDENES',
      descripcion: `Orden de trabajo ${orden.numero_orden} creada`,
      datos: { ordenId: orden.id, numero_orden: orden.numero_orden, tipo: orden.tipo }
    }).catch(err => console.error("[v0] Error logging orden creation:", err))
    
    return transformFromDB(orden)
  } catch (error) {
    console.error('[v0] createOrdenDB - Error:', error)
    throw error
  }
}

export async function getOrdenDB(id: number): Promise<OrdenTrabajo | null> {
  try {
    const orden = await prisma.ordenTrabajo.findUnique({
      where: { id },
      include: {
        equipo: true,
        tecnico: true,
        creador: true,
      },
    })

    if (!orden) return null
    return transformFromDB(orden)
  } catch (error) {
    console.error('[v0] getOrdenDB - Error:', error)
    return null
  }
}

export async function getOrdenesDB(filters?: any): Promise<any> {
  try {
    const where: any = {}

    if (filters?.estado) {
      where.estado = filters.estado
    }

    if (filters?.prioridad) {
      where.prioridad = filters.prioridad
    }

    if (filters?.equipo_id) {
      where.equipo_id = filters.equipo_id
    }

    const perPage = filters?.perPage || 10
    const page = filters?.page || 1
    const skip = (page - 1) * perPage

    const [ordenes, total] = await Promise.all([
      prisma.ordenTrabajo.findMany({
        where,
        include: {
          equipo: true,
          tecnico: true,
          creador: true,
        },
        orderBy: { created_at: 'desc' },
        take: perPage,
        skip: skip,
      }),
      prisma.ordenTrabajo.count({ where }),
    ])

    const lastPage = Math.ceil(total / perPage)

    return {
      data: ordenes.map(transformFromDB),
      total,
      currentPage: page,
      lastPage,
      perPage,
    }
  } catch (error) {
    console.error('[v0] getOrdenesDB - Error:', error)
    return {
      data: [],
      total: 0,
      currentPage: 1,
      lastPage: 1,
      perPage: 10,
    }
  }
}

export async function updateOrdenDB(id: number, data: any): Promise<OrdenTrabajo> {
  console.log('[v0] updateOrdenDB - Updating orden', id, 'with data:', data)

  try {
    const updateData: any = {}

    if (data.equipo_id !== undefined) updateData.equipo_id = data.equipo_id
    if (data.tipo !== undefined) updateData.tipo = data.tipo
    if (data.prioridad !== undefined) updateData.prioridad = data.prioridad
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion
    if (data.estado !== undefined) updateData.estado = data.estado
    if (data.fecha_programada !== undefined) {
      updateData.fecha_programada = data.fecha_programada ? new Date(data.fecha_programada) : null
    }
    if (data.fecha_inicio !== undefined) {
      updateData.fecha_inicio = data.fecha_inicio ? new Date(data.fecha_inicio) : null
    }
    if (data.fecha_finalizacion !== undefined) {
      updateData.fecha_finalizacion = data.fecha_finalizacion ? new Date(data.fecha_finalizacion) : null
    }
    if (data.tiempo_estimado !== undefined) updateData.tiempo_estimado = data.tiempo_estimado ? parseInt(data.tiempo_estimado) : null
    if (data.costo_estimado !== undefined) updateData.costo_estimado = data.costo_estimado ? parseFloat(data.costo_estimado) : null
    if (data.costo_real !== undefined) updateData.costo_real = data.costo_real ? parseFloat(data.costo_real) : null
    if (data.asignado_a !== undefined) updateData.asignado_a = data.asignado_a

    const orden = await prisma.ordenTrabajo.update({
      where: { id },
      data: updateData,
      include: {
        equipo: true,
        tecnico: true,
        creador: true,
      },
    })

    console.log('[v0] updateOrdenDB - Updated orden:', id)
    
    // Log the update
    const session = await getSession()
    await createAuditLog({
      usuario_id: session?.id,
      accion: 'EDITAR',
      modulo: 'ORDENES',
      descripcion: `Orden de trabajo ${orden.numero_orden} actualizada`,
      datos: { ordenId: id, numero_orden: orden.numero_orden, tipo: orden.tipo }
    }).catch(err => console.error("[v0] Error logging orden update:", err))
    
    return transformFromDB(orden)
  } catch (error) {
    console.error('[v0] updateOrdenDB - Error:', error)
    throw error
  }
}

export async function deleteOrdenDB(id: number): Promise<boolean> {
  console.log('[v0] deleteOrdenDB - Deleting orden', id)

  try {
    // Get orden details before deletion for logging
    const orden = await prisma.ordenTrabajo.findUnique({
      where: { id }
    })

    await prisma.ordenTrabajo.delete({
      where: { id },
    })

    console.log('[v0] deleteOrdenDB - Deleted orden:', id)
    
    // Log the deletion
    if (orden) {
      const session = await getSession()
      await createAuditLog({
        usuario_id: session?.id,
        accion: 'ELIMINAR',
        modulo: 'ORDENES',
        descripcion: `Orden de trabajo ${orden.numero_orden} eliminada`,
        datos: { ordenId: id, numero_orden: orden.numero_orden, tipo: orden.tipo }
      }).catch(err => console.error("[v0] Error logging orden deletion:", err))
    }
    
    return true
  } catch (error) {
    console.error('[v0] deleteOrdenDB - Error:', error)
    throw error
  }
}

export async function asignarTecnicoDB(ordenId: number, tecnicoId: number): Promise<OrdenTrabajo> {
  console.log('[v0] asignarTecnicoDB - Assigning tecnico', tecnicoId, 'to orden', ordenId)

  try {
    const orden = await prisma.ordenTrabajo.update({
      where: { id: ordenId },
      data: {
        asignado_a: tecnicoId,
        estado: 'asignada',
      },
      include: {
        equipo: true,
        tecnico: true,
        creador: true,
      },
    })

    console.log('[v0] asignarTecnicoDB - Assigned tecnico')
    
    // Log the assignment
    const session = await getSession()
    await createAuditLog({
      usuario_id: session?.id,
      accion: 'EDITAR',
      modulo: 'ORDENES',
      descripcion: `Técnico asignado a orden de trabajo ${orden.numero_orden}`,
      datos: { ordenId: ordenId, numero_orden: orden.numero_orden, tecnico_id: tecnicoId }
    }).catch(err => console.error("[v0] Error logging tecnico assignment:", err))
    
    return transformFromDB(orden)
  } catch (error) {
    console.error('[v0] asignarTecnicoDB - Error:', error)
    throw error
  }
}

export async function cambiarEstadoDB(
  ordenId: number,
  nuevoEstado: string,
  observaciones?: string,
): Promise<OrdenTrabajo> {
  console.log('[v0] cambiarEstadoDB - Changing estado of orden', ordenId, 'to', nuevoEstado, 'observaciones:', observaciones)

  try {
    const updateData: any = {
      estado: nuevoEstado,
    }

    // If observaciones are provided, update the notas field
    if (observaciones) {
      updateData.notas = observaciones
    }

    const orden = await prisma.ordenTrabajo.update({
      where: { id: ordenId },
      data: updateData,
      include: {
        equipo: true,
        tecnico: true,
        creador: true,
      },
    })

    console.log('[v0] cambiarEstadoDB - Changed estado')
    
    // Log the status change
    const session = await getSession()
    await createAuditLog({
      usuario_id: session?.id,
      accion: 'EDITAR',
      modulo: 'ORDENES',
      descripcion: `Estado de orden de trabajo ${orden.numero_orden} cambiado a ${nuevoEstado}`,
      datos: { ordenId: ordenId, numero_orden: orden.numero_orden, estado: nuevoEstado }
    }).catch(err => console.error("[v0] Error logging estado change:", err))
    
    return transformFromDB(orden)
  } catch (error) {
    console.error('[v0] cambiarEstadoDB - Error:', error)
    throw error
  }
}
