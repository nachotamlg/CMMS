#!/usr/bin/env node

/**
 * Script para generar secretos seguros para Railway
 * Ejecutar: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('\n🔐 Generador de Secretos para Railway\n');
console.log('Copia estos valores a tu archivo .env.local o al dashboard de Railway:\n');

console.log('JWT_SECRET:');
console.log(generateSecret(32));
console.log('');

console.log('NEXTAUTH_SECRET:');
console.log(generateSecret(32));
console.log('');

console.log('✅ Genera nuevos valores cada vez que ejecutes este script');
console.log('⚠️  NUNCA compartas estos secretos\n');
