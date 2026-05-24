-- CreateTable usuarios
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
