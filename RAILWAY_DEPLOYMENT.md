# Despliegue Automático de Base de Datos en Railway

## 🎯 Resumen Ejecutivo

**La base de datos ahora se crea automáticamente sin pasos manuales.**

El flujo de despliegue ejecuta automáticamente:
1. ✅ Conexión a MySQL
2. ✅ Creación de todas las tablas (via Prisma migrations)
3. ✅ Creación de usuarios de ejemplo (seed)
4. ✅ Inicio de la aplicación

## 📋 Prerequisitos

- Cuenta en [Railway](https://railway.app)
- Código en GitHub (u otro repositorio Git)
- MYSQL_URL o DATABASE_URL configurada en Variables de Railway

## 🚀 Pasos de Despliegue

### Paso 1: Crear Proyecto en Railway

1. Ve a [Railway.app](https://railway.app) e inicia sesión
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza y selecciona tu repositorio

### Paso 2: Agregar Base de Datos MySQL

1. En tu proyecto, haz clic en **"+ New"**
2. Selecciona **"Database" → "Add MySQL"**
3. Espera a que esté lista (ícono verde ✅)

### Paso 3: Configurar Variables de Entorno

Railway crea automáticamente variables de MySQL. Necesitas:

1. Haz clic en tu servicio **Next.js**
2. Ve a pestaña **"Variables"**
3. Agrega:

```bash
# La variable DATABASE_URL se referencia automáticamente desde MySQL
DATABASE_URL=${{MySQL.DATABASE_URL}}

# JWT Secret (genera una clave segura)
JWT_SECRET=tu-clave-segura-de-32-caracteres-minimo

# Opcional: Ejecutar seed automáticamente en primer despliegue
RUN_SEED=false
```

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Paso 4: Realizar el Despliegue

1. Haz **push a GitHub** desde tu rama principal
2. Railway detecta automáticamente el cambio y comienza el build
3. Ve a pestaña **"Deployments"** para ver logs en tiempo real

## ⚙️ Flujo Automático de Despliegue

```
┌─────────────────────────────────────────────────────────┐
│ 1. GitHub Push                                          │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│ 2. Railway Build                                        │
│    └─ npm ci                                            │
│    └─ npm run build:railway                            │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│ 3. docker-entrypoint.sh (NUEVO)                         │
│    ├─ Verifica conexión a MySQL (retry automático) ✓   │
│    ├─ Ejecuta: npx prisma migrate deploy ✓             │
│    ├─ Ejecuta: npm run db:seed (si está vacía) ✓       │
│    └─ Inicia: npm run start ✓                          │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│ 4. Aplicación en Línea                                  │
│    ├─ Accesible en: https://tu-app.railway.app         │
│    ├─ Health check: /api/health                        │
│    └─ Base de datos: LISTA PARA USAR ✓                │
└─────────────────────────────────────────────────────────┘
```

## 📊 Tablas Creadas Automáticamente

**Tablas principales:**
- `usuarios` - Usuarios del sistema (admin + técnico de ejemplo)
- `equipos` - Equipos biomédicos
- `ordenes_trabajo` - Órdenes de mantenimiento
- `documentos` - Documentos/archivos adjuntos (NUEVO)
- `auditoria_documentos` - Auditoría de documentos (NUEVO)

**Tablas de soporte:**
- `mantenimientos` - Registros de mantenimiento
- `logs` - Logs de actividad
- `notificaciones` - Notificaciones del sistema

Todas con índices optimizados y relaciones configuradas automáticamente.

## 👥 Usuarios de Ejemplo Creados Automáticamente

Si el seed se ejecuta (base de datos vacía o `RUN_SEED=true`):

| Rol | Email | Contraseña | Permisos |
|-----|-------|-----------|----------|
| Admin | admin@cmms.com | admin123 | Acceso total |
| Técnico | tecnico@cmms.com | tecnico123 | Gestion de equipos, órdenes |

⚠️ **IMPORTANTE:** Cambia estas contraseñas en producción.

## 📝 Archivos Modificados

### 1. **docker-entrypoint.sh** ← Principal
```bash
#!/bin/sh
# Verifica conexión a MySQL con retry automático
# Ejecuta migraciones de Prisma
# Ejecuta seed (opcional)
# Inicia Next.js
```

### 2. **scripts/railway-start.sh** ← Delegador
```bash
#!/bin/sh
# Configura variables de entorno
# Llama a docker-entrypoint.sh
```

### 3. **lib/db/db-init.ts** ← Verificación
```ts
// Verifica que la conexión funciona
// Valida que tablas existen
// Proporciona diagnóstico en caso de error
```

## 🔍 Monitorear el Despliegue

### Ver logs en tiempo real:
1. Railway Dashboard → Tu proyecto
2. Pestaña **"Deployments"**
3. Haz clic en el despliegue actual → **"View Logs"**

### Logs esperados (éxito):
```
===================================
🚀 CMMS - Railway Deployment
===================================
✅ [RAILWAY] Usando MYSQL_URL como DATABASE_URL
✅ [RAILWAY] MySQL está disponible
📦 [PRISMA] Ejecutando migraciones...
✅ [PRISMA] Migraciones completadas
🌱 [SEED] Ejecutando seed de base de datos...
✅ [SEED] Seed completado exitosamente
📡 Iniciando servidor Next.js en puerto 3000...
===================================
```

## ✅ Verificar que Funciona

1. Una vez completado el despliegue, accede a tu URL
2. Ve a `/api/health`
3. Deberías ver:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-12-20T..."
}
```

## 🔧 Troubleshooting

### Error: "DATABASE_URL is not set"
**Solución:**
- Railway → Variables → Verifica que `MYSQL_URL` está visible
- Si no aparece, re-agrega la relación entre Next.js y MySQL

### Las tablas no se crean
**Causa:** `docker-entrypoint.sh` no tiene permisos de ejecución

**Solución:**
```bash
chmod +x docker-entrypoint.sh
git add docker-entrypoint.sh
git commit -m "Fix: executable permissions"
git push
```

### Base de datos vacía (sin usuarios)
**Causa:** Seed no se ejecutó (es opcional por defecto)

**Solución:**
```bash
# Opción 1: Ejecutar seed manualmente
railway run npm run db:seed

# Opción 2: Forzar seed en siguiente despliegue
# Railway → Variables → RUN_SEED = true → Nuevo despliegue
```

### Error: "Could not connect to MySQL"
**Causas posibles:**
- MySQL aún está iniciándose
- Variables de entorno incorrectas
- Railway MySQL no está en estado "Up"

**Solución:**
- Espera 1-2 minutos y realiza otro despliegue
- Verifica que Railway MySQL tiene ícono verde ✅
- Copia `MYSQL_URL` desde Railway UI directamente

## 🔄 Flujo de Actualizaciones

Railway redespliega automáticamente cuando:
- Haces push a la rama conectada
- Cambias variables de entorno
- Actualizas la configuración del servicio

Las nuevas migraciones se ejecutan automáticamente (Prisma es inteligente).

## 📚 Comandos Útiles

### Acceder a la base de datos manualmente:
```bash
# 1. Login a Railway CLI
railway login

# 2. Vincula tu proyecto
railway link

# 3. Conecta a MySQL
railway run mysql -h $MYSQL_HOSTNAME -u $MYSQL_USER -p$MYSQL_PASSWORD

# 4. Ver datos
SELECT * FROM usuarios;
```

### Ejecutar seed manualmente:
```bash
railway run npm run db:seed
```

### Resetear base de datos:
```bash
railway run mysql -h $MYSQL_HOSTNAME -u $MYSQL_USER -p$MYSQL_PASSWORD
# DROP DATABASE railway;
# CREATE DATABASE railway;
```

## 💰 Costos

- Railway: $5 USD crédito gratis/mes
- Después: $5/mes por servicio (hobby plan)
- Ver precios: [railway.app/pricing](https://railway.app/pricing)

## 📖 Referencias Útiles

- [Railway Docs](https://docs.railway.app)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Railway MySQL](https://docs.railway.app/databases/mysql)
- [Docker Entrypoint Best Practices](https://docs.docker.com/engine/reference/builder/#entrypoint)
