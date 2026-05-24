#!/bin/sh
# Railway start script
# Las migraciones se ejecutan en nixpacks.toml durante el build
# Este script solo inicia la aplicación Next.js

set -e

echo "🚀 [RAILWAY] Iniciando aplicación Next.js..."

# Exportar MYSQL_URL como DATABASE_URL para compatibilidad con Prisma
if [ -n "$MYSQL_URL" ] && [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="$MYSQL_URL"
fi

# Iniciar Next.js
echo "📡 Servidor escuchando en puerto 3000..."
exec npm run start
