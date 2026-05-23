#!/usr/bin/env node

/**
 * Startup verification script
 * Ensures the correct database URL is being used before starting the app
 */

const path = require('path');
const fs = require('fs');

console.log('[STARTUP] Environment verification starting...\n');

const envVars = {
  MYSQL_URL: process.env.MYSQL_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET ? '***SET***' : '***NOT SET***'
};

console.log('[STARTUP] Current environment variables:');
Object.entries(envVars).forEach(([key, value]) => {
  if (value && typeof value === 'string' && value.includes('@')) {
    // Mask passwords in URLs
    const masked = value.substring(0, 20) + '...' + value.substring(value.length - 15);
    console.log(`[STARTUP]   ${key}: ${masked}`);
  } else {
    console.log(`[STARTUP]   ${key}: ${value}`);
  }
});

// Verify .env.local exists and is correct
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  console.log('\n[STARTUP] .env.local exists ✓');
  if (content.includes('interchange.proxy.rlwy.net')) {
    console.log('[STARTUP] .env.local has correct public URL ✓');
  } else if (content.includes('mysql.railway.internal')) {
    console.log('[STARTUP] ⚠️  .env.local has INTERNAL URL (will fail from v0)');
  }
} else {
  console.log('\n[STARTUP] ⚠️  .env.local does not exist');
}

// Check if using correct database URL
const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  console.log('\n[STARTUP] ⚠️  WARNING: No database URL found in environment!');
  console.log('[STARTUP] Please add MYSQL_URL to your v0 Vars in the sidebar');
} else if (dbUrl.includes('mysql.railway.internal')) {
  console.log('\n[STARTUP] ✗ ERROR: Using internal Railway URL!');
  console.log('[STARTUP] This will NOT work from v0 Sandbox');
  console.log('[STARTUP] Please use the public URL: mysql://...@interchange.proxy.rlwy.net:...');
} else if (dbUrl.includes('interchange.proxy.rlwy.net')) {
  console.log('\n[STARTUP] ✓ Using correct public Railway URL');
} else {
  console.log('\n[STARTUP] ? Using alternative database URL');
  console.log('[STARTUP]   URL: ' + dbUrl.substring(0, 50) + '...');
}

console.log('[STARTUP] Environment verification completed\n');
