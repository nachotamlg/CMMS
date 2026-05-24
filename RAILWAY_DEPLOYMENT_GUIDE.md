# Guía de Despliegue en Railway

## Problema Identificado

Las tablas no se creaban automáticamente en Railway durante el primer deploy porque:

1. **No existía una migración inicial de Prisma** - El proyecto tenía migraciones parciales pero no la migración base que crea todas las tablas desde cero.
2. **Las migraciones no se ejecutaban correctamente** - El `nixpacks.toml` tenía comandos con fallback que podían saltarse.
3. **El startup no validaba la BD** - El script `railway-start.sh` no ejecutaba migraciones antes de iniciar.

## Solución Implementada

### 1. Migración Inicial de Prisma ✅
- **Archivo**: `prisma/migrations/0_initial_schema/migration.sql`
- **Descripción**: Crea todas las 11 tablas de la base de datos en el primer deploy
- **Incluye**: Usuarios, Equipos, Órdenes, Mantenimientos, Documentos, Logs, Notificaciones, Auditoría, Configuración

### 2. Configuración de Nixpacks Mejorada ✅
- **Archivo**: `nixpacks.toml`
- **Cambios**: 
  - Ejecuta `prisma migrate deploy` sin fallback
  - Registra todos los pasos en los logs
  - Falla si hay error en migraciones (mejor que silenciar errores)

### 3. Script de Startup Robusto ✅
- **Archivo**: `scripts/railway-start.sh`
- **Características**:
  - Verifica que exista `DATABASE_URL` o `MYSQL_URL`
  - Ejecuta migraciones antes de iniciar
  - Registra cada paso en los logs
  - Fallback a `db push` si `migrate deploy` falla

## Pasos para Desplegar en Railway

### Requisitos Previos
1. Base de datos MySQL en Railway conectada
2. Variable de entorno `MYSQL_URL` configurada en Railway
3. El proyecto está basado en Prisma y Next.js

### Proceso de Deploy

```bash
# 1. Hacer commit de los cambios
git add .
git commit -m "feat: agregar migración inicial de Prisma para Railway"

# 2. Push a tu rama
git push origin main

# 3. En Railway:
#    - El nixpacks.toml ejecutará automáticamente:
#      a) npm ci (instalar dependencias)
#      b) npx prisma generate && npm run build (build)
#      c) npx prisma migrate deploy (crear tablas)
#    - Luego ejecutará: npm run start:railway
```

### Variables de Entorno Requeridas en Railway

```
NODE_ENV = production
PORT = 3000
MYSQL_URL = mysql://user:password@host:port/database
```

## Verificar que Funciona

Después del deploy, verifica en los logs de Railway:

```
✅ [RAILWAY] Migraciones completadas
🎬 [RAILWAY] Iniciando servidor Next.js en puerto 3000
```

Si ves estos mensajes, las tablas se crearon correctamente.

## Troubleshooting

### Si aún así no se crean las tablas:

1. **Verificar logs en Railway**:
   - Ve a tu servicio → Logs
   - Busca `[RAILWAY]` o `[MIGRATIONS]`
   - Anota el error exacto

2. **Verificar MYSQL_URL**:
   ```bash
   # En Railway, ve a Variables y confirma que MYSQL_URL esté configurada
   # Debe ser: mysql://user:password@host:port/database
   ```

3. **Conectar a la BD y verificar**:
   ```sql
   SHOW DATABASES;
   USE tu_database;
   SHOW TABLES;
   ```

4. **Si las tablas no existen pero la BD sí**:
   - Ir a Railway Console
   - Ejecutar:
     ```bash
     npm install
     npx prisma migrate deploy --skip-generate
     ```

### Si hay conflicto entre init-mysql.sql y Prisma:

El archivo `scripts/init-mysql.sql` es **antiguo** y no se usa.
- La nueva source of truth es `prisma/schema.prisma`
- Las migraciones se generan automáticamente desde el schema

Si necesitas modificar la BD:
1. Edita `prisma/schema.prisma`
2. En desarrollo local: `npx prisma migrate dev --name description`
3. En Railway: Los cambios se aplican automáticamente

## Monitoreo Post-Deploy

### Verificar Salud de la BD
```bash
curl https://tu-app.railway.app/api/health
```

Debería retornar `200 OK` si la BD está conectada.

## Notas Importantes

- ✅ Las migraciones son **idempotentes** - puedes ejecutarlas múltiples veces sin problemas
- ✅ El archivo `scripts/init-mysql.sql` es **legacy** y ya no se usa
- ✅ La configuración en `prisma/schema.prisma` es la **source of truth**
- ⚠️ **NUNCA** ejecutes `prisma migrate reset` en producción (borra datos)
- ⚠️ **NUNCA** hagas cambios manuales en la BD sin actualizar `schema.prisma`

## Próximos Pasos

1. Hacer deploy (los cambios se ejecutarán automáticamente)
2. Verificar logs en Railway
3. Si hay errores, revisar la sección Troubleshooting

¡Cualquier duda, revisa los logs de Railway - ellos dirán exactamente qué pasó! 🚀
