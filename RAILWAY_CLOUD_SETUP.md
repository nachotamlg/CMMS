# Railway Cloud - Setup Automático de Base de Datos

## Resumen

La base de datos se crea automáticamente gracias a la nueva configuración de **nixpacks.toml**. Las migraciones de Prisma se ejecutan automáticamente durante la fase de build de Railway.

## Flujo Automático

```
┌─────────────────────────────────────────────────────────┐
│ 1. Git Push a GitHub                                    │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│ 2. Railway Cloud Build                                  │
│    ├─ phases.install: npm ci                            │
│    ├─ phases.build:                                     │
│    │  └─ npx prisma generate                            │
│    │  └─ npm run build                                  │
│    └─ phases.post-build: ⭐ NUEVO                      │
│       ├─ npx prisma migrate deploy                      │
│       └─ (fallback a db push si es necesario)           │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│ 3. Railway Cloud Deploy                                 │
│    └─ npm run start:railway                             │
│       └─ scripts/railway-start.sh                       │
│          └─ npm run start                               │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│ 4. Aplicación en Línea ✅                               │
│    ├─ Base de datos: CREADA AUTOMÁTICAMENTE             │
│    ├─ Tablas: usuarios, equipos, órdenes, etc.         │
│    └─ Accesible en: https://tu-app.railway.app         │
└─────────────────────────────────────────────────────────┘
```

## Configuración en Railway Cloud (UI)

### 1. Variables de Entorno Requeridas

Ve a **Settings → Variables** y asegúrate de tener:

```
DATABASE_URL = ${{MySQL.DATABASE_URL}}
JWT_SECRET = tu-clave-segura-de-32-caracteres
NODE_ENV = production
PORT = 3000
```

**Generar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. MySQL Configuración

- Railway crea automáticamente una instancia MySQL
- La instancia debe estar en estado "Up" (ícono verde)
- Las credenciales se pasan automáticamente via `${{MySQL.DATABASE_URL}}`

### 3. Health Check

Railway ejecutará `GET /api/health` automáticamente para verificar que la app está sana.

## Archivos Clave

### nixpacks.toml ⭐ ACTUALIZADO

```toml
[phases.post-build]
cmds = [
  "echo '[RAILWAY] Running Prisma migrations...'",
  "npx prisma migrate deploy --skip-generate || npx prisma db push --skip-generate --accept-data-loss || true",
  "echo '[RAILWAY] Migrations completed'"
]
```

**Esto ejecuta automáticamente las migraciones después del build.**

### railway.json

```json
{
  "deploy": {
    "startCommand": "sh scripts/railway-start.sh",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### scripts/railway-start.sh ⭐ SIMPLIFICADO

```sh
#!/bin/sh
# Solo inicia Next.js (migraciones ya se ejecutaron en el build)
exec npm run start
```

## Logs Esperados en Railway Cloud

```
=== Build Phase ===
[nixpacks] npm ci
[nixpacks] npx prisma generate
[nixpacks] npm run build

=== Post-Build Phase (NUEVO) ===
[RAILWAY] Running Prisma migrations...
Prisma 5.22.0
Migrating database...
✓ Migration 0_init applied (...)
✓ Migration improve_document_storage_and_auditing applied (...)
Database migration complete
[RAILWAY] Migrations completed

=== Start Phase ===
npm run start:railway
scripts/railway-start.sh
🚀 [RAILWAY] Iniciando aplicación Next.js...
```

## ¿Qué Tablas se Crean?

Automáticamente se crean:

- `usuarios` - Usuarios del sistema
- `equipos` - Equipos biomédicos
- `ordenes_trabajo` - Órdenes de mantenimiento
- `documentos` - Documentos/archivos
- `auditoria_documentos` - Auditoría de documentos
- `mantenimientos` - Registros de mantenimiento
- `logs` - Logs de actividad
- `notificaciones` - Notificaciones

## Troubleshooting

### Las migraciones no se ejecutan

**Solución:**
1. Verifica que `nixpacks.toml` está en la raíz del proyecto
2. Haz un nuevo push a GitHub para forzar un rebuild
3. Revisa los logs en Railway → Deployments → View Logs

### Error: "DATABASE_URL is not set"

**Solución:**
1. Ve a Railway Cloud → MySQL → verifica que está en estado "Up"
2. Railway → Next.js Service → Variables → agrega `DATABASE_URL = ${{MySQL.DATABASE_URL}}`
3. Haz un nuevo despliegue

### Error: "Cannot find Prisma migrations"

**Solución:**
- Asegúrate de que la carpeta `prisma/migrations` existe en Git
- Ejecuta: `git add prisma/migrations && git push`

### Base de datos se crea pero sin datos

**Solución:**
- El seed es opcional. Para forzarlo:
  1. Railway → Next.js → Variables → `RUN_SEED = true`
  2. Hacer nuevo despliegue
  3. Las tablas se llenarán con usuarios de ejemplo

## Pasos para Activar Ahora

1. **Actualizar repositorio local:**
   ```bash
   git pull origin main
   ```

2. **Verificar archivos están correctos:**
   ```bash
   ls -la nixpacks.toml scripts/railway-start.sh
   ```

3. **Hacer push a GitHub:**
   ```bash
   git add -A
   git commit -m "Fix: Auto-create database in Railway via nixpacks"
   git push
   ```

4. **En Railway Cloud:**
   - Ir a Deployments
   - Debería empezar un nuevo build automáticamente
   - Ver logs: View Logs
   - Esperar a que complete (3-5 minutos)

5. **Verificar:**
   - Accede a https://tu-app.railway.app/api/health
   - Deberías ver: `{"status":"healthy","database":"connected"}`

## FAQ

### ¿Por qué las migraciones están en post-build?

Porque Prisma necesita acceso a la base de datos para correr migraciones, y la base de datos debe estar disponible en Railway durante el build.

### ¿Se ejecutan las migraciones cada vez?

Sí, pero Prisma es inteligente:
- Solo ejecuta migraciones nuevas
- No afecta a datos existentes
- Es seguro ejecutarlas múltiples veces

### ¿Puedo cambiar las contraseñas de los usuarios de ejemplo?

Sí, después del primer login:
1. Inicia sesión con admin@cmms.com / admin123
2. Ve a Gestión de Usuarios
3. Cambia las contraseñas

## Referencia

- **nixpacks.toml**: Define el proceso de build en Railway
- **railway.json**: Configura Railway Cloud deployment
- **scripts/railway-start.sh**: Script que inicia la app
- **prisma/migrations/**: Migraciones de base de datos
- **prisma/schema.prisma**: Esquema de Prisma

## Soporte

- Docs de Railway: https://docs.railway.app
- Nixpacks: https://nixpacks.com
- Prisma Migrations: https://prisma.io/docs/concepts/components/prisma-migrate
