// Transform database fields to camelCase for UI
export type OrdenTrabajo = {
  id?: number
  equipoId?: number
  equipo_id?: number
  equipo?: any
  numeroOrden?: string
  numero_orden?: string
  tipo: string
  prioridad: string
  descripcion?: string
  estado: string
  fechaProgramada?: string | null
  fecha_programada?: string | null
  tiempoEstimado?: number | null
  tiempo_estimado?: number | null
  costoEstimado?: number | null
  costo_estimado?: number | null
  creador?: any
  creadoPor?: number
  creado_por?: number
  tecnico?: any
  asignadoA?: number | null
  asignado_a?: number | null
  created_at?: string
  updated_at?: string
}

export function transformOrdenTrabajoToUI(data: any): OrdenTrabajo {
  return {
    id: data.id,
    equipoId: data.equipo_id,
    equipo_id: data.equipo_id,
    equipo: data.equipo?.nombre || data.equipo,
    numeroOrden: data.numero_orden,
    numero_orden: data.numero_orden,
    tipo: data.tipo,
    prioridad: data.prioridad,
    descripcion: data.descripcion,
    estado: data.estado,
    fechaProgramada: data.fecha_programada,
    fecha_programada: data.fecha_programada,
    tiempoEstimado: data.tiempo_estimado,
    tiempo_estimado: data.tiempo_estimado,
    costoEstimado: data.costo_estimado,
    costo_estimado: data.costo_estimado,
    creador: data.creador,
    creadoPor: data.creado_por,
    creado_por: data.creado_por,
    tecnico: data.tecnico,
    asignadoA: data.asignado_a,
    asignado_a: data.asignado_a,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}
