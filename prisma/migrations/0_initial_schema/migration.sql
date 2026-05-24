-- CreateTable users (para portal de links)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'user',
    `activo` TINYINT(1) DEFAULT 1,
    `name` VARCHAR(255) NOT NULL,
    `apellido_paterno` VARCHAR(255) DEFAULT NULL,
    `apellido_materno` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `email` (`email`),
    KEY `idx_users_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- CreateTable usuarios (para CMMS)
CREATE TABLE `usuarios` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `rol` VARCHAR(50) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `ultimo_acceso` DATETIME(3),
    `intentos_fallidos` INT NOT NULL DEFAULT 0,
    `bloqueado_hasta` DATETIME(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    INDEX `usuarios_email_idx`(`email`),
    INDEX `usuarios_rol_idx`(`rol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable equipos
CREATE TABLE `equipos` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(50) NOT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `tipo` VARCHAR(100) NOT NULL,
    `marca` VARCHAR(100),
    `modelo` VARCHAR(100),
    `numero_serie` VARCHAR(100),
    `ubicacion` VARCHAR(255),
    `fecha_adquisicion` DATETIME(3),
    `vida_util_anos` INT,
    `valor_adquisicion` DECIMAL(10,2),
    `estado` VARCHAR(50) NOT NULL,
    `criticidad` VARCHAR(50) NOT NULL,
    `descripcion` TEXT,
    `especificaciones` JSON,
    `ultima_mantencion` DATETIME(3),
    `proxima_mantencion` DATETIME(3),
    `horas_operacion` DECIMAL(10,2),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `equipos_codigo_key`(`codigo`),
    INDEX `equipos_codigo_idx`(`codigo`),
    INDEX `equipos_estado_idx`(`estado`),
    INDEX `equipos_tipo_idx`(`tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable ordenes_trabajo
CREATE TABLE `ordenes_trabajo` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `numero_orden` VARCHAR(50) NOT NULL,
    `equipo_id` INT NOT NULL,
    `tipo` VARCHAR(50) NOT NULL,
    `prioridad` VARCHAR(50) NOT NULL,
    `estado` VARCHAR(50) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `fecha_solicitud` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_programada` DATETIME(3),
    `fecha_inicio` DATETIME(3),
    `fecha_finalizacion` DATETIME(3),
    `tiempo_estimado` INT,
    `tiempo_real` INT,
    `costo_estimado` DECIMAL(10,2),
    `costo_real` DECIMAL(10,2),
    `creado_por` INT NOT NULL,
    `asignado_a` INT,
    `notas` TEXT,
    `resultado` TEXT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ordenes_trabajo_numero_orden_key`(`numero_orden`),
    INDEX `ordenes_trabajo_numero_orden_idx`(`numero_orden`),
    INDEX `ordenes_trabajo_equipo_id_idx`(`equipo_id`),
    INDEX `ordenes_trabajo_estado_idx`(`estado`),
    INDEX `ordenes_trabajo_prioridad_idx`(`prioridad`),
    INDEX `ordenes_trabajo_creado_por_idx`(`creado_por`),
    INDEX `ordenes_trabajo_asignado_a_idx`(`asignado_a`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable mantenimientos
CREATE TABLE `mantenimientos` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `equipo_id` INT NOT NULL,
    `tipo` VARCHAR(50) NOT NULL,
    `frecuencia` VARCHAR(50) NOT NULL,
    `frecuencia_dias` INT NOT NULL,
    `ultima_realizacion` DATETIME(3),
    `proxima_programada` DATETIME(3) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `procedimiento` TEXT,
    `tiempo_estimado` INT,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_por` INT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `mantenimientos_equipo_id_idx`(`equipo_id`),
    INDEX `mantenimientos_proxima_programada_idx`(`proxima_programada`),
    INDEX `mantenimientos_activo_idx`(`activo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable mantenimientos_realizados
CREATE TABLE `mantenimientos_realizados` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `mantenimiento_id` INT NOT NULL,
    `equipo_id` INT NOT NULL,
    `fecha_realizacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `realizado_por` INT NOT NULL,
    `tiempo_real` INT,
    `costo` DECIMAL(10,2),
    `observaciones` TEXT,
    `tareas_realizadas` JSON,
    `estado_equipo` VARCHAR(50),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `mantenimientos_realizados_mantenimiento_id_idx`(`mantenimiento_id`),
    INDEX `mantenimientos_realizados_equipo_id_idx`(`equipo_id`),
    INDEX `mantenimientos_realizados_fecha_realizacion_idx`(`fecha_realizacion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable documentos
CREATE TABLE `documentos` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(50) NOT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `descripcion` TEXT,
    `ruta_archivo` VARCHAR(500),
    `contenido_archivo` LONGBLOB,
    `tipo_archivo` VARCHAR(50) NOT NULL,
    `tamano` INT NOT NULL,
    `equipo_id` INT,
    `orden_id` INT,
    `subido_por` INT NOT NULL,
    `almacenado_en_bd` BOOLEAN NOT NULL DEFAULT false,
    `estado` VARCHAR(50) NOT NULL DEFAULT 'activo',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `documentos_equipo_id_idx`(`equipo_id`),
    INDEX `documentos_orden_id_idx`(`orden_id`),
    INDEX `documentos_tipo_idx`(`tipo`),
    INDEX `documentos_subido_por_idx`(`subido_por`),
    INDEX `documentos_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable auditoria_documentos
CREATE TABLE `auditoria_documentos` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `documento_id` INT NOT NULL,
    `usuario_id` INT NOT NULL,
    `accion` VARCHAR(100) NOT NULL,
    `descripcion` TEXT,
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `auditoria_documentos_documento_id_idx`(`documento_id`),
    INDEX `auditoria_documentos_usuario_id_idx`(`usuario_id`),
    INDEX `auditoria_documentos_accion_idx`(`accion`),
    INDEX `auditoria_documentos_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable notificaciones
CREATE TABLE `notificaciones` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `usuario_id` INT NOT NULL,
    `tipo` VARCHAR(50) NOT NULL,
    `titulo` VARCHAR(255) NOT NULL,
    `mensaje` TEXT NOT NULL,
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `fecha_envio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `datos` JSON,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `notificaciones_usuario_id_idx`(`usuario_id`),
    INDEX `notificaciones_leida_idx`(`leida`),
    INDEX `notificaciones_tipo_idx`(`tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable logs
CREATE TABLE `logs` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `usuario_id` INT,
    `accion` VARCHAR(100) NOT NULL,
    `modulo` VARCHAR(50) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `datos` JSON,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `logs_usuario_id_idx`(`usuario_id`),
    INDEX `logs_accion_idx`(`accion`),
    INDEX `logs_modulo_idx`(`modulo`),
    INDEX `logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable configuracion
CREATE TABLE `configuracion` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `clave` VARCHAR(100) NOT NULL,
    `valor` TEXT,
    `descripcion` VARCHAR(255),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `configuracion_clave_key`(`clave`),
    INDEX `configuracion_clave_idx`(`clave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey ordenes_trabajo
ALTER TABLE `ordenes_trabajo` ADD CONSTRAINT `ordenes_trabajo_equipo_id_fkey` FOREIGN KEY (`equipo_id`) REFERENCES `equipos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ordenes_trabajo` ADD CONSTRAINT `ordenes_trabajo_creado_por_fkey` FOREIGN KEY (`creado_por`) REFERENCES `usuarios`(`id`) ON UPDATE CASCADE;
ALTER TABLE `ordenes_trabajo` ADD CONSTRAINT `ordenes_trabajo_asignado_a_fkey` FOREIGN KEY (`asignado_a`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey mantenimientos
ALTER TABLE `mantenimientos` ADD CONSTRAINT `mantenimientos_equipo_id_fkey` FOREIGN KEY (`equipo_id`) REFERENCES `equipos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `mantenimientos` ADD CONSTRAINT `mantenimientos_creado_por_fkey` FOREIGN KEY (`creado_por`) REFERENCES `usuarios`(`id`) ON UPDATE CASCADE;

-- AddForeignKey mantenimientos_realizados
ALTER TABLE `mantenimientos_realizados` ADD CONSTRAINT `mantenimientos_realizados_mantenimiento_id_fkey` FOREIGN KEY (`mantenimiento_id`) REFERENCES `mantenimientos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `mantenimientos_realizados` ADD CONSTRAINT `mantenimientos_realizados_equipo_id_fkey` FOREIGN KEY (`equipo_id`) REFERENCES `equipos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `mantenimientos_realizados` ADD CONSTRAINT `mantenimientos_realizados_realizado_por_fkey` FOREIGN KEY (`realizado_por`) REFERENCES `usuarios`(`id`) ON UPDATE CASCADE;

-- AddForeignKey documentos
ALTER TABLE `documentos` ADD CONSTRAINT `documentos_equipo_id_fkey` FOREIGN KEY (`equipo_id`) REFERENCES `equipos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `documentos` ADD CONSTRAINT `documentos_orden_id_fkey` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_trabajo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `documentos` ADD CONSTRAINT `documentos_subido_por_fkey` FOREIGN KEY (`subido_por`) REFERENCES `usuarios`(`id`) ON UPDATE CASCADE;

-- AddForeignKey auditoria_documentos
ALTER TABLE `auditoria_documentos` ADD CONSTRAINT `auditoria_documentos_documento_id_fkey` FOREIGN KEY (`documento_id`) REFERENCES `documentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `auditoria_documentos` ADD CONSTRAINT `auditoria_documentos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE CASCADE;

-- AddForeignKey notificaciones
ALTER TABLE `notificaciones` ADD CONSTRAINT `notificaciones_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey logs
ALTER TABLE `logs` ADD CONSTRAINT `logs_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- TABLAS PARA PORTAL DE LINKS
-- ============================================

-- CreateTable categories
CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `icon` VARCHAR(255) DEFAULT NULL,
    `created_by` INT(11) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `fk_categories_created_by` (`created_by`),
    CONSTRAINT `fk_categories_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable links
CREATE TABLE IF NOT EXISTS `links` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `image_url` TEXT DEFAULT NULL,
    `url` TEXT NOT NULL,
    `created_by` INT(11) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `category_id` INT(11) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_links_created_by` (`created_by`),
    KEY `idx_links_category_id` (`category_id`),
    CONSTRAINT `fk_links_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_links_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable sessions
CREATE TABLE IF NOT EXISTS `sessions` (
    `id` VARCHAR(255) NOT NULL,
    `user_id` INT(11) NOT NULL,
    `expires_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_sessions_user_id` (`user_id`),
    KEY `idx_sessions_expires_at` (`expires_at`),
    CONSTRAINT `fk_sessions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable daily_messages
CREATE TABLE IF NOT EXISTS `daily_messages` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `message` TEXT NOT NULL,
    `created_by` INT(11) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_read` TINYINT(1) DEFAULT 0,
    PRIMARY KEY (`id`),
    KEY `created_by` (`created_by`),
    CONSTRAINT `daily_messages_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- CreateTable daily_message_reads
CREATE TABLE IF NOT EXISTS `daily_message_reads` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `message_id` INT(11) NOT NULL,
    `user_id` INT(11) NOT NULL,
    `read_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_message_user` (`message_id`, `user_id`),
    KEY `idx_user_id` (`user_id`),
    CONSTRAINT `fk_dmr_message` FOREIGN KEY (`message_id`) REFERENCES `daily_messages` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_dmr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- CreateTable notifications (para portal de links)
CREATE TABLE IF NOT EXISTS `notifications_portal` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `user_id` INT(11) DEFAULT NULL,
    `link_id` INT(11) DEFAULT NULL,
    `category_id` INT(11) DEFAULT NULL,
    `message` TEXT DEFAULT NULL,
    `is_read` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_notifications_user_id` (`user_id`),
    KEY `idx_notifications_link_id` (`link_id`),
    KEY `idx_notifications_category_id` (`category_id`),
    CONSTRAINT `fk_notifications_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_notifications_link_id` FOREIGN KEY (`link_id`) REFERENCES `links` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_notifications_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CreateTable settings
CREATE TABLE IF NOT EXISTS `settings` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `setting_key` VARCHAR(100) NOT NULL,
    `setting_value` TEXT DEFAULT NULL,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `updated_by` INT(11) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `setting_key` (`setting_key`),
    KEY `fk_settings_updated_by` (`updated_by`),
    CONSTRAINT `fk_settings_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
