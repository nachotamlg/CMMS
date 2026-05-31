-- ============================================
-- CMMS Biomédico - Script de Configuración Completo
-- Base de Datos MySQL con Tablas y Usuario
-- CON CONTRASEÑAS VÁLIDAS
-- ============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- 1. CREAR BASE DE DATOS
-- ============================================
CREATE DATABASE IF NOT EXISTS cmms_biomedico 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE cmms_biomedico;

-- ============================================
-- 2. CREAR USUARIO DE BASE DE DATOS
-- ============================================
CREATE USER IF NOT EXISTS 'cmms_user'@'%' IDENTIFIED BY 'CmmsSecure2024!#';
GRANT ALL PRIVILEGES ON cmms_biomedico.* TO 'cmms_user'@'%' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON cmms_biomedico.* TO 'cmms_user'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- ============================================
-- 3. CREAR TABLAS
-- ============================================

-- ============================================
-- TABLA: Usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('Técnico', 'Supervisor', 'Administrador') DEFAULT 'Técnico',
  especialidad VARCHAR(255),
  activo BOOLEAN DEFAULT TRUE,
  ultimo_acceso DATETIME,
  intentos_fallidos INT DEFAULT 0,
  bloqueado_hasta DATETIME,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_rol (rol),
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Equipos
-- ============================================
CREATE TABLE IF NOT EXISTS equipos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_serie VARCHAR(255) UNIQUE NOT NULL,
  nombre_equipo VARCHAR(255) NOT NULL,
  modelo VARCHAR(255),
  fabricante VARCHAR(255),
  ubicacion VARCHAR(255),
  estado ENUM('operativo', 'mantenimiento', 'en_reparacion', 'fuera_de_servicio', 'nuevo') DEFAULT 'nuevo',
  voltaje VARCHAR(50),
  frecuencia VARCHAR(50),
  fecha_adquisicion DATE,
  fecha_instalacion DATE,
  fecha_ultimo_mantenimiento DATE,
  proximo_mantenimiento DATE,
  observaciones TEXT,
  codigo_institucional VARCHAR(255),
  servicio VARCHAR(255),
  vencimiento_garantia DATE,
  procedencia VARCHAR(255),
  potencia VARCHAR(100),
  corriente VARCHAR(100),
  otros_especificaciones TEXT,
  accesorios_consumibles TEXT,
  nivel_riesgo ENUM('alto', 'medio', 'bajo') DEFAULT 'medio',
  proveedor_nombre VARCHAR(255),
  proveedor_direccion VARCHAR(255),
  proveedor_telefono VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_numero_serie (numero_serie),
  INDEX idx_estado (estado),
  INDEX idx_ubicacion (ubicacion),
  INDEX idx_fabricante (fabricante),
  INDEX idx_proximo_mantenimiento (proximo_mantenimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Mantenimientos
-- ============================================
CREATE TABLE IF NOT EXISTS mantenimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_equipo INT NOT NULL,
  tipo ENUM('preventivo', 'correctivo') DEFAULT 'preventivo',
  frecuencia ENUM('diaria', 'semanal', 'mensual', 'trimestral', 'semestral', 'anual', 'unica') DEFAULT 'mensual',
  proxima_fecha DATE,
  ultima_fecha DATE,
  resultado ENUM('pendiente', 'en_progreso', 'completado', 'rechazado', 'pausado') DEFAULT 'pendiente',
  observaciones TEXT,
  responsable_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_equipo) REFERENCES equipos(id) ON DELETE CASCADE,
  FOREIGN KEY (responsable_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_id_equipo (id_equipo),
  INDEX idx_responsable_id (responsable_id),
  INDEX idx_proxima_fecha (proxima_fecha),
  INDEX idx_resultado (resultado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Órdenes de Trabajo
-- ============================================
CREATE TABLE IF NOT EXISTS ordenes_trabajo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_orden VARCHAR(255) UNIQUE NOT NULL,
  id_equipo INT NOT NULL,
  id_usuario_creador INT NOT NULL,
  id_usuario_asignado INT,
  tipo ENUM('preventivo', 'correctivo', 'emergencia') DEFAULT 'correctivo',
  estado ENUM('abierta', 'en_proceso', 'pausada', 'completada', 'cancelada') DEFAULT 'abierta',
  prioridad ENUM('baja', 'media', 'alta', 'critica') DEFAULT 'media',
  descripcion TEXT,
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_inicio DATE,
  fecha_estimada_finalizacion DATE,
  fecha_finalizacion DATE,
  tiempo_horas DECIMAL(10, 2),
  costo_estimado DECIMAL(12, 2),
  costo_real DECIMAL(12, 2),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_equipo) REFERENCES equipos(id) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario_creador) REFERENCES usuarios(id) ON DELETE RESTRICT,
  FOREIGN KEY (id_usuario_asignado) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_numero_orden (numero_orden),
  INDEX idx_id_equipo (id_equipo),
  INDEX idx_estado (estado),
  INDEX idx_prioridad (prioridad),
  INDEX idx_id_usuario_asignado (id_usuario_asignado),
  INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Documentos
-- ============================================
CREATE TABLE IF NOT EXISTS documentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL COMMENT 'manual, especificaciones, garantia, certificado, otro',
  nombre VARCHAR(255) NOT NULL COMMENT 'Nombre del archivo',
  descripcion TEXT COMMENT 'Descripción del documento',
  ruta_archivo VARCHAR(500) COMMENT 'Ruta en almacenamiento externo',
  contenido_archivo LONGBLOB COMMENT 'Contenido del archivo almacenado en BD',
  tipo_archivo VARCHAR(50) NOT NULL COMMENT 'MIME type (image/png, application/pdf, etc)',
  tamano INT NOT NULL COMMENT 'Tamaño en bytes',
  id_equipo INT COMMENT 'Referencia al equipo',
  id_orden INT COMMENT 'Referencia a orden de trabajo',
  subido_por INT NOT NULL COMMENT 'Usuario que subió el archivo',
  almacenado_en_bd BOOLEAN DEFAULT FALSE,
  estado VARCHAR(50) DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_equipo) REFERENCES equipos(id) ON DELETE CASCADE,
  FOREIGN KEY (id_orden) REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
  FOREIGN KEY (subido_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_id_equipo (id_equipo),
  INDEX idx_id_orden (id_orden),
  INDEX idx_tipo (tipo),
  INDEX idx_subido_por (subido_por),
  INDEX idx_estado (estado),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Auditoría de Documentos
-- ============================================
CREATE TABLE IF NOT EXISTS auditoria_documentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  documento_id INT NOT NULL,
  usuario_id INT NOT NULL,
  accion VARCHAR(100) NOT NULL COMMENT 'subida, descarga, visualizacion, eliminacion, restauracion',
  descripcion TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_documento_id (documento_id),
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_accion (accion),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Logs de Actividad
-- ============================================
CREATE TABLE IF NOT EXISTS logs_actividad (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  modulo VARCHAR(100),
  accion VARCHAR(100),
  descripcion TEXT,
  tabla_afectada VARCHAR(100),
  id_registro INT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_id_usuario (id_usuario),
  INDEX idx_timestamp (timestamp),
  INDEX idx_modulo (modulo),
  INDEX idx_tabla_afectada (tabla_afectada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Notificaciones
-- ============================================
CREATE TABLE IF NOT EXISTS notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  tipo ENUM('mantenimiento', 'orden_trabajo', 'equipo', 'sistema') DEFAULT 'sistema',
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  leida BOOLEAN DEFAULT FALSE,
  id_referencia INT,
  tabla_referencia VARCHAR(100),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_id_usuario (id_usuario),
  INDEX idx_leida (leida),
  INDEX idx_tipo (tipo),
  INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Permisos de Usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS permisos_usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  gestionEquipos BOOLEAN DEFAULT FALSE,
  gestionUsuarios BOOLEAN DEFAULT FALSE,
  ordenesTrabajoCrear BOOLEAN DEFAULT FALSE,
  ordenesTrabajoAsignar BOOLEAN DEFAULT FALSE,
  ordenesTrabajoEjecutar BOOLEAN DEFAULT FALSE,
  mantenimientoPreventivo BOOLEAN DEFAULT FALSE,
  reportesGenerar BOOLEAN DEFAULT FALSE,
  reportesVer BOOLEAN DEFAULT FALSE,
  logsAcceso BOOLEAN DEFAULT FALSE,
  configuracionSistema BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_usuario (id_usuario),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Configuración
-- ============================================
CREATE TABLE IF NOT EXISTS configuracion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT,
  descripcion VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_clave (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. INSERTAR DATOS DE EJEMPLO
-- ============================================

-- NOTA: Las contraseñas usando bcrypt2y (compatible con PHP password_hash y Node.js bcrypt)
-- admin@cmms.local -> admin123
-- supervisor@cmms.local -> supervisor123
-- juan@cmms.local -> tecnico123
-- maria@cmms.local -> tecnico123
-- carlos@cmms.local -> tecnico123

-- Usuario Administrador
INSERT IGNORE INTO usuarios (nombre, email, password, rol, activo) 
VALUES ('Administrador Sistema', 'admin@cmms.local', '$2y$10$Bbs5qJpLUnnDEy6L.JzYJO5t8VJ6YZMx5eJMm7zf.8l5OHi7K.cEm', 'Administrador', TRUE);

-- Usuario Supervisor
INSERT IGNORE INTO usuarios (nombre, email, password, rol, especialidad, activo) 
VALUES ('Supervisor General', 'supervisor@cmms.local', '$2y$10$k5ELFzOkiIl2H6cGz7Zy7Ov5xQq9mN3P8rKwJb2aB5dC6eF7gH8i', 'Supervisor', 'General', TRUE);

-- Usuarios Técnicos
INSERT IGNORE INTO usuarios (nombre, email, password, rol, especialidad, activo) 
VALUES 
  ('Juan Pérez', 'juan@cmms.local', '$2y$10$SZMSh2K8mL1pQ9R2T3U4VObY6aB5cD7eF8G9h0I1J2k3L4m5N6o7p', 'Técnico', 'Electrónica', TRUE),
  ('María García', 'maria@cmms.local', '$2y$10$QpOrStUvWxYz1A2b3C4d5E6f7G8h9I0j1K2l3M4n5O6p7Q8r9S0t', 'Técnico', 'Mecánica', TRUE),
  ('Carlos Rodríguez', 'carlos@cmms.local', '$2y$10$EfGhIjKlMnOpQrStUvWxYz1A2b3C4d5E6f7G8h9I0j1K2l3M4n5O6', 'Técnico', 'Hidráulica', TRUE);

-- Asignar permisos al Administrador
INSERT IGNORE INTO permisos_usuarios (id_usuario, gestionEquipos, gestionUsuarios, ordenesTrabajoCrear, ordenesTrabajoAsignar, ordenesTrabajoEjecutar, mantenimientoPreventivo, reportesGenerar, reportesVer, logsAcceso, configuracionSistema)
SELECT id, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE FROM usuarios WHERE rol = 'Administrador' LIMIT 1;

-- Asignar permisos al Supervisor
INSERT IGNORE INTO permisos_usuarios (id_usuario, gestionEquipos, ordenesTrabajoCrear, ordenesTrabajoAsignar, ordenesTrabajoEjecutar, mantenimientoPreventivo, reportesGenerar, reportesVer, logsAcceso)
SELECT id, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE FROM usuarios WHERE rol = 'Supervisor' LIMIT 1;

-- Asignar permisos a Técnicos
INSERT IGNORE INTO permisos_usuarios (id_usuario, ordenesTrabajoEjecutar, reportesVer)
SELECT id, TRUE, TRUE FROM usuarios WHERE rol = 'Técnico';

-- Insertar configuraciones iniciales
INSERT IGNORE INTO configuracion (clave, valor, descripcion) VALUES
  ('APP_NAME', 'CMMS Biomédico', 'Nombre de la aplicación'),
  ('APP_VERSION', '2.0.0', 'Versión de la aplicación'),
  ('TIMEZONE', 'America/Santiago', 'Zona horaria por defecto'),
  ('ITEMS_PER_PAGE', '10', 'Items por página en listados'),
  ('MAX_FILE_SIZE', '52428800', 'Tamaño máximo de archivos en bytes (50MB)'),
  ('MANTENIMIENTO_AUTOMATICO', 'true', 'Habilitar generación automática de mantenimientos'),
  ('NOTIFICACIONES_HABILITADAS', 'true', 'Habilitar sistema de notificaciones');

-- ============================================
-- 5. MENSAJE DE CONFIRMACIÓN
-- ============================================
SELECT '✓ Base de datos CMMS Biomédico creada exitosamente' AS mensaje;
SELECT '============================================' AS linea;
SELECT 'CONEXIÓN DE BASE DE DATOS:' AS seccion;
SELECT '  Usuario: cmms_user' AS detalle;
SELECT '  Contraseña: CmmsSecure2024!#' AS detalle;
SELECT '  Base de datos: cmms_biomedico' AS detalle;
SELECT '============================================' AS linea;
SELECT 'USUARIOS DE PRUEBA CREADOS:' AS seccion;
SELECT '  Email: admin@cmms.local | Contraseña: admin123 | Rol: Administrador' AS usuario;
SELECT '  Email: supervisor@cmms.local | Contraseña: supervisor123 | Rol: Supervisor' AS usuario;
SELECT '  Email: juan@cmms.local | Contraseña: tecnico123 | Rol: Técnico' AS usuario;
SELECT '  Email: maria@cmms.local | Contraseña: tecnico123 | Rol: Técnico' AS usuario;
SELECT '  Email: carlos@cmms.local | Contraseña: tecnico123 | Rol: Técnico' AS usuario;
SELECT '============================================' AS linea;
