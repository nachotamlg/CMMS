import { apiClient } from "./client"

export interface Notification {
  id: number
  usuario_id: number
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  fecha_envio: string
  datos?: any
  created_at: string
  updated_at: string
}

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get(`/api/notificaciones`)
    
    if (response.success && Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error) {
    console.error("[v0] Error fetching notifications:", error)
    return []
  }
}

export const markAsRead = async (id: number): Promise<void> => {
  try {
    await apiClient.put(`/api/notificaciones/${id}/leer`)
  } catch (error) {
    console.error("[v0] Error marking notification as read:", error)
    throw error
  }
}

export const markAllAsRead = async (): Promise<void> => {
  try {
    await apiClient.post("/api/notificaciones/marcar-todas-leidas")
  } catch (error) {
    console.error("[v0] Error marking all notifications as read:", error)
    throw error
  }
}

export const deleteNotification = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/notificaciones/${id}`)
  } catch (error) {
    console.error("[v0] Error deleting notification:", error)
    throw error
  }
}

export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await apiClient.get(`/api/notificaciones/sin-leer`)
    if (response.success) {
      return response.count || 0
    }
    return 0
  } catch (error) {
    console.error("[v0] Error getting unread count:", error)
    return 0
  }
}

function determinePriority(tipo: string): "alta" | "media" | "baja" {
  switch (tipo) {
    case "warning":
      return "alta"
    case "error":
      return "alta"
    case "info":
      return "media"
    case "success":
      return "baja"
    default:
      return "media"
  }
}

function determineLink(tipo: string): string | undefined {
  switch (tipo) {
    case "error":
      return "/dashboard"
    case "warning":
      return "/calendario"
    case "info":
      return "/ordenes"
    default:
      return undefined
  }
}
