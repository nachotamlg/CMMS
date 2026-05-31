#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}`),
  divider: () => console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`),
};

async function setupDatabase() {
  let connection;

  try {
    log.header('CMMS Biomédico - Configuración de Base de Datos');
    log.divider();

    // Obtener configuración de conexión de variables de entorno
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

    log.info(`Conectando a MySQL en ${dbConfig.host}:${dbConfig.port}...`);

    // Conectar a MySQL (sin especificar base de datos aún)
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
      multipleStatements: true,
    });

    log.success('Conexión establecida');

    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'setup-cmms-database-valid.sql');
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`Archivo SQL no encontrado: ${sqlFile}`);
    }

    log.info('Leyendo script SQL...');
    const sqlScript = fs.readFileSync(sqlFile, 'utf8');

    // Ejecutar el script SQL
    log.info('Ejecutando script de configuración...');
    await connection.query(sqlScript);

    log.success('Script SQL ejecutado correctamente');

    // Verificar que las tablas se crearon
    log.info('Verificando tablas creadas...');
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'cmms_biomedico' ORDER BY TABLE_NAME"
    );

    log.divider();
    log.header('Tablas Creadas');

    const expectedTables = [
      'usuarios',
      'equipos',
      'mantenimientos',
      'ordenes_trabajo',
      'documentos',
      'auditoria_documentos',
      'logs_actividad',
      'notificaciones',
      'permisos_usuarios',
      'configuracion',
    ];

    const createdTableNames = tables.map((t) => t.TABLE_NAME);
    let allTablesCreated = true;

    expectedTables.forEach((table) => {
      if (createdTableNames.includes(table)) {
        log.success(`${table}`);
      } else {
        log.error(`${table} (NO CREADA)`);
        allTablesCreated = false;
      }
    });

    if (!allTablesCreated) {
      throw new Error('No todas las tablas se crearon correctamente');
    }

    // Verificar usuarios
    log.divider();
    log.header('Usuarios de Prueba Creados');

    const [users] = await connection.query(
      'SELECT id, nombre, email, rol FROM cmms_biomedico.usuarios ORDER BY rol, nombre'
    );

    users.forEach((user) => {
      log.info(`${user.email} (${user.rol}) - ${user.nombre}`);
    });

    // Verificar permisos
    log.divider();
    log.header('Información de Acceso');

    log.info('Base de datos: cmms_biomedico');
    log.info('Usuario MySQL: cmms_user');
    log.info('Contraseña: CmmsSecure2024!#');

    log.divider();
    log.header('Credenciales de Prueba');

    const credentials = [
      { email: 'admin@cmms.local', password: 'admin123', role: 'Administrador' },
      { email: 'supervisor@cmms.local', password: 'supervisor123', role: 'Supervisor' },
      { email: 'juan@cmms.local', password: 'tecnico123', role: 'Técnico - Electrónica' },
      { email: 'maria@cmms.local', password: 'tecnico123', role: 'Técnico - Mecánica' },
      { email: 'carlos@cmms.local', password: 'tecnico123', role: 'Técnico - Hidráulica' },
    ];

    credentials.forEach((cred) => {
      console.log(`  ${colors.cyan}${cred.email}${colors.reset}`);
      console.log(`    Contraseña: ${cred.password}`);
      console.log(`    Rol: ${cred.role}`);
    });

    log.divider();
    log.success('Base de datos configurada exitosamente');
    console.log(
      `\n${colors.yellow}PRÓXIMOS PASOS:${colors.reset}`
    );
    console.log('1. Integra tu aplicación con MySQL usando las credenciales anteriores');
    console.log('2. Implementa autenticación con validación de contraseñas (bcrypt)');
    console.log('3. Prueba el login con los usuarios de prueba');
    console.log('4. Para producción, cambia las contraseñas de todos los usuarios\n');
  } catch (error) {
    log.error(`Error durante la configuración:`);
    console.error(`${colors.red}${error.message}${colors.reset}`);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar setup
setupDatabase().catch((error) => {
  log.error(error.message);
  process.exit(1);
});
