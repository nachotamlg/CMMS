#!/bin/sh
# Railway start script - delegador al docker-entrypoint.sh
# Este script es mantenido para compatibilidad
# El flujo principal está en docker-entrypoint.sh

set -e

echo "🚀 [RAILWAY] Iniciando despliegue en Railway..."

# Verificar que DATABASE_URL está configurada
if [ -z "$MYSQL_URL" ] && [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: MYSQL_URL o DATABASE_URL no está configurada"
  exit 1
fi

# Exportar MYSQL_URL como DATABASE_URL para compatibilidad con Prisma
if [ -n "$MYSQL_URL" ]; then
  export DATABASE_URL="$MYSQL_URL"
fi

echo "✅ Variables de entorno configuradas"
echo "📡 Ejecutando docker-entrypoint.sh..."

# Ejecutar el entrypoint principal
exec sh /app/docker-entrypoint.sh
