"use server"

import {
  getOrdenesTrabajo,
  getOrdenTrabajo,
  createOrdenTrabajo,
  updateOrdenTrabajo,
  deleteOrdenTrabajo,
  asignarTecnico,
  cambiarEstado,
  exportOrdenTrabajoPDF,
  type OrdenTrabajo,
  type OrdenesTrabajoFilters,
  type OrdenesTrabajoResponse,
} from "@/lib/api/ordenes-trabajo"

export type { OrdenTrabajo, OrdenesTrabajoFilters, OrdenesTrabajoResponse }

export async function fetchOrdenesTrabajo(filters?: OrdenesTrabajoFilters): Promise<OrdenesTrabajoResponse> {
  try {
    console.log("[v0] fetchOrdenesTrabajo - Calling API with filters:", filters)
    const result = await getOrdenesTrabajo(filters)
    console.log("[v0] fetchOrdenesTrabajo - API returned:", result?.data?.length ?? 0, "orders")
    return result || {
      data: [],
      total: 0,
      currentPage: 1,
      lastPage: 1,
      perPage: 10,
    }
  } catch (error) {
    console.error("[v0] fetchOrdenesTrabajo - Error:", error)
    return {
      data: [],
      total: 0,
      currentPage: 1,
      lastPage: 1,
      perPage: 10,
    }
  }
}

export async function fetchOrdenTrabajo(id: number): Promise<OrdenTrabajo | null> {
  try {
    return await getOrdenTrabajo(id)
  } catch (error) {
    console.error("[v0] fetchOrdenTrabajo - Error:", error)
    return null
  }
}

export async function saveOrdenTrabajo(orden: Partial<OrdenTrabajo>): Promise<{ success: boolean; data?: OrdenTrabajo; error?: string }> {
  try {
    console.log("[v0] saveOrdenTrabajo - Input data:", JSON.stringify(orden, null, 2))

    if (orden.id) {
      const result = await updateOrdenTrabajo(orden.id, orden)
      console.log("[v0] saveOrdenTrabajo - Update successful:", result)
      return { success: true, data: result }
    } else {
      const result = await createOrdenTrabajo(orden)
      console.log("[v0] saveOrdenTrabajo - Create successful:", result)
      return { success: true, data: result }
    }
  } catch (error) {
    console.error("[v0] saveOrdenTrabajo - Error:", error)
    let errorMessage = "Error al guardar la orden de trabajo"
    if (error instanceof Error) {
      errorMessage = error.message
      console.error("[v0] Error message:", error.message)
    }
    return { success: false, error: errorMessage }
  }
}

export async function removeOrdenTrabajo(id: number): Promise<{ success: boolean; error?: string }> {
  console.log("[v0] removeOrdenTrabajo - Starting deletion for id:", id)

  try {
    const result = await deleteOrdenTrabajo(id)
    console.log("[v0] removeOrdenTrabajo - deleteOrdenTrabajo succeeded, result:", result)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] removeOrdenTrabajo - Error caught in action:", error)
    return { success: false, error: errorMessage }
  }
}

export async function asignarTecnicoAOrden(ordenId: number, tecnicoId: number): Promise<{ success: boolean; data?: OrdenTrabajo; error?: string }> {
  try {
    console.log("[v0] asignarTecnicoAOrden - Action called with ordenId:", ordenId, "tecnicoId:", tecnicoId)
    const result = await asignarTecnico(ordenId, tecnicoId)
    console.log("[v0] asignarTecnicoAOrden - Success:", result)
    return { success: true, data: result }
  } catch (error) {
    console.error("[v0] asignarTecnicoAOrden - Error:", error)
    const errorMessage = error instanceof Error ? error.message : "Error al asignar técnico"
    return { success: false, error: errorMessage }
  }
}

export async function cambiarEstadoOrden(
  ordenId: number,
  nuevoEstado: string,
  observaciones?: string,
): Promise<{ success: boolean; data?: OrdenTrabajo; error?: string }> {
  try {
    console.log("[v0] cambiarEstadoOrden - Action called with ordenId:", ordenId, "estado:", nuevoEstado)
    const result = await cambiarEstado(ordenId, nuevoEstado, observaciones)
    console.log("[v0] cambiarEstadoOrden - Success:", result)
    return { success: true, data: result }
  } catch (error) {
    console.error("[v0] cambiarEstadoOrden - Error:", error)
    const errorMessage = error instanceof Error ? error.message : "Error al cambiar estado"
    return { success: false, error: errorMessage }
  }
}

export async function exportOrdenPDF(id: number): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    console.log("[v0] exportOrdenPDF - Server action called for id:", id)
    const blob = await exportOrdenTrabajoPDF(id)

    // Convert blob to base64
    const arrayBuffer = await blob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")

    console.log("[v0] exportOrdenPDF - PDF exported successfully")
    return { success: true, data: base64 }
  } catch (error) {
    console.error("[v0] exportOrdenPDF - Error:", error)
    const errorMessage = error instanceof Error ? error.message : "Error al exportar PDF"
    return { success: false, error: errorMessage }
  }
}
