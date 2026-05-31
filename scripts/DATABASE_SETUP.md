# Configuración de Base de Datos MySQL - CMMS Biomédico

## ⚠️ IMPORTANTE - LEE ESTO PRIMERO

**USA ESTOS ARCHIVOS:**
- ✓ `setup-cmms-database-valid.sql` - Script SQL con contraseñas válidas
- ✓ `setup-database-valid.js` - Script Node.js con contraseñas válidas

**NO USES ESTOS (hashes inválidos):**
- ✗ `setup-cmms-database.sql` - Script antiguo
- ✗ `setup-database.js` - Script antiguo

Las credenciales que funcionan son:
- **admin@cmms.local** / **admin123**
- **supervisor@cmms.local** / **supervisor123**
- **tecnico123** para todos los técnicos

---

## Descripción General

Este conjunto de scripts automatiza la creación y configuración completa de la base de datos MySQL para el sistema CMMS Biomédico, incluyendo:

- Base de datos `cmms_biomedico`
- 10 tablas principales con relaciones y índices
- Usuario dedicado `cmms_user` con permisos específicos
- Datos de ejemplo para pruebas
- Configuraciones iniciales del sistema

## Archivos Incluidos

### 1. `setup-cmms-database.sql`
Script SQL puro que contiene:
- Creación de base de datos
- Definición de todas las tablas
- Creación del usuario MySQL
- Inserts de datos de ejemplo
- Configuraciones iniciales

**Uso directo:**
```bash
# Desde la línea de comandos MySQL
mysql -u root -p < scripts/setup-cmms-database.sql

# O desde MySQL CLI
source /path/to/scripts/setup-cmms-database.sql;
```

### 2. `setup-database.js`
Script Node.js automatizado que:
- Lee y ejecuta el SQL
- Maneja errores gracefully
- Verifica la configuración
- Proporciona retroalimentación visual
- Muestra información de conexión

**Requisitos:**
- Node.js instalado
- Paquete `mysql2` instalado (`npm install mysql2`)
- Variables de entorno configuradas

**Uso:**
```bash
node scripts/setup-database.js
```

## Variables de Entorno Requeridas

Crea un archivo `.env` o configura estas variables:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_root_password
```

Para Railway u otros servicios en la nube, obtén la URL de conexión y extrae:
```env
DB_HOST=<host_from_railway>
DB_PORT=<port_from_railway>
DB_USER=<user_from_railway>
DB_PASSWORD=<password_from_railway>
```

## Tablas Creadas

### 1. **usuarios**
Gestión de usuarios del sistema
```
Campos: id, nombre, email, password, rol, especialidad, activo, etc.
Roles: Técnico, Supervisor, Administrador
Índices: email, rol, activo
```

### 2. **equipos**
Registro de equipos biomédicos
```
Campos: id, numero_serie, nombre_equipo, modelo, ubicación, estado, etc.
Estados: operativo, mantenimiento, en_reparacion, fuera_de_servicio, nuevo
Índices: numero_serie, estado, ubicacion, proximo_mantenimiento
```

### 3. **mantenimientos**
Programación de mantenimientos
```
Campos: id, id_equipo, tipo, frecuencia, resultado, responsable_id, etc.
Tipos: preventivo, correctivo
Frecuencias: diaria, semanal, mensual, trimestral, semestral, anual, unica
Estados: pendiente, en_progreso, completado, rechazado, pausado
```

### 4. **ordenes_trabajo**
Órdenes de trabajo para equipos
```
Campos: id, numero_orden, id_equipo, tipo, estado, prioridad, etc.
Estados: abierta, en_proceso, pausada, completada, cancelada
Prioridades: baja, media, alta, critica
```

### 5. **documentos**
Almacenamiento de documentos asociados
```
Campos: id, tipo, nombre, ruta_archivo, contenido_archivo, tamano, etc.
Tipos: manual, especificaciones, garantia, certificado, otro
```

### 6. **auditoria_documentos**
Auditoría de acceso a documentos
```
Acciones: subida, descarga, visualizacion, eliminacion, restauracion
```

### 7. **logs_actividad**
Registro de todas las actividades del sistema
```
Campos: id_usuario, modulo, accion, tabla_afectada, ip_address, etc.
```

### 8. **notificaciones**
Sistema de notificaciones
```
Tipos: mantenimiento, orden_trabajo, equipo, sistema
```

### 9. **permisos_usuarios**
Control granular de permisos
```
Permisos: gestionEquipos, gestionUsuarios, ordenesTrabajoCrear, etc.
```

### 10. **configuracion**
Configuraciones del sistema
```
Ejemplo: APP_NAME, APP_VERSION, TIMEZONE, MAX_FILE_SIZE, etc.
```

## Usuarios de Prueba - CREDENCIALES VÁLIDAS

Se crean automáticamente 5 usuarios con contraseñas válidas:

| Email | Rol | Contraseña | Permisos |
|-------|-----|-----------|----------|
| admin@cmms.local | Administrador | **admin123** | Todos |
| supervisor@cmms.local | Supervisor | **supervisor123** | Gestión general |
| juan@cmms.local | Técnico | **tecnico123** | Ejecución de órdenes |
| maria@cmms.local | Técnico | **tecnico123** | Ejecución de órdenes |
| carlos@cmms.local | Técnico | **tecnico123** | Ejecución de órdenes |

**Nota:** Las contraseñas están hasheadas con bcrypt en la base de datos y son funcionales para login inmediatamente.

## Usuario de Base de Datos

**Nombre:** `cmms_user`
**Contraseña:** `CmmsSecure2024!#`
**Permisos:** Todos los permisos en base de datos `cmms_biomedico`
**Hosts permitidos:** `%` (cualquiera) y `localhost`

## Pasos de Instalación

### Opción 1: Con Node.js (Recomendado)

```bash
# 1. Instalar dependencias si no están instaladas
npm install mysql2

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con datos de MySQL

# 3. Ejecutar setup
node scripts/setup-database.js
```

### Opción 2: Con MySQL CLI

```bash
# 1. Conectar a MySQL como root
mysql -u root -p

# 2. Ejecutar el script
source scripts/setup-cmms-database.sql;

# 3. Verificar creación
USE cmms_biomedico;
SHOW TABLES;
SELECT COUNT(*) FROM usuarios;
```

### Opción 3: Con MySQL Workbench

1. Abrir MySQL Workbench
2. Conectar al servidor MySQL
3. File → Open SQL Script
4. Seleccionar `setup-cmms-database.sql`
5. Ejecutar (Ctrl + Enter)

### Opción 4: En Railway

1. Conectar el proyecto a Railway
2. Crear base de datos MySQL
3. Copiar la URL de conexión
4. Configurar variables de entorno:
   ```
   DB_HOST=<railway_host>
   DB_PORT=<railway_port>
   DB_USER=<railway_user>
   DB_PASSWORD=<railway_password>
   ```
5. Ejecutar: `node scripts/setup-database.js`

## Verificación Posterior

### Verificar tablas:
```sql
USE cmms_biomedico;
SHOW TABLES;
```

### Verificar usuarios:
```sql
SELECT id, nombre, email, rol FROM usuarios;
```

### Verificar permisos:
```sql
SELECT u.nombre, u.rol, p.* FROM usuarios u 
LEFT JOIN permisos_usuarios p ON u.id = p.id_usuario;
```

### Verificar configuración:
```sql
SELECT * FROM configuracion;
```

## Solución de Problemas

### Error: "Access denied for user"
- Verificar credenciales en `.env`
- Asegurar que MySQL está corriendo
- Verificar que el usuario tiene permisos suficientes

### Error: "Database 'cmms_biomedico' doesn't exist"
- El script crea la BD automaticamente
- Si ocurre, verificar que el usuario root tiene permisos CREATE
- Intentar ejecutar manualmente: `CREATE DATABASE cmms_biomedico;`

### Error: "Table already exists"
- Es normal si se ejecuta el script varias veces
- El script usa `CREATE TABLE IF NOT EXISTS`
- Los datos duplicados se evitan con `INSERT IGNORE`

### Conexión lenta desde Railway
- Verificar que la IP está whitelisted
- Considerar aumentar timeouts en conexión
- Verificar ancho de banda disponible

## Seguridad en Producción

**IMPORTANTE:** Cambiar estos elementos antes de ir a producción:

1. **Contraseñas de usuarios:**
   ```sql
   UPDATE usuarios SET password = '<hash_bcrypt>' WHERE email = 'admin@cmms.local';
   ```

2. **Contraseña del usuario de BD:**
   ```sql
   ALTER USER 'cmms_user'@'%' IDENTIFIED BY '<strong_password>';
   ```

3. **Restringir host del usuario de BD:**
   ```sql
   REVOKE ALL PRIVILEGES ON cmms_biomedico.* FROM 'cmms_user'@'%';
   GRANT ALL PRIVILEGES ON cmms_biomedico.* TO 'cmms_user'@'<app_server_ip>';
   ```

4. **Eliminar datos de prueba:**
   ```sql
   DELETE FROM usuarios WHERE email LIKE '%@cmms.local';
   DELETE FROM permisos_usuarios WHERE id_usuario NOT IN (SELECT id FROM usuarios);
   ```

5. **Backups regulares:**
   ```bash
   mysqldump -u cmms_user -p cmms_biomedico > backup_$(date +%Y%m%d).sql
   ```

## Estructura de Relaciones

```
usuarios
├── permisos_usuarios (1:1)
├── ordenes_trabajo (1:N como creador)
├── ordenes_trabajo (1:N como asignado)
├── mantenimientos (1:N como responsable)
└── documentos (1:N como subido_por)

equipos
├── mantenimientos (1:N)
├── ordenes_trabajo (1:N)
└── documentos (1:N)

ordenes_trabajo
├── documentos (1:N)
└── (relacionado con usuarios)

mantenimientos
└── (relacionado con usuarios y equipos)

documentos
├── auditoria_documentos (1:N)
└── (relacionado con usuarios, equipos, ordenes)

logs_actividad
└── (registra todas las acciones)

notificaciones
└── (notificaciones de usuarios)

configuracion
└── (parámetros globales)
```

## Contacto y Soporte

Para reportar problemas o sugerencias sobre el setup:
- Revisar los logs de salida del script
- Consultar la documentación en Database_Setup.md
- Verificar permisos MySQL del usuario actual

## Versión

- **Versión del Script:** 2.0
- **Compatible con:** MySQL 5.7+, MariaDB 10.3+
- **Último actualizado:** 2024
- **Base de datos:** cmms_biomedico v2.0.0
