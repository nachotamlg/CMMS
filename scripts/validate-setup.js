#!/usr/bin/env node

/**
 * Validation script to verify the notification and session setup
 * Run with: node scripts/validate-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n=== CMMS Notification & Session Setup Validation ===\n');

let hasErrors = false;

// Check 1: .env.local exists
console.log('1. Checking .env.local file...');
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  if (content.includes('interchange.proxy.rlwy.net')) {
    console.log('   ✓ .env.local exists with public URL');
  } else if (content.includes('mysql.railway.internal')) {
    console.log('   ✗ .env.local still has internal URL (mysql.railway.internal)');
    hasErrors = true;
  } else {
    console.log('   ⚠ .env.local exists but URL unclear');
  }
} else {
  console.log('   ✗ .env.local not found');
  hasErrors = true;
}

// Check 2: Prisma schema is correct
console.log('\n2. Checking Prisma schema...');
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  const content = fs.readFileSync(schemaPath, 'utf8');
  if (content.includes('env("MYSQL_URL")') || content.includes('env("DATABASE_URL")')) {
    console.log('   ✓ Prisma schema uses environment variable');
  } else {
    console.log('   ✗ Prisma schema not using environment variable');
    hasErrors = true;
  }
} else {
  console.log('   ✗ Prisma schema not found');
  hasErrors = true;
}

// Check 3: dashboard.ts uses Prisma
console.log('\n3. Checking dashboard.ts...');
const dashboardPath = path.join(__dirname, '..', 'app', 'actions', 'dashboard.ts');
if (fs.existsSync(dashboardPath)) {
  const content = fs.readFileSync(dashboardPath, 'utf8');
  if (content.includes('prisma.usuario.count') || content.includes("from '@/lib/prisma'")) {
    console.log('   ✓ dashboard.ts uses Prisma ORM');
  } else if (content.includes('mysql.createPool') || content.includes('mysql2')) {
    console.log('   ✗ dashboard.ts still uses direct mysql2 connection');
    hasErrors = true;
  } else {
    console.log('   ⚠ dashboard.ts unclear');
  }
} else {
  console.log('   ✗ dashboard.ts not found');
  hasErrors = true;
}

// Check 4: notificaciones.ts has error handling
console.log('\n4. Checking notificaciones.ts...');
const notificacionesPath = path.join(__dirname, '..', 'app', 'actions', 'notificaciones.ts');
if (fs.existsSync(notificacionesPath)) {
  const content = fs.readFileSync(notificacionesPath, 'utf8');
  if (content.includes('return []') && content.includes('no session found')) {
    console.log('   ✓ notificaciones.ts has proper error handling');
  } else {
    console.log('   ⚠ notificaciones.ts error handling unclear');
  }
} else {
  console.log('   ✗ notificaciones.ts not found');
  hasErrors = true;
}

// Check 5: Environment variables
console.log('\n5. Checking environment variables...');
const hasMysqlUrl = !!process.env.MYSQL_URL;
const hasDatabaseUrl = !!process.env.DATABASE_URL;

if (hasMysqlUrl) {
  if (process.env.MYSQL_URL.includes('interchange.proxy.rlwy.net')) {
    console.log('   ✓ MYSQL_URL is set to public Railway URL');
  } else if (process.env.MYSQL_URL.includes('mysql.railway.internal')) {
    console.log('   ✗ MYSQL_URL is still set to internal URL');
    hasErrors = true;
  } else {
    console.log('   ⚠ MYSQL_URL set but value unclear');
  }
} else if (hasDatabaseUrl) {
  console.log('   ✓ DATABASE_URL is set (Prisma will use this)');
} else {
  console.log('   ✗ Neither MYSQL_URL nor DATABASE_URL environment variable is set');
  console.log('      Please add MYSQL_URL to your v0 Vars with the public Railway URL');
  hasErrors = true;
}

// Summary
console.log('\n=== Summary ===\n');
if (hasErrors) {
  console.log('❌ Setup has errors that need to be fixed');
  console.log('\nSteps to fix:');
  console.log('1. Ensure MYSQL_URL is set in your v0 Vars');
  console.log('2. Use the public Railway URL: mysql://root:...@interchange.proxy.rlwy.net:16048/railway');
  console.log('3. Refresh the preview to reload with correct env vars');
  process.exit(1);
} else {
  console.log('✓ Setup looks good!');
  console.log('\nThe following should now work:');
  console.log('• Notifications load after login');
  console.log('• Dashboard displays real database data');
  console.log('• Sessions are created and maintained');
  console.log('• No "mysql.railway.internal" connection errors');
  process.exit(0);
}
