#!/bin/bash
set -e

echo "🚀 Starting Railway deployment with MySQL..."

# Verificar que MYSQL_URL esté configurada
if [ -z "$MYSQL_URL" ] && [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: MYSQL_URL o DATABASE_URL no está configurada"
  exit 1
fi

# Usar MYSQL_URL si está disponible, si no usar DATABASE_URL
DB_URL="${MYSQL_URL:-$DATABASE_URL}"
echo "✅ Base de datos configurada: ${DB_URL:0:50}..."

# Exportar la variable para Prisma
export MYSQL_URL="$DB_URL"
export DATABASE_URL="$DB_URL"

# Generar cliente Prisma con los targets correctos para Railway
echo "⚙️  Generando cliente Prisma con targets para Railway..."
rm -rf /app/.prisma 2>/dev/null || true
rm -rf node_modules/.prisma 2>/dev/null || true
npx prisma generate
echo "✅ Cliente Prisma generado con éxito"

# Esperar a que MySQL esté disponible
echo "⏳ Esperando conexión a MySQL..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if npx prisma db execute --stdin <<< "SELECT 1;" 2>/dev/null; then
    echo "✅ MySQL está disponible"
    break
  fi
  attempt=$((attempt+1))
  echo "⏳ Intento $attempt/$max_attempts..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ ERROR: No se pudo conectar a MySQL después de $max_attempts intentos"
  exit 1
fi

# Crear/actualizar todas las tablas automáticamente
echo "📦 Ejecutando migraciones de Prisma..."
npx prisma migrate deploy --accept-data-loss 2>/dev/null || \
  npx prisma db push --accept-data-loss --skip-generate

echo "✅ Migraciones completadas"

# Verificar si la tabla usuarios existe y tiene datos
echo "🔍 Verificando estado de la base de datos..."
TABLE_EXISTS=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'railway' AND table_name = 'usuarios';" 2>/dev/null | tail -1 || echo "0")

if [ "$TABLE_EXISTS" != "0" ]; then
  # Contar usuarios
  USUARIO_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM usuarios;" 2>/dev/null | tail -1 || echo "0")
  
  if [ "$USUARIO_COUNT" -eq "0" ] || [ "$RUN_SEED" = "true" ]; then
    echo "🌱 Base de datos vacía, ejecutando seed..."
    npm run db:seed || echo "⚠️  Seed falló, continuando de todas formas..."
  else
    echo "✅ Base de datos ya contiene datos ($USUARIO_COUNT usuarios)"
  fi
else
  echo "✅ Tablas serán creadas por Prisma"
fi

echo "🎉 Deployment completado, iniciando servidor Next.js..."
echo "📡 Servidor escuchando en puerto 3000"
npm run start
