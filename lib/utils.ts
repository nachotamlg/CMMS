import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string or Date object to yyyy-MM-dd format for HTML date inputs
 * Handles ISO strings, Date objects, and various date formats
 */
export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return ""
  
  try {
    let dateObj: Date
    
    if (typeof date === "string") {
      // Handle ISO strings or other date strings
      dateObj = new Date(date)
    } else {
      dateObj = date
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return ""
    }
    
    // Format as yyyy-MM-dd
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, "0")
    const day = String(dateObj.getDate()).padStart(2, "0")
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error("[v0] Error formatting date:", date, error)
    return ""
  }
}
