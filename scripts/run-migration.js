#!/usr/bin/env node

/**
 * Script para ejecutar migraciones de Prisma en Railway
 * Más confiable que el comando de línea de comandos
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('\n[MIGRATION] 🚀 Iniciando proceso de migraciones...\n');

// Verificar DATABASE_URL
const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
if (!databaseUrl) {
  console.error('[MIGRATION] ❌ ERROR: DATABASE_URL no configurada');
  process.exit(1);
}

console.log('[MIGRATION] ✓ DATABASE_URL configurada');

// Verificar que existen las migraciones
const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
if (!fs.existsSync(migrationsDir)) {
  console.error('[MIGRATION] ❌ ERROR: Carpeta de migraciones no existe');
  process.exit(1);
}

const migrations = fs.readdirSync(migrationsDir).filter(f => 
  fs.statSync(path.join(migrationsDir, f)).isDirectory()
);

console.log(`[MIGRATION] ✓ Encontradas ${migrations.length} migraciones`);
migrations.forEach(m => console.log(`  - ${m}`));

try {
  console.log('\n[MIGRATION] Generando Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('[MIGRATION] ✓ Prisma Client generado\n');
} catch (error) {
  console.error('[MIGRATION] ⚠️  Error al generar Prisma Client:', error.message);
}

try {
  console.log('[MIGRATION] Ejecutando: npx prisma migrate deploy --skip-generate');
  execSync('npx prisma migrate deploy --skip-generate', { stdio: 'inherit' });
  console.log('[MIGRATION] ✅ Migraciones ejecutadas exitosamente\n');
  process.exit(0);
} catch (error) {
  console.error('[MIGRATION] ⚠️  prisma migrate deploy falló:', error.message);
  console.log('[MIGRATION] Intentando con prisma db push...\n');
  
  try {
    console.log('[MIGRATION] Ejecutando: npx prisma db push --skip-generate --accept-data-loss');
    execSync('npx prisma db push --skip-generate --accept-data-loss', { stdio: 'inherit' });
    console.log('[MIGRATION] ✅ Base de datos sincronizada con db push\n');
    process.exit(0);
  } catch (pushError) {
    console.error('[MIGRATION] ❌ ERROR: Ambos comandos fallaron');
    console.error('Error migrate deploy:', error.message);
    console.error('Error db push:', pushError.message);
    process.exit(1);
  }
}
