#!/usr/bin/env node

/**
 * Script de Configuración de Base de Datos MySQL - CMMS Biomédico
 * Ejecuta el script SQL de setup y valida la conexión
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuración de conexión
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

async function readSqlFile() {
  try {
    const sqlPath = path.join(__dirname, 'setup-cmms-database.sql');
    logInfo(`Leyendo archivo SQL: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    logSuccess('Archivo SQL leído correctamente');
    return sql;
  } catch (error) {
    logError(`Error al leer el archivo SQL: ${error.message}`);
    process.exit(1);
  }
}

async function executeSetup(sql) {
  let connection;
  try {
    logInfo('Conectando a MySQL...');
    connection = await mysql.createConnection(dbConfig);
    logSuccess('Conexión establecida');

    logInfo('Ejecutando script de configuración...');
    // Dividir el SQL en statements individuales
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let executedCount = 0;
    for (const statement of statements) {
      try {
        await connection.execute(statement);
        executedCount++;
      } catch (error) {
        // Ignorar algunos errores esperados
        if (error.code === 'ER_DB_CREATE_EXISTS' || error.message.includes('already exists')) {
          logWarning(`Advertencia: ${error.message}`);
        } else if (error.code !== 'ER_DUP_ENTRY') {
          // ER_DUP_ENTRY es para insertos duplicados (INSERT IGNORE)
          logWarning(`Error al ejecutar statement (puede ser esperado): ${error.message}`);
        }
      }
    }

    logSuccess(`${executedCount} sentencias SQL ejecutadas correctamente`);
    return true;
  } catch (error) {
    logError(`Error durante la ejecución del setup: ${error.message}`);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function verifyDatabase() {
  let connection;
  try {
    logInfo('Verificando base de datos...');

    // Conectar a la base de datos específica
    const verifyConfig = { ...dbConfig, database: 'cmms_biomedico' };
    connection = await mysql.createConnection(verifyConfig);
    logSuccess('Conexión a cmms_biomedico establecida');

    // Verificar tablas
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'cmms_biomedico'"
    );
    logInfo(`Tablas encontradas: ${tables.length}`);

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

    const tableNames = tables.map(t => t.TABLE_NAME);
    let missingTables = [];

    for (const table of expectedTables) {
      if (tableNames.includes(table)) {
        logSuccess(`Tabla encontrada: ${table}`);
      } else {
        logError(`Tabla no encontrada: ${table}`);
        missingTables.push(table);
      }
    }

    // Verificar usuarios
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM usuarios');
    logInfo(`Usuarios creados: ${users[0].count}`);

    return missingTables.length === 0;
  } catch (error) {
    logError(`Error durante la verificación: ${error.message}`);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function showConnectionInfo() {
  log('\n' + '='.repeat(50), 'blue');
  logInfo('INFORMACIÓN DE CONEXIÓN');
  log('='.repeat(50), 'blue');
  log(`Host: ${dbConfig.host}`);
  log(`Puerto: ${dbConfig.port}`);
  log(`Usuario: ${dbConfig.user}`);
  log(`Base de datos: cmms_biomedico`);
  log('Usuario de BD: cmms_user');
  log('Contraseña: CmmsSecure2024!#');
  log('='.repeat(50), 'blue');
  log('\nUSUARIOS DE PRUEBA:', 'cyan');
  log('Admin: admin@cmms.local / admin123');
  log('Supervisor: supervisor@cmms.local / supervisor123');
  log('Técnico 1: juan@cmms.local / tecnico123');
  log('Técnico 2: maria@cmms.local / tecnico123');
  log('Técnico 3: carlos@cmms.local / tecnico123');
  log('='.repeat(50), 'blue' + '\n');
}

async function main() {
  try {
    log('\n╔════════════════════════════════════════════════════════╗', 'blue');
    log('║     CMMS Biomédico - Setup de Base de Datos MySQL      ║', 'blue');
    log('╚════════════════════════════════════════════════════════╝\n', 'blue');

    const sql = await readSqlFile();
    const success = await executeSetup(sql);

    if (success) {
      logSuccess('\nSetup completado. Verificando...\n');
      const verified = await verifyDatabase();

      if (verified) {
        logSuccess('✓ Base de datos verificada correctamente\n');
        await showConnectionInfo();
      } else {
        logWarning('Algunos elementos no pudieron ser verificados.');
      }
    } else {
      logError('El setup no se completó correctamente.');
      process.exit(1);
    }
  } catch (error) {
    logError(`Error fatal: ${error.message}`);
    process.exit(1);
  }
}

main();
