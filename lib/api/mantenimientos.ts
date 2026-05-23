import { apiClient } from "./client"
import { serverApiClient } from "./server-client"

const isServer = typeof window === "undefined"

export type Mantenimiento = {
  id?: number
  equipo_id: number
  equipo?: string
  tipo: string
  frecuencia: string
  proxima_programada: string
  ultima_realizacion?: string
  descripcion?: string
  procedimiento?: string
  resultado?: string
  creado_por?: number
  creador?: {
    id: number
    nombre: string
    email: string
  }
  activo?: boolean
  created_at?: string
  updated_at?: string
}

export type MantenimientosResponse = {
  data: Mantenimiento[]
  total: number
  current_page: number
  per_page: number
  last_page: number
}

export type FetchMantenimientosParams = {
  page?: number
  per_page?: number
  tipo?: string
  frecuencia?: string
  resultado?: string
  search?: string
}

export async function fetchMantenimientos(params: FetchMantenimientosParams = {}): Promise<MantenimientosResponse> {
  const client = isServer ? serverApiClient : apiClient

  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append("page", params.page.toString())
  if (params.per_page) queryParams.append("per_page", params.per_page.toString())
  if (params.tipo && params.tipo !== "all") queryParams.append("tipo", params.tipo)
  if (params.frecuencia && params.frecuencia !== "all") queryParams.append("frecuencia", params.frecuencia)
  if (params.resultado && params.resultado !== "all") queryParams.append("resultado", params.resultado)
  if (params.search) queryParams.append("search", params.search)

  const url = `/mantenimientos?${queryParams.toString()}`

  try {
    const response = await client.get<any>(url)

    if (response.data && Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.total || response.data.length,
        current_page: response.current_page || 1,
        per_page: response.per_page || response.data.length,
        last_page: response.last_page || 1,
      }
    }

    if (Array.isArray(response)) {
      return {
        data: response,
        total: response.length,
        current_page: 1,
        per_page: response.length,
        last_page: 1,
      }
    }

    return response
  } catch (error) {
    console.error("[v0] Error fetching mantenimientos:", error)
    throw error
  }
}

export async function fetchMantenimientoDetails(id: number): Promise<Mantenimiento | null> {
  const client = isServer ? serverApiClient : apiClient

  try {
    const response = await client.get<any>(`/mantenimientos/${id}`)
    return response.data || response
  } catch (error) {
    console.error("[v0] Error fetching mantenimiento details:", error)
    return null
  }
}

export async function createMantenimiento(mantenimiento: Omit<Mantenimiento, "id" | "created_at" | "updated_at">): Promise<Mantenimiento> {
  const client = isServer ? serverApiClient : apiClient

  try {
    const response = await client.post<any>("/mantenimientos", mantenimiento)
    return response.data || response
  } catch (error) {
    console.error("[v0] Error creating mantenimiento:", error)
    throw error
  }
}

export async function updateMantenimiento(id: number, mantenimiento: Partial<Mantenimiento>): Promise<Mantenimiento> {
  const client = isServer ? serverApiClient : apiClient

  try {
    const response = await client.put<any>(`/mantenimientos/${id}`, mantenimiento)
    return response.data || response
  } catch (error) {
    console.error("[v0] Error updating mantenimiento:", error)
    throw error
  }
}

export async function deleteMantenimiento(id: number): Promise<void> {
  const client = isServer ? serverApiClient : apiClient

  try {
    await client.delete(`/mantenimientos/${id}`)
  } catch (error) {
    console.error("[v0] Error deleting mantenimiento:", error)
    throw error
  }
}

export async function getMantenimientos(): Promise<Mantenimiento[]> {
  const response = await fetchMantenimientos({ per_page: 1000 })
  return response.data
}

export async function getMantenimientosStats(): Promise<{
  vencidos: number
  proximos: number
  completados: number
  total: number
}> {
  const client = isServer ? serverApiClient : apiClient

  try {
    const response = await client.get<{
      vencidos: number
      proximos: number
      completados: number
      total: number
    }>("/mantenimientos/stats")
    return response
  } catch (error) {
    console.error("[v0] Error fetching maintenance stats:", error)
    return {
      vencidos: 0,
      proximos: 0,
      completados: 0,
      total: 0,
    }
  }
}

export async function checkUpcomingMaintenances(): Promise<{
  total_mantenimientos: number
  notificaciones_creadas: number
  detalles: Array<{
    mantenimiento_id: number
    equipo: string
    responsable_id: number
    dias_hasta: number
    fecha: string
  }>
}> {
  const client = isServer ? serverApiClient : apiClient

  try {
    const response = await client.post<any>("/mantenimientos/check-upcoming", {})
    const data = response.data || response
    return data
  } catch (error) {
    console.error("[v0] Error checking upcoming maintenances:", error)
    return {
      total_mantenimientos: 0,
      notificaciones_creadas: 0,
      detalles: [],
    }
  }
}

export async function completeMantenimiento(
  id: number,
  data: {
    tiempo_real?: number
    costo?: number
    observaciones?: string
    tareas_realizadas?: any
    estado_equipo?: string
  }
): Promise<any> {
  const client = isServer ? serverApiClient : apiClient

  try {
    const response = await client.post<any>(`/mantenimientos/${id}/realizar`, data)
    return response.data || response
  } catch (error) {
    console.error("[v0] Error completing maintenance:", error)
    throw error
  }
}
