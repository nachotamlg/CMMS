#!/bin/bash

# This script verifies that the database connection is working
# Run: npx tsx scripts/test-db-connection.ts

echo "[TEST-DB] Starting database connection test..."
echo "[TEST-DB] Checking environment variables..."

# Check if MYSQL_URL is set
if [ -z "$MYSQL_URL" ]; then
  echo "[TEST-DB] ❌ MYSQL_URL is not set!"
  echo "[TEST-DB] Please ensure MYSQL_URL is added to your v0 Vars"
  exit 1
fi

echo "[TEST-DB] ✓ MYSQL_URL is set"
echo "[TEST-DB] URL: ${MYSQL_URL:0:50}..."

# Run the actual test
npx tsx << 'EOF'
import mysql from 'mysql2/promise'

async function testConnection() {
  try {
    console.log('[TEST-DB] Attempting to connect to MySQL...')
    
    const pool = mysql.createPool({
      uri: process.env.MYSQL_URL || '',
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    })

    const connection = await pool.getConnection()
    console.log('[TEST-DB] ✓ Successfully connected to MySQL database!')
    
    // Test if we can query
    const [result] = await connection.query('SELECT 1 as test')
    console.log('[TEST-DB] ✓ Query test successful:', result)
    
    await connection.release()
    await pool.end()
    
    console.log('[TEST-DB] Connection test completed successfully')
  } catch (error: any) {
    console.error('[TEST-DB] ❌ Connection failed:', error.message)
    console.error('[TEST-DB] Error details:', error)
    process.exit(1)
  }
}

testConnection()
EOF
