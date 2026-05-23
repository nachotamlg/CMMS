import { PrismaClient } from '@prisma/client'
import { initializeDatabase } from './db-init'

// Check DATABASE_URL availability
console.log('[PRISMA] Environment check:')
console.log('[PRISMA] - DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Not set')
console.log('[PRISMA] - MYSQL_URL:', process.env.MYSQL_URL ? '✓ Set' : '✗ Not set')

// Get the database URL from environment
const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL

if (!dbUrl) {
  console.error('[PRISMA] ⚠️ WARNING: No database URL environment variable found!')
  console.error('[PRISMA] Please add MYSQL_URL to your Vars in the v0 sidebar')
  console.error('[PRISMA] Full env vars:', Object.keys(process.env).filter(k => 
    k.includes('DATABASE') || k.includes('MYSQL') || k.includes('URL')
  ))
}

// Log which URL is being used
if (dbUrl) {
  console.log('[PRISMA] Using database URL:', dbUrl.substring(0, 30) + '...')
}

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient
  dbInitialized: boolean
  dbInitPromise?: Promise<void>
}

// Initialize Prisma Client
// Prisma 5 reads datasource URL from schema.prisma
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Initialize database tables on first connection
if (!globalForPrisma.dbInitialized && !globalForPrisma.dbInitPromise) {
  console.log('[PRISMA] Starting database initialization...')
  globalForPrisma.dbInitPromise = initializeDatabase()
    .then(() => {
      console.log('[PRISMA] Database initialization completed')
      globalForPrisma.dbInitialized = true
      globalForPrisma.dbInitPromise = undefined
    })
    .catch((error) => {
      console.error('[PRISMA] Failed to initialize database:', error)
      globalForPrisma.dbInitPromise = undefined
    })
}

// Export a function to wait for initialization
export async function waitForDbInit() {
  console.log('[PRISMA] waitForDbInit called, dbInitPromise exists:', !!globalForPrisma.dbInitPromise)
  if (globalForPrisma.dbInitPromise) {
    console.log('[PRISMA] Waiting for database initialization promise...')
    await globalForPrisma.dbInitPromise
    console.log('[PRISMA] Database initialization promise resolved')
  } else {
    console.log('[PRISMA] No initialization promise, database may already be initialized:', globalForPrisma.dbInitialized)
  }
}
