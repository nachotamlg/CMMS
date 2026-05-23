// Validation utilities for maintenance schedules

export const FREQUENCY_DAYS_MAP: Record<string, number> = {
  'diaria': 1,
  'semanal': 7,
  'quincenal': 15,
  'mensual': 30,
  'bimensual': 60,
  'trimestral': 90,
  'semestral': 180,
  'anual': 365,
}

export const FREQUENCY_LABELS: Record<string, string> = {
  'diaria': 'Diaria',
  'semanal': 'Semanal',
  'quincenal': 'Quincenal',
  'mensual': 'Mensual',
  'bimensual': 'Bimensual',
  'trimestral': 'Trimestral',
  'semestral': 'Semestral',
  'anual': 'Anual',
}

export function frecuenciaToDias(frecuencia: string): number {
  return FREQUENCY_DAYS_MAP[frecuencia?.toLowerCase()] || 30
}

export function diasToFrecuencia(dias: number): string {
  for (const [freq, d] of Object.entries(FREQUENCY_DAYS_MAP)) {
    if (d === dias) return freq
  }
  return 'mensual'
}

export interface DateValidationResult {
  valid: boolean
  error?: string
  warning?: string
}

/**
 * Validates maintenance dates based on frequency and last maintenance date
 * @param proximaProgramada - Next scheduled maintenance date
 * @param ultimaRealizacion - Last maintenance date (if any)
 * @param frecuenciaDias - Frequency in days
 * @param frecuenciaTexto - Frequency text label (e.g., 'Mensual')
 * @returns Validation result with validity and error/warning messages
 */
export function validateMaintenanceDateRange(
  proximaProgramada: Date,
  ultimaRealizacion: Date | null,
  frecuenciaDias: number,
  frecuenciaTexto: string
): DateValidationResult {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const proximaDate = new Date(proximaProgramada)
  proximaDate.setHours(0, 0, 0, 0)
  
  // Validation 1: Date cannot be in the past (more than 1 day)
  const oneDayAgo = new Date(today)
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)
  
  if (proximaDate < oneDayAgo) {
    return {
      valid: false,
      error: "La fecha de próximo mantenimiento no puede ser una fecha pasada"
    }
  }
  
  // Validation 2: If there's a last maintenance date, next must be at a reasonable distance
  if (ultimaRealizacion) {
    const ultimaDate = new Date(ultimaRealizacion)
    ultimaDate.setHours(0, 0, 0, 0)
    
    const diasDesdeUltima = Math.floor((proximaDate.getTime() - ultimaDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Next date must be at least frecuencia_dias from last maintenance
    if (diasDesdeUltima < frecuenciaDias) {
      return {
        valid: false,
        error: `La próxima fecha debe estar al menos ${frecuenciaDias} días después de la última realización (${frecuenciaTexto}). Actualmente hay ${diasDesdeUltima} días.`
      }
    }
    
    // Should not be more than 30 days after expected
    const maxDias = frecuenciaDias + 30
    if (diasDesdeUltima > maxDias) {
      return {
        valid: false,
        error: `La próxima fecha es demasiado lejana. No debe exceder ${maxDias} días desde la última realización.`
      }
    }
  } else {
    // If no last maintenance, next date should be reasonable (between today and 2 years)
    const daysFromToday = Math.floor((proximaDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const maxDaysFromToday = 730 // 2 years
    
    if (daysFromToday > maxDaysFromToday) {
      return {
        valid: false,
        error: "La fecha de próximo mantenimiento no puede ser más de 2 años en el futuro"
      }
    }

    // Warn if too far in future
    if (daysFromToday > frecuenciaDias * 2) {
      return {
        valid: true,
        warning: `La fecha está más de ${frecuenciaDias * 2} días en el futuro. Para frecuencia ${frecuenciaTexto}, se recomienda ${frecuenciaDias} días desde hoy.`
      }
    }
  }
  
  return { valid: true }
}

/**
 * Calculates the recommended next maintenance date based on last maintenance and frequency
 */
export function calculateRecommendedDate(
  lastMaintenanceDate: Date | null,
  frequencyDays: number
): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (lastMaintenanceDate) {
    const lastDate = new Date(lastMaintenanceDate)
    lastDate.setHours(0, 0, 0, 0)
    const recommendedDate = new Date(lastDate.getTime() + frequencyDays * 24 * 60 * 60 * 1000)
    
    // If recommended date is in the past, return today
    return recommendedDate > today ? recommendedDate : today
  }
  
  // If no last maintenance, recommend from today
  const recommendedDate = new Date(today.getTime() + frequencyDays * 24 * 60 * 60 * 1000)
  return recommendedDate
}

/**
 * Gets maintenance status message based on dates
 */
export function getMaintenanceStatus(
  proximaProgramada: Date,
  overdue: boolean = false
): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const proximaDate = new Date(proximaProgramada)
  proximaDate.setHours(0, 0, 0, 0)
  
  const daysUntil = Math.floor((proximaDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntil < 0) {
    return `Vencido hace ${Math.abs(daysUntil)} días`
  } else if (daysUntil === 0) {
    return 'Vence hoy'
  } else if (daysUntil === 1) {
    return 'Vence mañana'
  } else if (daysUntil <= 7) {
    return `Vence en ${daysUntil} días`
  } else {
    return `Vence en ${Math.ceil(daysUntil / 7)} semanas`
  }
}
