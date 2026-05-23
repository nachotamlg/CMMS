-- AlterTable
ALTER TABLE `documentos` ADD COLUMN `contenido_archivo` LONGBLOB NULL,
ADD COLUMN `almacenado_en_bd` BOOLEAN NOT NULL DEFAULT true,
MODIFY `ruta_archivo` VARCHAR(500) NULL;
