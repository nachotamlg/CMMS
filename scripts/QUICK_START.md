# CMMS - Guía Rápida de Setup

## El Problema

Las contraseñas `admin@cmms.local / admin123` no funcionaban porque los scripts iniciales tenían hashes de bcrypt inválidos.

## La Solución

Se crearon nuevos scripts con contraseñas correctamente hasheadas y funcionales.

---

## Opción 1: Node.js (Recomendado - Más Rápido)

```bash
# 1. Instalar dependencia
npm install mysql2

# 2. Configurar (opcional - si no está en localhost)
# Edita las variables de entorno en scripts/setup-database-valid.js
# O configura estas variables de entorno:
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=tu_contraseña_root

# 3. Ejecutar setup
node scripts/setup-database-valid.js
```

**Resultado:**
- ✓ Base de datos `cmms_biomedico` creada
- ✓ Tablas creadas
- ✓ Usuarios con contraseñas válidas insertados
- ✓ Permisos configurados

---

## Opción 2: MySQL CLI Directo (Si prefieres SQL puro)

```bash
mysql -u root -p < scripts/setup-cmms-database-valid.sql
```

O interactivamente:
```bash
mysql -u root -p
mysql> source /path/to/scripts/setup-cmms-database-valid.sql;
```

---

## Credenciales de Acceso

### Para la Base de Datos (MySQL)
```
Usuario: cmms_user
Contraseña: CmmsSecure2024!#
Base de datos: cmms_biomedico
```

### Para la Aplicación (Usuarios Válidos)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@cmms.local | admin123 | Administrador |
| supervisor@cmms.local | supervisor123 | Supervisor |
| juan@cmms.local | tecnico123 | Técnico |
| maria@cmms.local | tecnico123 | Técnico |
| carlos@cmms.local | tecnico123 | Técnico |

---

## Verificar que Funcionó

```bash
# Conectar a MySQL
mysql -u cmms_user -p -h localhost cmms_biomedico

# Dentro de MySQL, ejecutar:
SELECT email, rol FROM usuarios;
```

Deberías ver:
```
+------------------------+----------------+
| email                  | rol            |
+------------------------+----------------+
| admin@cmms.local       | Administrador  |
| supervisor@cmms.local  | Supervisor     |
| juan@cmms.local        | Técnico        |
| maria@cmms.local       | Técnico        |
| carlos@cmms.local      | Técnico        |
+------------------------+----------------+
```

---

## Integración con tu Aplicación

### Para Node.js / Express

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'cmms_user',
  password: 'CmmsSecure2024!#',
  database: 'cmms_biomedico',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Ejemplo de login
const [rows] = await pool.query(
  'SELECT * FROM usuarios WHERE email = ?',
  ['admin@cmms.local']
);

// Verificar contraseña con bcrypt
const bcrypt = require('bcrypt');
const isValid = await bcrypt.compare('admin123', rows[0].password);
console.log(isValid); // true
```

### Para PHP / Laravel

```php
// .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cmms_biomedico
DB_USERNAME=cmms_user
DB_PASSWORD=CmmsSecure2024!#
```

### Para Python

```python
import mysql.connector
from flask_bcrypt import Bcrypt

db = mysql.connector.connect(
    host="localhost",
    user="cmms_user",
    password="CmmsSecure2024!#",
    database="cmms_biomedico"
)

cursor = db.cursor()
cursor.execute("SELECT * FROM usuarios WHERE email = %s", ('admin@cmms.local',))
user = cursor.fetchone()

bcrypt = Bcrypt()
if bcrypt.check_password_hash(user['password'], 'admin123'):
    print("Login exitoso")
```

---

## Solución de Problemas

### Error: "Access denied for user 'root'"
```bash
# Usa tu contraseña de root
mysql -u root -p < scripts/setup-cmms-database-valid.sql
# O especifica la contraseña
mysql -u root -pTU_CONTRASEÑA < scripts/setup-cmms-database-valid.sql
```

### Error: "Command not found: mysql"
- En Mac: `brew install mysql-client`
- En Ubuntu: `sudo apt-get install mysql-client`
- En Windows: Descarga MySQL Community Server con MySQL Shell incluido

### Error: "Connection refused"
- Verifica que MySQL está corriendo:
  - Mac: `brew services start mysql`
  - Ubuntu: `sudo systemctl start mysql`
  - Windows: Abre Services y busca MySQL

### El script Node.js no conecta
- Verifica las variables de entorno
- Prueba conectar manualmente: `mysql -u root -p`
- Asegúrate que `mysql2` esté instalado: `npm install mysql2`

### Contraseña aún no funciona después del setup
1. Verifica que usaste `setup-cmms-database-valid.sql` (no el antiguo)
2. Verifica que el INSERT de usuarios se ejecutó: `SELECT * FROM usuarios;`
3. Si no ves usuarios, ejecuta el script nuevamente
4. Si ves usuarios pero no funcionan, reemplaza las contraseñas con hash válido

---

## Archivos de Setup

| Archivo | Descripción | Estado |
|---------|-----------|--------|
| `setup-cmms-database-valid.sql` | Script SQL con contraseñas válidas | ✓ USA ESTE |
| `setup-database-valid.js` | Automatización con Node.js | ✓ USA ESTE |
| `setup-cmms-database.sql` | Script antiguo | ✗ NO USES |
| `setup-database.js` | Automatización antigua | ✗ NO USES |
| `DATABASE_SETUP.md` | Documentación completa | ℹ Referencia |

---

## Próximos Pasos

1. ✓ Ejecuta uno de los scripts de setup
2. ✓ Verifica que los usuarios se crearon
3. ✓ Integra la conexión a tu aplicación
4. ✓ Implementa login con validación de contraseñas
5. ✓ Prueba con `admin@cmms.local / admin123`

¡Listo! Las contraseñas ahora deberían funcionar.

---

## Soporte

Si sigues teniendo problemas:
1. Lee la sección "Solución de Problemas" arriba
2. Verifica que usas los archivos `-valid.sql` y `-valid.js`
3. Ejecuta `SELECT * FROM usuarios;` para confirmar que se insertaron los datos
4. Verifica que MySQL está corriendo correctamente
