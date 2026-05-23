"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Info, Trash2, Check, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getNotifications, type Notification, markAsRead, deleteNotification, markAllAsRead } from "@/lib/api/notifications"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")

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
  }, [])

  const unreadCount = notifications.filter((n) => !n.leida).length
  
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.leida
    if (filter === "read") return n.leida
    return true
  })

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

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })))
    } catch (error) {
      console.error("[v0] Error marking all as read:", error)
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
    const iconClass = "h-6 w-6"
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

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "success":
        return "bg-green-50 border-green-200"
      case "info":
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">Notificaciones</h1>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">
            {notifications.length === 0 
              ? "No tienes notificaciones" 
              : `Tienes ${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer de ${notifications.length} total`}
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as typeof filter)} className="mb-6">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-2">
              Todas
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              Sin leer
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read" className="flex items-center gap-2">
              Leídas
              <Badge variant="secondary" className="ml-2">
                {notifications.filter((n) => n.leida).length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Cargando notificaciones...</p>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <Info className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                {filter === "unread" 
                  ? "No tienes notificaciones sin leer" 
                  : filter === "read" 
                  ? "No tienes notificaciones leídas" 
                  : "No tienes notificaciones"}
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border p-4 transition-all hover:shadow-md ${
                  !notification.leida 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                    : getNotificationColor(notification.tipo)
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 flex items-start mt-0.5">
                    {getNotificationIcon(notification.tipo)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">
                          {notification.titulo}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.fecha).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {!notification.leida && (
                        <Badge className="flex-shrink-0 bg-primary">
                          Nueva
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {notification.mensaje}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.leida && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary"
                        title="Marcar como leída"
                      >
                        <Check className="h-4 w-4" />
                        <span className="hidden sm:inline">Leer</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      className="flex items-center gap-2 text-destructive hover:bg-destructive/10 hover:border-destructive"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
