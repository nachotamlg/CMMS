"use client"

import { useEffect, useState } from "react"
import { Bell, AlertCircle, CheckCircle2, Info, Trash2, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { getNotifications, type Notification, markAsRead, deleteNotification } from "@/lib/api/notifications"
import Link from "next/link"

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true)
        const data = await getNotifications()
        setNotifications(data)
      } catch (error) {
        console.error("[v0] Failed to load notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 15000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter((n) => !n.leida).length

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      )
    } catch (error) {
      console.error("[v0] Error marking as read:", error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (error) {
      console.error("[v0] Error deleting notification:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    const iconClass = "h-5 w-5"
    switch (type) {
      case "error":
        return <AlertCircle className={`${iconClass} text-red-500`} />
      case "warning":
        return <AlertCircle className={`${iconClass} text-yellow-500`} />
      case "success":
        return <CheckCircle2 className={`${iconClass} text-green-500`} />
      case "info":
      default:
        return <Info className={`${iconClass} text-blue-500`} />
    }
  }

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200 hover:bg-red-100"
      case "warning":
        return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
      case "success":
        return "bg-green-50 border-green-200 hover:bg-green-100"
      case "info":
      default:
        return "bg-blue-50 border-blue-200 hover:bg-blue-100"
    }
  }

  const visibleNotifications = notifications.slice(0, 5)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-accent">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            {unreadCount} notificaciones sin leer
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="font-semibold text-foreground">Notificaciones</h2>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} nuevas
            </Badge>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Cargando notificaciones...
            </div>
          ) : visibleNotifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No tienes notificaciones
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {visibleNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group flex gap-3 rounded-lg border p-3 transition-all ${
                    !notification.leida ? "border-primary bg-primary/5" : getNotificationBgColor(notification.tipo)
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm leading-snug text-foreground">
                        {notification.titulo}
                      </p>
                      {!notification.leida && (
                        <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug mt-1">
                      {notification.mensaje}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-2">
                      {new Date(notification.fecha).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!notification.leida && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Marcar como leída"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span className="sr-only">Marcar como leída</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(notification.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Eliminar notificación</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />
        <div className="p-2">
          <Link href="/notificaciones" className="w-full">
            <Button
              variant="ghost"
              className="w-full justify-center text-primary font-medium text-sm hover:bg-primary/5"
            >
              Ver todas las notificaciones
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
