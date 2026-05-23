// Transform database fields to camelCase for UI
export type Mantenimiento = {
  id?: number
  equipoId?: number
  equipo_id?: number
  equipo?: any
  tipo: string
  procedimiento?: string | null
  resultado?: string | null
  frecuencia: string
  ultimaFecha?: string | null
  ultima_realizacion?: string | null
  proximaFecha?: string
  proxima_programada: string
  observaciones?: string | null
  descripcion?: string | null
  activo?: boolean
  created_at?: string
  updated_at?: string
  creado_por?: number
  programada_orden_generada?: boolean
  realizaciones?: any[]
  ultimaRealizacion?: any
  completado?: boolean
  responsableNombre?: string
}

export function transformMantenimientoToUI(data: any): Mantenimiento {
  // Get the latest realization if any
  const ultimaRealizacion = data.realizaciones && data.realizaciones.length > 0 
    ? data.realizaciones[data.realizaciones.length - 1]
    : null

  return {
    id: data.id,
    equipoId: data.equipo_id,
    equipo_id: data.equipo_id,
    equipo: data.equipo?.nombre || data.equipo,
    tipo: data.tipo,
    procedimiento: data.procedimiento,
    resultado: data.resultado,
    frecuencia: data.frecuencia,
    ultimaFecha: data.ultima_realizacion,
    ultima_realizacion: data.ultima_realizacion,
    proximaFecha: data.proxima_programada,
    proxima_programada: data.proxima_programada,
    observaciones: data.descripcion,
    descripcion: data.descripcion,
    activo: data.activo,
    created_at: data.created_at,
    updated_at: data.updated_at,
    creado_por: data.creado_por,
    programada_orden_generada: data.programada_orden_generada,
    realizaciones: data.realizaciones || [],
    ultimaRealizacion: ultimaRealizacion,
    completado: !!ultimaRealizacion,
    responsableNombre: ultimaRealizacion?.tecnico?.nombre || 'Sin asignar',
  }
}
