"use client"

import { useEffect, useState } from "react"
import { Bell, AlertCircle, CheckCircle2, Info, Zap, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getNotifications, type Notification } from "@/lib/api/notifications"

function getNotificationIcon(tipo?: string) {
  const iconClass = "h-4 w-4 flex-shrink-0"
  switch (tipo?.toLowerCase()) {
    case "warning":
      return <Zap className={`${iconClass} text-amber-600`} />
    case "error":
      return <AlertCircle className={`${iconClass} text-red-600`} />
    case "success":
      return <CheckCircle2 className={`${iconClass} text-emerald-600`} />
    default:
      return <Info className={`${iconClass} text-blue-600`} />
  }
}

function getNotificationBgClass(tipo?: string) {
  switch (tipo?.toLowerCase()) {
    case "warning":
      return "bg-amber-50 hover:bg-amber-100/70"
    case "error":
      return "bg-red-50 hover:bg-red-100/70"
    case "success":
      return "bg-emerald-50 hover:bg-emerald-100/70"
    default:
      return "bg-blue-50 hover:bg-blue-100/70"
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return "Ahora"
  if (minutes < 60) return `Hace ${minutes}m`
  if (hours < 24) return `Hace ${hours}h`
  if (days === 1) return "Ayer"
  return `Hace ${days}d`
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true)
        const data = await getNotifications()
        setNotifications(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("[v0] Failed to load notifications:", error)
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 15000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter((n) => !n.leida).length
  const recentNotifications = notifications.slice(0, 4)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-full hover:bg-primary/10 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-semibold rounded-full"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificaciones ({unreadCount} sin leer)</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0 shadow-xl border border-border/50 bg-background/95 backdrop-blur-sm">
        {/* Header */}
        <div className="px-5 py-4 border-b bg-gradient-to-r from-primary/8 via-primary/5 to-transparent">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bell className="h-4 w-4 text-primary" />
                <p className="font-semibold text-sm text-foreground">Notificaciones</p>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                {unreadCount > 0 ? (
                  <span className="text-primary font-medium">{unreadCount} sin leer</span>
                ) : (
                  "Todas vistas"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[420px] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <div className="flex justify-center mb-3">
                <div className="animate-spin">
                  <Bell className="h-6 w-6 opacity-50" />
                </div>
              </div>
              <p>Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-muted/50">
                  <Bell className="h-6 w-6 opacity-50" />
                </div>
              </div>
              <p className="font-medium">No hay notificaciones</p>
              <p className="text-xs mt-1">Aquí aparecerán tus notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-5 py-3.5 transition-all hover:bg-muted/40 cursor-default ${
                    !notification.leida ? "bg-primary/5 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <div className="flex gap-3.5 items-start">
                    <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                      notification.tipo === "error" ? "bg-red-100 dark:bg-red-900/30" :
                      notification.tipo === "warning" ? "bg-amber-100 dark:bg-amber-900/30" :
                      notification.tipo === "success" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                      "bg-blue-100 dark:bg-blue-900/30"
                    }`}>
                      {getNotificationIcon(notification.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-foreground leading-tight">
                          {notification.titulo}
                        </p>
                        {!notification.leida && (
                          <span className="flex-shrink-0 inline-block">
                            <span className="h-2.5 w-2.5 rounded-full bg-primary inline-block" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-1.5">
                        {notification.mensaje}
                      </p>
                      <p className="text-xs text-muted-foreground/80 font-medium">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <div className="border-t bg-gradient-to-b from-background to-muted/20">
              <Link href="/notificaciones" className="block">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-between rounded-none py-3 px-5 text-primary hover:text-primary hover:bg-primary/8 transition-all"
                >
                  <span className="text-sm font-medium">Ver todas las notificaciones</span>
                  <ArrowRight className="h-4 w-4 opacity-60" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
