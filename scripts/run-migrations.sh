#!/bin/bash
# Script para ejecutar migraciones de Prisma
# Se ejecuta al iniciar en Railway

set -e

echo "🔄 [MIGRATIONS] Iniciando proceso de migraciones..."
echo "📊 [MIGRATIONS] Verificando estado de la base de datos..."

# Esperar a que la BD esté disponible (máximo 60 segundos)
for i in {1..60}; do
  if npx prisma db execute --stdin --file /dev/null 2>/dev/null; then
    echo "✅ [MIGRATIONS] Conexión a BD establecida"
    break
  fi
  if [ $i -eq 60 ]; then
    echo "❌ [MIGRATIONS] No se pudo conectar a la BD después de 60 segundos"
    exit 1
  fi
  echo "⏳ [MIGRATIONS] Esperando BD... ($i/60)"
  sleep 1
done

# Ejecutar migraciones
echo "🔧 [MIGRATIONS] Ejecutando migraciones..."
if npx prisma migrate deploy --skip-generate; then
  echo "✅ [MIGRATIONS] Migraciones completadas exitosamente"
else
  echo "⚠️  [MIGRATIONS] Error durante migraciones, intentando db push..."
  if npx prisma db push --skip-generate --accept-data-loss; then
    echo "✅ [MIGRATIONS] Base de datos sincronizada con db push"
  else
    echo "❌ [MIGRATIONS] Error al sincronizar la base de datos"
    exit 1
  fi
fi

# Generar Prisma Client
echo "🔨 [MIGRATIONS] Generando Prisma Client..."
npx prisma generate

echo "✅ [MIGRATIONS] Proceso completado. Iniciando aplicación..."
