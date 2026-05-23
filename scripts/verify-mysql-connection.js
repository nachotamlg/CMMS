#!/usr/bin/env node

/**
 * Script para verificar la conexión a MySQL en Railway
 * Ejecutar: node scripts/verify-mysql-connection.js
 */

const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function verifyConnection() {
  console.log('\n🔍 Verificando Conexión a MySQL\n');
  
  const mysqlUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
  
  if (!mysqlUrl) {
    console.error('❌ ERROR: MYSQL_URL o DATABASE_URL no está configurado');
    console.log('\nAsegúrate de que .env.local tenga:');
    console.log('  MYSQL_URL=mysql://root:password@host:port/database');
    process.exit(1);
  }
  
  console.log('✓ Variable de entorno encontrada');
  console.log(`  URL (sin credenciales): mysql://root:***@${mysqlUrl.split('@')[1]}`);
  console.log('');
  
  try {
    console.log('⏳ Intentando conectar a MySQL...');
    
    // Intentar conexión simple con Prisma
    execSync('npx prisma db execute --stdin <<< "SELECT 1 as connection_test;"', {
      stdio: 'inherit',
      env: { ...process.env, MYSQL_URL: mysqlUrl }
    });
    
    console.log('✅ Conexión a MySQL exitosa\n');
    
    // Verificar tablas
    console.log('📋 Tablas en la base de datos:');
    try {
      execSync(
        `npx prisma db execute --stdin <<< "SELECT table_name FROM information_schema.tables WHERE table_schema = 'railway' ORDER BY table_name;"`,
        {
          stdio: 'inherit',
          env: { ...process.env, MYSQL_URL: mysqlUrl }
        }
      );
    } catch (e) {
      console.log('⚠️  No se pudo listar las tablas');
    }
    
    console.log('\n✅ Verificación completada exitosamente\n');
    
  } catch (error) {
    console.error('❌ ERROR: No se pudo conectar a MySQL');
    console.error('\nVerifica:');
    console.error('  1. La URL de conexión es correcta');
    console.error('  2. MySQL está running (en Railway debe tener un ícono verde)');
    console.error('  3. Las credenciales son válidas');
    console.error('  4. El host es accesible desde esta red');
    console.error('\nSi estás en Railway, asegúrate que:');
    console.error('  - El servicio MySQL esté en el mismo proyecto');
    console.error('  - Las variables de entorno estén configuradas');
    console.error('  - Espera 30 segundos después de crear MySQL\n');
    process.exit(1);
  }
}

verifyConnection();
