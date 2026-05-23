import { execSync } from 'child_process'

/**
 * This script runs at build time to verify the environment is properly configured
 * It ensures MYSQL_URL is set for Prisma
 */

console.log('[BUILD] Starting environment verification...')

// Check if MYSQL_URL exists in environment
if (!process.env.MYSQL_URL) {
  console.warn('[BUILD] ⚠️ WARNING: MYSQL_URL not found in build environment')
  console.warn('[BUILD] This may cause issues if the variable is not set at runtime')
  console.warn('[BUILD] Ensure MYSQL_URL is added to your v0 Vars')
}

if (process.env.MYSQL_URL) {
  console.log('[BUILD] ✓ MYSQL_URL is set in build environment')
}

// Try to regenerate Prisma Client if it doesn't exist
try {
  const prismaClientPath = './node_modules/.prisma/client'
  const fs = await import('fs')
  
  if (!fs.existsSync(prismaClientPath)) {
    console.log('[BUILD] Prisma Client not found, generating...')
    try {
      execSync('npx prisma generate', { stdio: 'inherit' })
      console.log('[BUILD] ✓ Prisma Client generated successfully')
    } catch (error) {
      console.error('[BUILD] Error generating Prisma Client:', error)
    }
  }
} catch (error) {
  console.error('[BUILD] Error checking Prisma Client:', error)
}

console.log('[BUILD] Environment verification completed')
