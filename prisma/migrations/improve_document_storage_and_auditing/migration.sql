-- Mejorar tabla documentos con mejores campos para almacenamiento
ALTER TABLE `documentos` 
  ADD COLUMN `estado` VARCHAR(50) DEFAULT 'activo' AFTER `almacenado_en_bd`,
  MODIFY `almacenado_en_bd` BOOLEAN DEFAULT false,
  ADD INDEX `idx_subido_por` (`subido_por`),
  ADD INDEX `idx_estado` (`estado`);

-- Crear tabla de auditoría para documentos
CREATE TABLE IF NOT EXISTS `auditoria_documentos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `documento_id` INT NOT NULL,
  `usuario_id` INT NOT NULL,
  `accion` VARCHAR(100) NOT NULL,
  `descripcion` TEXT,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `idx_documento_id` (`documento_id`),
  INDEX `idx_usuario_id` (`usuario_id`),
  INDEX `idx_accion` (`accion`),
  INDEX `idx_created_at` (`created_at`),
  CONSTRAINT `auditoria_documentos_documento_id_fkey` FOREIGN KEY (`documento_id`) REFERENCES `documentos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `auditoria_documentos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
