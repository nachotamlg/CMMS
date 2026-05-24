# Sistema de Almacenamiento de Documentos

## Descripción General

El sistema de CMMS ahora soporta almacenamiento robusto de documentos (imágenes, PDFs, Excel, etc.) asociados a equipos y órdenes de trabajo en Railway MySQL.

## Características

- **Almacenamiento Híbrido**: Archivos pequeños en base de datos (LONGBLOB), archivos grandes en almacenamiento externo (Vercel Blob, S3, etc)
- **Auditoría Completa**: Tabla `auditoria_documentos` que registra todas las acciones (subida, descarga, visualización, eliminación)
- **Gestión de Estado**: Control de ciclo de vida de documentos (activo, archivado, eliminado)
- **Tipos Soportados**: PDF, Excel, Word, imágenes (PNG, JPG), etc.

## Esquema de Base de Datos

### Tabla: documentos

```sql
CREATE TABLE documentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(50),                    -- 'manual', 'especificaciones', 'garantia', 'certificado', 'otro'
  nombre VARCHAR(255),                 -- Nombre del archivo
  descripcion TEXT,                    -- Descripción del documento
  ruta_archivo VARCHAR(500),           -- URL en almacenamiento externo
  contenido_archivo LONGBLOB,          -- Contenido binario (si se guarda en BD)
  tipo_archivo VARCHAR(50),            -- MIME type (image/png, application/pdf, etc)
  tamano INT,                          -- Tamaño en bytes
  equipo_id INT,                       -- FK a equipos
  orden_id INT,                        -- FK a ordenes_trabajo
  subido_por INT,                      -- FK a usuarios
  almacenado_en_bd BOOLEAN,            -- ¿Almacenado en BD o en almacenamiento externo?
  estado VARCHAR(50),                  -- 'activo', 'archivado', 'eliminado'
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (equipo_id) REFERENCES equipos(id),
  FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo(id),
  FOREIGN KEY (subido_por) REFERENCES usuarios(id),
  INDEX idx_equipo_id (equipo_id),
  INDEX idx_orden_id (orden_id),
  INDEX idx_tipo (tipo),
  INDEX idx_estado (estado)
);
```

### Tabla: auditoria_documentos

```sql
CREATE TABLE auditoria_documentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  documento_id INT,                    -- FK a documentos
  usuario_id INT,                      -- FK a usuarios (quien hizo la acción)
  accion VARCHAR(100),                 -- 'subida', 'descarga', 'visualizacion', 'eliminacion'
  descripcion TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP,
  
  FOREIGN KEY (documento_id) REFERENCES documentos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_documento_id (documento_id),
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_accion (accion)
);
```

## Integración en Detalles de Equipo

Los usuarios pueden subir documentos en la sección de detalles de equipo:

```typescript
// Ejemplo de subida de documento
const uploadDocument = async (
  file: File,
  equipoId: number,
  tipo: 'manual' | 'especificaciones' | 'garantia' | 'certificado' | 'otro'
) => {
  // 1. Subir archivo a Vercel Blob o almacenamiento externo
  // 2. Guardar referencia en tabla documentos
  // 3. Registrar auditoría en auditoria_documentos
};
```

## Almacenamiento de Archivos

### Opción 1: Almacenamiento en Base de Datos (LONGBLOB)
- **Ventaja**: No requiere configuración externa, todo en una base de datos
- **Desventaja**: Limita tamaño de archivos, ralentiza queries grandes
- **Uso**: Archivos pequeños (< 5MB)

```typescript
// Guardar contenido en BD
documento.contenido_archivo = Buffer.from(fileContent);
documento.almacenado_en_bd = true;
```

### Opción 2: Almacenamiento Externo (Recomendado)
- **Vercel Blob**: Para deployments en Vercel
- **AWS S3**: Para máxima flexibilidad
- **Google Cloud Storage**: Alternativa
- **Ventaja**: Escalable, rápido, sin límites de tamaño
- **Desventaja**: Requiere configuración de credenciales

```typescript
// Usar Vercel Blob
import { put } from '@vercel/blob';

const { url } = await put('equipos/' + equipoId + '/' + file.name, file, {
  access: 'private'
});

documento.ruta_archivo = url;
documento.almacenado_en_bd = false;
```

## Auditoría y Seguridad

Todas las operaciones en documentos se registran:

```typescript
// Registrar descarga
await auditoriaDocumento.create({
  documento_id: docId,
  usuario_id: userId,
  accion: 'descarga',
  ip_address: request.ip,
  user_agent: request.headers['user-agent']
});
```

## Variables de Entorno Requeridas

### Para Vercel Blob (Recomendado)
```env
BLOB_READ_WRITE_TOKEN=xxx
```

### Para S3
```env
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
S3_BUCKET_NAME=cmms-documents
```

## Ejemplo Completo: Subir Documento a Equipo

```typescript
// api/equipos/[id]/documentos/route.ts
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const tipo = formData.get('tipo') as string;
  const descripcion = formData.get('descripcion') as string;
  const equipoId = parseInt(params.id);
  
  // Validar archivo
  if (!file || file.size === 0) {
    return Response.json({ error: 'Archivo requerido' }, { status: 400 });
  }
  
  // Límite de tamaño: 50MB
  if (file.size > 50 * 1024 * 1024) {
    return Response.json({ error: 'Archivo demasiado grande' }, { status: 400 });
  }
  
  let rutaArchivo = null;
  let almacenadoEnBd = false;
  let contenidoArchivo = null;
  
  // Decidir dónde guardar
  if (file.size < 1 * 1024 * 1024) { // < 1MB en BD
    contenidoArchivo = await file.arrayBuffer();
    almacenadoEnBd = true;
  } else {
    // Usar Vercel Blob para archivos grandes
    const { url } = await put(`equipos/${equipoId}/${Date.now()}-${file.name}`, file);
    rutaArchivo = url;
  }
  
  // Guardar en BD
  const documento = await prisma.documento.create({
    data: {
      tipo,
      nombre: file.name,
      descripcion,
      ruta_archivo: rutaArchivo,
      contenido_archivo: contenidoArchivo ? Buffer.from(contenidoArchivo) : null,
      tipo_archivo: file.type,
      tamano: file.size,
      equipo_id: equipoId,
      subido_por: userId,
      almacenado_en_bd: almacenadoEnBd,
      estado: 'activo'
    }
  });
  
  // Registrar auditoría
  await prisma.auditoriaDocumento.create({
    data: {
      documento_id: documento.id,
      usuario_id: userId,
      accion: 'subida',
      descripcion: `Documento ${file.name} subido`
    }
  });
  
  return Response.json(documento);
}
```

## Mantenimiento de la Base de Datos

### Limpiar Documentos Eliminados
```sql
-- Eliminar documentos marcados como eliminados hace más de 30 días
DELETE FROM documentos 
WHERE estado = 'eliminado' 
AND updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### Ver Auditoría de un Documento
```sql
SELECT a.accion, u.nombre, a.created_at 
FROM auditoria_documentos a
JOIN usuarios u ON a.usuario_id = u.id
WHERE a.documento_id = ?
ORDER BY a.created_at DESC;
```

## Pasos para Activar en Railway

1. **Crear migración** (ya hecha):
   ```bash
   npx prisma migrate deploy
   ```

2. **En detalles de equipo**, agregar UI para subir documentos

3. **Configurar almacenamiento**:
   - Si usas Vercel Blob: agregar `BLOB_READ_WRITE_TOKEN`
   - Si usas S3: agregar credenciales AWS

4. **Implementar API endpoints** para:
   - POST: Subir documentos
   - GET: Descargar documentos
   - DELETE: Soft delete de documentos
   - GET: Listar documentos por equipo

## Límites y Consideraciones

| Concepto | Límite | Nota |
|----------|--------|------|
| Tamaño máximo archivo | 50MB | Configurable |
| Almacenamiento en BD | 1MB | Recomendado |
| Tipos de archivo | Ilimitados | Validar en API |
| Historial auditoría | Indefinido | Considerar limpieza periódica |

## Soporte de Tipos de Archivo

| Tipo | MIME | Tamaño Recomendado |
|------|------|-------------------|
| PDF | application/pdf | < 50MB |
| Excel | application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | < 10MB |
| Imagen | image/png, image/jpeg, image/webp | < 5MB |
| Word | application/vnd.openxmlformats-officedocument.wordprocessingml.document | < 25MB |
| ZIP | application/zip | < 50MB |
