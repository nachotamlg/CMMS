-- ============================================
-- CMMS Biomédico - Base de Datos MySQL
-- Script de instalación completo
-- ============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS cmms_biomedico 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE cmms_biomedico;

-- ============================================
-- TABLA: Usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'Técnico',
  activo BOOLEAN DEFAULT TRUE,
  ultimo_acceso DATETIME,
  intentos_fallidos INT DEFAULT 0,
  bloqueado_hasta DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(100),
  marca VARCHAR(100),
  modelo VARCHAR(100),
  numero_serie VARCHAR(100),
  ubicacion VARCHAR(255),
  fecha_adquisicion DATETIME,
  vida_util_anos INT,
  valor_adquisicion DECIMAL(10, 2),
  estado VARCHAR(50) NOT NULL,
  criticidad VARCHAR(50),
  descripcion TEXT,
  especificaciones JSON,
  ultima_mantencion DATETIME,
  proxima_mantencion DATETIME,
  horas_operacion DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_codigo (codigo),
  INDEX idx_estado (estado),
  INDEX idx_tipo (tipo),
  INDEX idx_ubicacion (ubicacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Órdenes de Trabajo
-- ============================================
CREATE TABLE IF NOT EXISTS ordenes_trabajo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_orden VARCHAR(50) UNIQUE NOT NULL,
  equipo_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  prioridad VARCHAR(50) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_programada DATETIME,
  fecha_inicio DATETIME,
  fecha_finalizacion DATETIME,
  tiempo_estimado INT,
  tiempo_real INT,
  costo_estimado DECIMAL(10, 2),
  costo_real DECIMAL(10, 2),
  creado_por INT NOT NULL,
  asignado_a INT,
  notas TEXT,
  resultado TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
  FOREIGN KEY (asignado_a) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_numero_orden (numero_orden),
  INDEX idx_equipo_id (equipo_id),
  INDEX idx_estado (estado),
  INDEX idx_prioridad (prioridad),
  INDEX idx_creado_por (creado_por),
  INDEX idx_asignado_a (asignado_a)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Mantenimientos
-- ============================================
CREATE TABLE IF NOT EXISTS mantenimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipo_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  frecuencia VARCHAR(50) NOT NULL,
  frecuencia_dias INT,
  ultima_realizacion DATETIME,
  proxima_programada DATETIME NOT NULL,
  descripcion TEXT NOT NULL,
  procedimiento TEXT,
  tiempo_estimado INT,
  activo BOOLEAN DEFAULT TRUE,
  creado_por INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_equipo_id (equipo_id),
  INDEX idx_proxima_programada (proxima_programada),
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Mantenimientos Realizados
-- ============================================
CREATE TABLE IF NOT EXISTS mantenimientos_realizados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mantenimiento_id INT NOT NULL,
  equipo_id INT NOT NULL,
  fecha_realizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  realizado_por INT NOT NULL,
  tiempo_real INT,
  costo DECIMAL(10, 2),
  observaciones TEXT,
  tareas_realizadas JSON,
  estado_equipo VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mantenimiento_id) REFERENCES mantenimientos(id) ON DELETE CASCADE,
  FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
  FOREIGN KEY (realizado_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_mantenimiento_id (mantenimiento_id),
  INDEX idx_equipo_id (equipo_id),
  INDEX idx_fecha_realizacion (fecha_realizacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Documentos
-- ============================================
CREATE TABLE IF NOT EXISTS documentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  ruta_archivo VARCHAR(500),
  contenido_archivo LONGBLOB,
  tipo_archivo VARCHAR(50) NOT NULL,
  tamano INT NOT NULL,
  equipo_id INT,
  orden_id INT,
  subido_por INT NOT NULL,
  almacenado_en_bd BOOLEAN DEFAULT FALSE,
  estado VARCHAR(50) DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
  FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
  FOREIGN KEY (subido_por) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_equipo_id (equipo_id),
  INDEX idx_orden_id (orden_id),
  INDEX idx_tipo (tipo),
  INDEX idx_subido_por (subido_por),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Auditoría de Documentos
-- ============================================
CREATE TABLE IF NOT EXISTS auditoria_documentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  documento_id INT NOT NULL,
  usuario_id INT NOT NULL,
  accion VARCHAR(100) NOT NULL,
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
-- TABLA: Notificaciones
-- ============================================
CREATE TABLE IF NOT EXISTS notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  datos JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_leida (leida),
  INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Logs de Actividad
-- ============================================
CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  accion VARCHAR(100) NOT NULL,
  modulo VARCHAR(50) NOT NULL,
  descripcion TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  datos JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_accion (accion),
  INDEX idx_modulo (modulo),
  INDEX idx_created_at (created_at)
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
-- Insertar datos de ejemplo
-- ============================================

-- Usuario Administrador (contraseña: admin123)
INSERT IGNORE INTO usuarios (nombre, email, password, rol, activo) 
VALUES ('Administrador', 'admin@cmms.local', '$2b$10$3H4Z5Q5Q5Q5Q5Q5Q5Q5Q5uQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5', 'Administrador', TRUE);

-- Usuario Supervisor (contraseña: supervisor123)
INSERT IGNORE INTO usuarios (nombre, email, password, rol, activo) 
VALUES ('Supervisor', 'supervisor@cmms.local', '$2b$10$3H4Z5Q5Q5Q5Q5Q5Q5Q5Q5uQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5', 'Supervisor', TRUE);

-- Usuarios Técnicos (contraseña: tecnico123)
INSERT IGNORE INTO usuarios (nombre, email, password, rol, activo) 
VALUES 
  ('Juan Pérez', 'juan@cmms.local', '$2b$10$3H4Z5Q5Q5Q5Q5Q5Q5Q5Q5uQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5', 'Técnico', TRUE),
  ('María García', 'maria@cmms.local', '$2b$10$3H4Z5Q5Q5Q5Q5Q5Q5Q5Q5uQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5', 'Técnico', TRUE),
  ('Carlos Rodríguez', 'carlos@cmms.local', '$2b$10$3H4Z5Q5Q5Q5Q5Q5Q5Q5Q5uQ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5', 'Técnico', TRUE);

-- Configuraciones iniciales
INSERT IGNORE INTO configuracion (clave, valor, descripcion) VALUES
  ('APP_NAME', 'CMMS Biomédico', 'Nombre de la aplicación'),
  ('APP_VERSION', '1.0.0', 'Versión de la aplicación'),
  ('TIMEZONE', 'America/Santiago', 'Zona horaria por defecto'),
  ('ITEMS_PER_PAGE', '10', 'Items por página en listados'),
  ('MAX_FILE_SIZE', '52428800', 'Tamaño máximo de archivos en bytes (50MB)');
