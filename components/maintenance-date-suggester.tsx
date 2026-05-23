'use client'

import React, { useEffect, useState } from 'react'
import { Zap, Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export interface DateSuggestion {
  date: Date
  score: number
  reason: string
}

interface MaintenanceDateSuggesterProps {
  equipoId: number
  currentDate?: string
  onDateSelect: (date: string) => void
  loading?: boolean
  frecuencia?: string // 'diaria', 'semanal', 'mensual', etc.
  ultimaRealizacion?: string // última fecha de realización
}

// Helper function to convert frecuencia text to days
function frecuenciaToDias(frecuencia?: string): number {
  if (!frecuencia) return 30 // default
  
  const frecuenciaMap: Record<string, number> = {
    'diaria': 1,
    'semanal': 7,
    'quincenal': 15,
    'mensual': 30,
    'bimensual': 60,
    'trimestral': 90,
    'semestral': 180,
    'anual': 365,
  }
  return frecuenciaMap[frecuencia?.toLowerCase()] || 30
}

export function MaintenanceDateSuggester({
  equipoId,
  currentDate,
  onDateSelect,
  loading = false,
  frecuencia,
  ultimaRealizacion,
}: MaintenanceDateSuggesterProps) {
  const [suggestions, setSuggestions] = useState<DateSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadSuggestions = async () => {
      setIsLoading(true)
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const frecuenciaDias = frecuenciaToDias(frecuencia)
        const mockSuggestions: DateSuggestion[] = []

        // Calculate base date based on last maintenance
        let baseDate = new Date(today)
        if (ultimaRealizacion) {
          const lastDate = new Date(ultimaRealizacion)
          lastDate.setHours(0, 0, 0, 0)
          baseDate = new Date(lastDate.getTime() + frecuenciaDias * 24 * 60 * 60 * 1000)
        } else {
          // If no last maintenance, suggest starting from today
          baseDate = new Date(today.getTime() + frecuenciaDias * 24 * 60 * 60 * 1000)
        }

        // Generate 5 suggestions based on frequency
        for (let i = 0; i < 5; i++) {
          const suggestedDate = new Date(baseDate.getTime() + i * frecuenciaDias * 24 * 60 * 60 * 1000)
          
          // Calculate score based on how well it matches the frequency pattern
          let score = 100
          
          // Penalize if date is in the past
          if (suggestedDate < today) {
            score -= 30
          }
          
          // The first suggestion gets the highest score
          if (i === 0) {
            score = Math.max(score, 95)
          } else {
            score = Math.max(score, 85 - i * 5)
          }

          mockSuggestions.push({
            date: suggestedDate,
            score,
            reason: i === 0 
              ? `Recomendado por frecuencia (${frecuencia || 'mensual'})` 
              : `+${frecuenciaDias * i} días desde recomendado`,
          })
        }

        setSuggestions(mockSuggestions)
      } finally {
        setIsLoading(false)
      }
    }

    if (equipoId) {
      loadSuggestions()
    }
  }, [equipoId, frecuencia, ultimaRealizacion])

  const handleSelectDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    onDateSelect(dateStr)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-orange-50 border-orange-200'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (score >= 60) return <Calendar className="h-4 w-4 text-yellow-600" />
    return <AlertCircle className="h-4 w-4 text-orange-600" />
  }

  if (isLoading || loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-blue-600" />
        <p className="text-sm font-medium text-gray-700">Fechas Recomendadas</p>
      </div>

      {suggestions.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-4">No hay sugerencias disponibles</p>
      ) : (
        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.date.getTime()}
              onClick={() => handleSelectDate(suggestion.date)}
              className={`
                w-full p-3 rounded-lg border-2 transition-all text-left
                ${getScoreColor(suggestion.score)}
                hover:shadow-md hover:-translate-y-0.5
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {suggestion.date.toLocaleDateString('es-ES', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{suggestion.reason}</p>
                </div>
                <div className="flex items-center gap-2 flex-col">
                  {getScoreIcon(suggestion.score)}
                  <span className="text-xs font-bold text-gray-700">{suggestion.score}%</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
