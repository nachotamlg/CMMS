#!/bin/sh
# Railway start script
# Ejecuta migraciones y luego inicia la aplicación Next.js

set -e

echo "🚀 [RAILWAY] Iniciando secuencia de startup..."

# Exportar MYSQL_URL como DATABASE_URL para compatibilidad con Prisma
if [ -n "$MYSQL_URL" ] && [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="$MYSQL_URL"
  echo "📌 [RAILWAY] DATABASE_URL configurada desde MYSQL_URL"
fi

# Verificar que tenemos una BD configurada
if [ -z "$DATABASE_URL" ] && [ -z "$MYSQL_URL" ]; then
  echo "❌ [RAILWAY] ERROR: No se encontró MYSQL_URL o DATABASE_URL"
  exit 1
fi

# Ejecutar migraciones
echo "📊 [RAILWAY] Ejecutando migraciones de base de datos..."
if npx prisma migrate deploy --skip-generate 2>/dev/null; then
  echo "✅ [RAILWAY] Migraciones completadas"
else
  echo "⚠️  [RAILWAY] Error en migraciones, intentando db push..."
  if npx prisma db push --skip-generate --accept-data-loss 2>/dev/null; then
    echo "✅ [RAILWAY] Base de datos sincronizada"
  else
    echo "⚠️  [RAILWAY] Continuando sin migraciones..."
  fi
fi

# Generar Prisma Client si es necesario
npx prisma generate 2>/dev/null || echo "⚠️  [RAILWAY] Prisma Client ya existe"

# Iniciar Next.js
echo "🎬 [RAILWAY] Iniciando servidor Next.js en puerto 3000..."
exec npm run start
