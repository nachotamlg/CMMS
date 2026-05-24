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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl ring-1 ring-primary/20">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">Notificaciones</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notifications.length === 0 
                      ? "Sin notificaciones por el momento" 
                      : `${unreadCount} sin leer de ${notifications.length} total`}
                  </p>
                </div>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                size="sm"
                className="gap-2 whitespace-nowrap"
              >
                <Check className="h-4 w-4" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as typeof filter)} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 rounded-lg">
            <TabsTrigger value="all" className="gap-2 data-[state=active]:bg-background">
              Todas
              <Badge variant="secondary" className="rounded-full">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-2 data-[state=active]:bg-background">
              Sin leer
              {unreadCount > 0 && (
                <Badge variant="destructive" className="rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read" className="gap-2 data-[state=active]:bg-background">
              Leídas
              <Badge variant="secondary" className="rounded-full">
                {notifications.filter((n) => n.leida).length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <Card className="p-16 text-center border-dashed">
              <div className="flex justify-center mb-4">
                <div className="animate-spin">
                  <Bell className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
              </div>
              <p className="text-muted-foreground font-medium">Cargando notificaciones...</p>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card className="p-16 text-center border-dashed bg-muted/30">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-muted/50 rounded-full">
                  <Info className="h-8 w-8 text-muted-foreground opacity-60" />
                </div>
              </div>
              <p className="text-muted-foreground font-medium">
                {filter === "unread" 
                  ? "No tienes notificaciones sin leer" 
                  : filter === "read" 
                  ? "No tienes notificaciones leídas" 
                  : "No tienes notificaciones"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Aquí aparecerán tus notificaciones cuando las recibas
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-default ${getNotificationStyles(notification.tipo, !notification.leida)}`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 flex items-center pt-0.5">
                    <div className={`p-2.5 rounded-lg ${
                      notification.tipo === "error" ? "bg-red-100 dark:bg-red-900/30" :
                      notification.tipo === "warning" ? "bg-amber-100 dark:bg-amber-900/30" :
                      notification.tipo === "success" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                      "bg-blue-100 dark:bg-blue-900/30"
                    }`}>
                      {getNotificationIcon(notification.tipo)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-base leading-tight">
                          {notification.titulo}
                        </h3>
                      </div>
                      {!notification.leida && (
                        <div className="flex-shrink-0 mt-1">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary inline-block" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground/80 mb-2 font-medium">
                      {new Date(notification.created_at).toLocaleDateString("es-ES", {
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
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      title="Eliminar"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
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
