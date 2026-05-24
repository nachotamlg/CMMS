"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Info, Trash2, Check, Bell, Zap, Shield } from 'lucide-react'
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
    const iconClass = "h-5 w-5"
    switch (type) {
      case "error":
        return <AlertCircle className={`${iconClass} text-red-600`} />
      case "warning":
        return <Zap className={`${iconClass} text-amber-600`} />
      case "success":
        return <CheckCircle2 className={`${iconClass} text-emerald-600`} />
      case "info":
      default:
        return <Info className={`${iconClass} text-blue-600`} />
    }
  }

  const getNotificationStyles = (type: string, isUnread: boolean) => {
    if (isUnread) {
      return "bg-gradient-to-r from-primary/8 to-primary/4 border-primary/30 shadow-sm"
    }
    switch (type) {
      case "error":
        return "bg-red-50/50 border-red-200/60"
      case "warning":
        return "bg-amber-50/50 border-amber-200/60"
      case "success":
        return "bg-emerald-50/50 border-emerald-200/60"
      case "info":
      default:
        return "bg-blue-50/50 border-blue-200/60"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Notificaciones</h1>
              </div>
              <p className="text-sm text-muted-foreground ml-11">
                {notifications.length === 0 
                  ? "No tienes notificaciones" 
                  : `${unreadCount} sin leer de ${notifications.length} total`}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                size="sm"
                className="mt-2"
              >
                <Check className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as typeof filter)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              Todas
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Sin leer
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">
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
            <Card className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="animate-pulse">
                  <Bell className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
              </div>
              <p className="text-muted-foreground">Cargando notificaciones...</p>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="text-muted-foreground font-medium">
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
                className={`border p-4 transition-all duration-200 hover:shadow-md cursor-default ${getNotificationStyles(notification.tipo, !notification.leida)}`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 flex items-center pt-1">
                    <div className={`p-2 rounded-lg ${
                      notification.tipo === "error" ? "bg-red-100" :
                      notification.tipo === "warning" ? "bg-amber-100" :
                      notification.tipo === "success" ? "bg-emerald-100" :
                      "bg-blue-100"
                    }`}>
                      {getNotificationIcon(notification.tipo)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-base">
                          {notification.titulo}
                        </h3>
                      </div>
                      {!notification.leida && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(notification.fecha).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {notification.mensaje}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0 ml-4">
                    {!notification.leida && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Marcar como leída"
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      title="Eliminar"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
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
