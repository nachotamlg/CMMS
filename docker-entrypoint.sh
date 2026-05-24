#!/bin/sh
set -e

echo "==================================="
echo "🚀 CMMS - Railway Deployment"
echo "==================================="

# Railway proporciona MYSQL_URL, exportarlo como DATABASE_URL para compatibilidad con Prisma
if [ -n "$MYSQL_URL" ] && [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="$MYSQL_URL"
  echo "✅ [RAILWAY] Usando MYSQL_URL como DATABASE_URL"
fi

# Verificar que DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
  echo "❌ [ERROR] DATABASE_URL no está configurada"
  echo "   Por favor, configura MYSQL_URL o DATABASE_URL en Railway"
  exit 1
fi

echo "✅ [RAILWAY] DATABASE_URL configurada correctamente"

# Esperar a que MySQL esté disponible
echo "⏳ [RAILWAY] Esperando a que MySQL esté disponible..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if npx prisma db execute --stdin <<EOF 2>/dev/null
SELECT 1;
EOF
  then
    echo "✅ [RAILWAY] MySQL está disponible"
    break
  fi
  attempt=$((attempt+1))
  echo "⏳ [RAILWAY] Intento $attempt/$max_attempts..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "⚠️  [RAILWAY] No se pudo conectar a MySQL después de $max_attempts intentos"
  echo "   El servidor continuará, pero la BD no estará disponible"
fi

# Ejecutar migraciones de Prisma
echo "📦 [PRISMA] Ejecutando migraciones..."
if npx prisma migrate deploy --skip-generate 2>&1; then
  echo "✅ [PRISMA] Migraciones completadas"
else
  echo "⚠️  [PRISMA] Las migraciones fallaron, intentando db push..."
  if npx prisma db push --skip-generate --accept-data-loss 2>&1; then
    echo "✅ [PRISMA] BD actualizada con db push"
  else
    echo "⚠️  [PRISMA] db push también falló, continuando..."
  fi
fi

# Ejecutar seed si es la primera ejecución o si se configura RUN_SEED=true
if [ "$RUN_SEED" = "true" ] || [ "$FORCE_SEED" = "true" ]; then
  echo "🌱 [SEED] Ejecutando seed de base de datos..."
  if npx tsx prisma/seed.ts 2>&1; then
    echo "✅ [SEED] Seed completado exitosamente"
  else
    echo "⚠️  [SEED] El seed falló, continuando de todas formas..."
  fi
fi

echo "✅ [STARTUP] Configuración completada"
echo "==================================="
echo "📡 Iniciando servidor Next.js en puerto 3000..."
echo "==================================="

# Iniciar la aplicación Next.js
exec node_modules/.bin/next start
