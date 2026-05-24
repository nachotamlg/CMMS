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
import { getNotifications, type Notification } from "@/app/actions/notificaciones"

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
      <DropdownMenuContent align="end" className="w-96 p-0 shadow-lg">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-sm text-foreground">Notificaciones</p>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} sin leer` : "Todas vistas"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <div className="animate-pulse inline-block">
                <Bell className="h-6 w-6 opacity-40" />
              </div>
              <p className="mt-2">Cargando...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 opacity-30 mx-auto mb-2" />
              <p>No hay notificaciones</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 transition-all ${getNotificationBgClass(notification.tipo)} ${
                    !notification.leida ? "border-l-2 border-l-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      notification.tipo === "error" ? "bg-red-200/50" :
                      notification.tipo === "warning" ? "bg-amber-200/50" :
                      notification.tipo === "success" ? "bg-emerald-200/50" :
                      "bg-blue-200/50"
                    }`}>
                      {getNotificationIcon(notification.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground leading-tight">
                          {notification.titulo}
                        </p>
                        {!notification.leida && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                        {notification.mensaje}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {formatTime(notification.fecha)}
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
            <DropdownMenuSeparator className="m-0" />
            <div className="p-3 bg-muted/30 text-center">
              <Link href="/notificaciones">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-center text-primary hover:text-primary hover:bg-primary/10"
                >
                  Ver todas las notificaciones
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
