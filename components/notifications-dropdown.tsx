"use client"

import { useEffect, useState } from "react"
import { Bell, AlertCircle, Wrench, Clock, User, Check, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import useSWR from "swr"

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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function getNotificationIcon(tipo: string) {
  switch (tipo) {
    case 'mantenimiento_vencido':
      return <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
    case 'mantenimiento_proximo':
      return <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
    case 'mantenimiento_sin_asignar':
      return <User className="h-4 w-4 text-blue-500 flex-shrink-0" />
    case 'mantenimiento':
      return <Wrench className="h-4 w-4 text-purple-500 flex-shrink-0" />
    default:
      return <Bell className="h-4 w-4 text-gray-500 flex-shrink-0" />
  }
}

function getNotificationBadgeColor(tipo: string) {
  switch (tipo) {
    case 'mantenimiento_vencido':
      return 'bg-red-100 text-red-800'
    case 'mantenimiento_proximo':
      return 'bg-yellow-100 text-yellow-800'
    case 'mantenimiento_sin_asignar':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function NotificationsDropdown() {
  const { data = [], error, isLoading, mutate } = useSWR<Notification[]>('/api/notificaciones', fetcher, {
    refreshInterval: 15000,
  })

  const unreadCount = data?.filter((n) => !n.leida).length || 0

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notificaciones/marcar-todas-leidas', {
        method: 'POST',
        credentials: 'include',
      })
      if (response.ok) {
        mutate()
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/notificaciones/${notificationId}/marcar-leido`, {
        method: 'POST',
        credentials: 'include',
      })
      if (response.ok) {
        mutate()
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/notificaciones/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (response.ok) {
        mutate()
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-6 px-2 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Cargando...</div>
        ) : error ? (
          <div className="py-6 text-center text-sm text-red-500">Error al cargar notificaciones</div>
        ) : data.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">No hay notificaciones</div>
        ) : (
          data.slice(0, 5).map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 cursor-default hover:bg-muted transition-colors group">
              <div className="flex items-start gap-3 w-full">
                <div className="flex gap-2 items-start pt-0.5">
                  {getNotificationIcon(notification.tipo)}
                  {!notification.leida && <div className="h-2 w-2 rounded-full bg-primary mt-0.5 flex-shrink-0" />}
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium leading-none">{notification.titulo}</p>
                    <Badge variant="secondary" className={`text-xs ${getNotificationBadgeColor(notification.tipo)}`}>
                      {notification.tipo.replace(/mantenimiento_/, '').replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground break-words">{notification.mensaje}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.fecha_envio).toLocaleDateString()} {new Date(notification.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {!notification.leida && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleMarkAsRead(e, notification.id)}
                      className="h-6 w-6 p-0"
                      title="Marcar como leído"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteNotification(e, notification.id)}
                    className="h-6 w-6 p-0"
                    title="Eliminar"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-center cursor-pointer">
          Ver todas las notificaciones
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
