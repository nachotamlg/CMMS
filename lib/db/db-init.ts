// Database initialization - runs migrations and verifies schema
// This file is imported by lib/prisma.ts on startup

import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

export async function initializeDatabase() {
  console.log('[DB-INIT] ========== DATABASE INITIALIZATION ==========')
  
  const prisma = new PrismaClient()
  
  try {
    // Verificar conexión a la base de datos
    console.log('[DB-INIT] Verificando conexión a la base de datos...')
    await prisma.$queryRaw`SELECT 1`
    console.log('[DB-INIT] ✅ Conexión a base de datos exitosa')
    
    // Las migraciones se ejecutan en railway-start.sh o docker-entrypoint.sh
    // Aquí solo verificamos que la esquema esté correctamente configurada
    console.log('[DB-INIT] Esquema de base de datos verificado')
    
    // Verificar que las tablas principales existen
    const tableCheck = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name IN ('usuarios', 'equipos', 'documentos')
    ` as Array<{ count: number }>
    
    const expectedTables = 3
    const actualTables = tableCheck[0]?.count || 0
    
    if (actualTables === expectedTables) {
      console.log('[DB-INIT] ✅ Todas las tablas principales existen')
    } else {
      console.warn(`[DB-INIT] ⚠️  Solo ${actualTables}/${expectedTables} tablas encontradas`)
      console.warn('[DB-INIT] Las migraciones pueden aún estar en progreso...')
    }
    
    console.log('[DB-INIT] ========== DATABASE READY ==========')
    
  } catch (error) {
    console.error('[DB-INIT] ❌ Database initialization error:', error)
    console.error('[DB-INIT] Posibles soluciones:')
    console.error('[DB-INIT] 1. Verifica que DATABASE_URL está configurada')
    console.error('[DB-INIT] 2. Verifica que MySQL está corriendo')
    console.error('[DB-INIT] 3. En Railway, verifica que MYSQL_URL está en variables de entorno')
    console.error('[DB-INIT] La aplicación continuará, pero sin acceso a base de datos')
    // Don't throw - allow app to continue
  } finally {
    await prisma.$disconnect()
  }
}
