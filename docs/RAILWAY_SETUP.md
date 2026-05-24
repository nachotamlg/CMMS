# Configuración de Base de Datos en Railway

## Paso 1: Crear Base de Datos MySQL en Railway

1. Ir a [Railway.app](https://railway.app)
2. Crear nuevo proyecto: `New Project > Database > MySQL`
3. Railway auto-generará `MYSQL_URL` en las variables de entorno

## Paso 2: Variables de Entorno Necesarias

En Railway, configura estas variables:

```env
# Base de Datos (auto-generado por Railway)
MYSQL_URL=mysql://user:password@host:port/cmms_biomedico

# Para Vercel Blob (Almacenamiento de Documentos)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Node Environment
NODE_ENV=production

# Prisma
DATABASE_URL=${MYSQL_URL}
```

## Paso 3: Ejecutar Migraciones

Railway ejecuta automáticamente migraciones en el build:

```bash
# En railway.json o package.json build script
"build": "prisma migrate deploy && next build"
```

O manual vía Railway CLI:

```bash
railway run npx prisma migrate deploy
```

## Paso 4: Script de Inicialización SQL

Si prefieres usar el script SQL directamente:

```bash
# Conexión a MySQL en Railway
mysql -h HOST -u USER -p PASSWORD DATABASE < scripts/init-mysql.sql
```

O usando Railway CLI:

```bash
railway run mysql -h $MYSQL_HOSTNAME -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < scripts/init-mysql.sql
```

## Estructura de Base de Datos Creada

```
┌─────────────────────┐
│      usuarios       │
├─────────────────────┤
│ id, nombre, email   │
│ rol, activo, etc    │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼────────┐ ┌─▼──────────────┐
│  equipos   │ │ órdenes_trabajo│
├────────────┤ ├─────────────────┤
│ id, código │ │ id, numero_orden│
│ nombre,    │ │ estado, etc     │
│ modelo,    │ │                 │
│ ubicación  │ │                 │
└───┬────────┘ └─┬────────────┬──┘
    │           │            │
    │     ┌─────┴────┐       │
    │     │          │       │
    └──┬──┴───┬──────┴───┬───┘
       │      │         │
   ┌───▼──────▼───┐ ┌──▼───────────┐
   │ documentos   │ │mantenimientos│
   ├──────────────┤ └───────────────┘
   │ id, tipo     │
   │ nombre,      │
   │ ruta_archivo │
   │ contenido    │
   └──┬───────────┘
      │
   ┌──▼──────────────────┐
   │auditoria_documentos │
   ├─────────────────────┤
   │ id, documento_id    │
   │ usuario_id, accion  │
   │ created_at          │
   └─────────────────────┘
```

## Tamaños Estimados de Base de Datos

| Tabla | Registros | Tamaño Estimado |
|-------|-----------|-----------------|
| usuarios | 100 | 25 KB |
| equipos | 500 | 500 KB |
| ordenes_trabajo | 5,000 | 2 MB |
| mantenimientos | 2,000 | 800 KB |
| documentos (metadata) | 10,000 | 5 MB |
| auditoria_documentos | 50,000 | 10 MB |
| **TOTAL** | | **~18 MB** |

*Nota: Sin contenido binario (LONGBLOB) en documentos. Si almacenas archivos en BD, multiplica por el tamaño promedio de archivos.*

## Backups en Railway

Railway automáticamente realiza backups. Para configurar:

1. En Railway Dashboard > Database > Backups
2. Configurar frecuencia (diaria recomendada)
3. Railway mantiene 7 días de backups

## Monitoreo y Mantenimiento

### Ver tamaño de base de datos
```sql
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES
WHERE table_schema = 'cmms_biomedico'
ORDER BY (data_length + index_length) DESC;
```

### Limpiar registros antiguos
```sql
-- Eliminar logs de actividad de más de 90 días
DELETE FROM logs_actividad WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Eliminar auditoría de documentos de más de 1 año
DELETE FROM auditoria_documentos WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### Optimizar tablas
```sql
OPTIMIZE TABLE documentos, auditoria_documentos, ordenes_trabajo;
```

## Troubleshooting

### Error: "Access denied for user"
- Verificar `MYSQL_URL` en Railway variables
- Asegurar credenciales correctas

### Error: "Unknown database"
- Ejecutar script init-mysql.sql primero
- O ejecutar `npx prisma migrate deploy`

### Conexión lenta
- Aumentar recursos en Railway (Memory/CPU)
- Verificar índices creados correctamente
- Considerar agregar réplica de lectura

### Disco lleno
- Limpiar documentos antiguos
- Exportar auditoría histórica
- Aumentar tamaño de volumen en Railway

## Plan de Escalado

Para millones de documentos:

```sql
-- Particionar tabla documentos por fecha
ALTER TABLE documentos PARTITION BY RANGE (YEAR(created_at)) (
  PARTITION p2023 VALUES LESS THAN (2024),
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION future VALUES LESS THAN MAXVALUE
);
```

## Conexión desde Aplicación Next.js

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

El `MYSQL_URL` de Railway se mapea automáticamente a `DATABASE_URL` en `.env` para Prisma.
