"use server"

import { prisma } from '@/lib/prisma'

export type DashboardStats = {
  usuariosCount: number
  equiposCount: number
  mantenimientosCount: number
  ordenesCount: number
  equiposPorFabricante: Array<{ nombre: string; cantidad: number }>
  mantenimientosPorMes: Array<{ mes: string; cantidad: number }>
}

const mockDashboardStats: DashboardStats = {
  usuariosCount: 0,
  equiposCount: 0,
  mantenimientosCount: 0,
  ordenesCount: 0,
  equiposPorFabricante: [],
  mantenimientosPorMes: (() => {
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    const result = []
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      result.push({
        mes: meses[date.getMonth()],
        cantidad: 0,
      })
    }
    return result
  })(),
}

async function fetchDashboardStatsFromDatabase(): Promise<DashboardStats> {
  try {
    console.log("[v0] Dashboard - fetching stats from database using Prisma...")
    
    // Fetch all data in parallel using Prisma
    const [usuariosCount, equiposCount, mantenimientosCount, ordenesCount, equiposPorMarca, mantenimientosPorMes] = await Promise.all([
      prisma.usuario.count(),
      prisma.equipo.count(),
      prisma.mantenimiento.count(),
      prisma.ordenTrabajo.count(),
      prisma.equipo.groupBy({
        by: ['marca'],
        _count: true,
        where: {
          marca: {
            not: null,
            not: '',
          },
        },
        orderBy: {
          _count: {
            marca: 'desc',
          },
        },
        take: 10,
      }),
      // Get maintenance by month (last 6 months)
      prisma.mantenimiento.findMany({
        where: {
          proxima_programada: {
            gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          proxima_programada: true,
        },
      }),
    ])

    // Process equipment by brand
    const equiposPorFabricante = equiposPorMarca.map((row: any) => ({
      nombre: row.marca || 'Desconocido',
      cantidad: row._count,
    }))

    // Build maintenance by month with all 6 months
    const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    const mantenimientosPorMesMap = new Map<string, number>()

    // Initialize last 6 months
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const mesKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      mantenimientosPorMesMap.set(mesKey, 0)
    }

    // Count maintenance by month
    mantenimientosPorMes.forEach((maint: any) => {
      const date = new Date(maint.proxima_programada)
      const mesKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      mantenimientosPorMesMap.set(mesKey, (mantenimientosPorMesMap.get(mesKey) || 0) + 1)
    })

    // Convert to array
    const mantenimientosPorMesArray: Array<{ mes: string; cantidad: number }> = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const mesKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const mesNombre = mesesNombres[date.getMonth()]
      mantenimientosPorMesArray.push({
        mes: mesNombre,
        cantidad: mantenimientosPorMesMap.get(mesKey) || 0,
      })
    }

    const result = {
      usuariosCount,
      equiposCount,
      mantenimientosCount,
      ordenesCount,
      equiposPorFabricante,
      mantenimientosPorMes: mantenimientosPorMesArray,
    }

    console.log("[v0] Dashboard - stats fetched successfully:", {
      usuariosCount,
      equiposCount,
      mantenimientosCount,
      ordenesCount,
    })

    return result
  } catch (error) {
    console.error("[v0] Error fetching dashboard stats from database:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
    }
    throw error
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    console.log("[v0] Dashboard - fetching stats...")
    const stats = await fetchDashboardStatsFromDatabase()
    console.log("[v0] Dashboard - stats received successfully")
    return stats
  } catch (error) {
    console.error("[v0] Error fetching dashboard stats:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
    }
    console.log("[v0] Returning mock data as fallback")
    return mockDashboardStats
  }
}
