'use client'

import React, { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface MonthlyMaintenanceItem {
  id: number
  equipoId: number
  equipo?: string
  tipo: string
  frecuencia: string
  proximaFecha: string | Date
  status?: 'vencido' | 'proximo' | 'completado' | 'programado'
}

interface MonthlyMaintenanceCalendarProps {
  maintenances: MonthlyMaintenanceItem[]
  currentMonth: Date
  onMonthChange: (month: Date) => void
  onDateSelect: (date: Date) => void
  onMaintenanceClick?: (maintenance: MonthlyMaintenanceItem) => void
  disabled?: boolean
}

// Helper function to safely convert date to string
const getDateString = (date: string | Date | undefined | null): string => {
  if (!date) return ""
  if (typeof date === 'string') {
    return date.split('T')[0]
  }
  return new Date(date).toISOString().split('T')[0]
}

// Helper function to determine maintenance status
const getMaintenanceStatus = (proximaFecha: string | Date): 'vencido' | 'proximo' | 'completado' | 'programado' => {
  const dateStr = getDateString(proximaFecha)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maintenanceDate = new Date(dateStr)
  
  const diffTime = maintenanceDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'vencido'
  if (diffDays <= 7) return 'proximo'
  return 'programado'
}

// Get color for badge based on status
const getStatusColor = (status: 'vencido' | 'proximo' | 'programado' | 'completado') => {
  switch (status) {
    case 'vencido':
      return 'bg-red-100 text-red-800'
    case 'proximo':
      return 'bg-yellow-100 text-yellow-800'
    case 'completado':
      return 'bg-green-100 text-green-800'
    case 'programado':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get label for status
const getStatusLabel = (status: 'vencido' | 'proximo' | 'programado' | 'completado') => {
  switch (status) {
    case 'vencido':
      return 'Vencido'
    case 'proximo':
      return 'Próximo (7 días)'
    case 'completado':
      return 'Completado'
    case 'programado':
      return 'Programado'
    default:
      return 'N/A'
  }
}

export function MonthlyMaintenanceCalendar({
  maintenances,
  currentMonth,
  onMonthChange,
  onDateSelect,
  onMaintenanceClick,
  disabled = false,
}: MonthlyMaintenanceCalendarProps) {
  
  // Group maintenances by date
  const maintenancesByDate = useMemo(() => {
    const grouped: Record<string, MonthlyMaintenanceItem[]> = {}
    
    maintenances.forEach((m) => {
      const dateStr = getDateString(m.proximaFecha)
      if (!grouped[dateStr]) {
        grouped[dateStr] = []
      }
      grouped[dateStr].push({
        ...m,
        status: getMaintenanceStatus(m.proximaFecha)
      })
    })
    
    return grouped
  }, [maintenances])

  // Get unique statuses for legend
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>()
    Object.values(maintenancesByDate).forEach(items => {
      items.forEach(item => {
        if (item.status) {
          statuses.add(item.status)
        }
      })
    })
    return Array.from(statuses)
  }, [maintenancesByDate])

  function getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  function getFirstDayOfMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).charAt(0).toUpperCase() + currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).slice(1)
  const days = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    onMonthChange(newDate)
  }

  const handleDayClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onDateSelect(date)
  }

  // Count total scheduled maintenances
  const totalScheduled = Object.values(maintenancesByDate).flat().length

  return (
    <div className="w-full space-y-4 p-4 bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">{monthName}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('prev')}
            disabled={disabled}
            className="p-1"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(new Date())}
            disabled={disabled}
            className="px-3"
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('next')}
            disabled={disabled}
            className="p-1"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-300"></div>
          <span className="text-xs font-medium">Vencido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
          <span className="text-xs font-medium">Próximo (7 días)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-300"></div>
          <span className="text-xs font-medium">Completado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-300"></div>
          <span className="text-xs font-medium">Programado</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dayName) => (
            <div
              key={dayName}
              className="text-center text-sm font-bold text-gray-700 py-3 px-2 border-r border-gray-200 last:border-r-0"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 auto-rows-[minmax(120px,_1fr)]">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="border-r border-b border-gray-200 bg-gray-50 p-2 last:border-r-0"
            />
          ))}

          {/* Days of month */}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
            const dateStr = getDateString(date)
            const dayMaintenances = maintenancesByDate[dateStr] || []
            const isToday = dateStr === getDateString(new Date())

            const isLastColumn = ((firstDay + day) % 7) === 0
            const isLastRow = day > days - 7

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`
                  border-r border-b border-gray-200 p-2 text-left align-top transition-colors hover:bg-blue-50 
                  ${isLastColumn ? 'border-r-0' : ''}
                  ${isLastRow ? 'border-b-0' : ''}
                  ${isToday ? 'bg-blue-100' : 'bg-white'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                disabled={disabled}
              >
                <div className={`text-sm font-bold mb-1 ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                  {day}
                </div>
                
                {/* Maintenances for this day */}
                <div className="space-y-1">
                  {dayMaintenances.slice(0, 2).map((maintenance) => (
                    <div
                      key={maintenance.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onMaintenanceClick?.(maintenance)
                      }}
                      className={`
                        text-xs font-medium px-2 py-1 rounded cursor-pointer truncate
                        ${getStatusColor(maintenance.status || 'programado')}
                        hover:opacity-80 transition-opacity
                      `}
                    >
                      {maintenance.equipo}
                    </div>
                  ))}
                  
                  {/* Show indicator if more than 2 maintenances */}
                  {dayMaintenances.length > 2 && (
                    <div className="text-xs font-medium px-2 py-1 text-gray-600">
                      +{dayMaintenances.length - 2} más
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="text-xs text-gray-600 pt-2">
        Mostrando {totalScheduled} de {totalScheduled} mantenimientos programados
      </div>
    </div>
  )
}
