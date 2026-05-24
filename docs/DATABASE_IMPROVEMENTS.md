# Mejoras de Base de Datos - Almacenamiento de Documentos

## Resumen de Cambios

Se ha actualizado completamente el sistema de inicialización de base de datos en Railway MySQL para soportar almacenamiento robusto de documentos (imágenes, PDFs, Excel, etc.) con auditoría completa.

## Cambios Realizados

### 1. Script SQL Mejorado (`scripts/init-mysql.sql`)

**Tabla de Documentos Actualizada:**
- Nuevos campos: `descripcion`, `estado`, `almacenado_en_bd`
- Soporte para `LONGBLOB` para almacenar archivos directamente en BD
- Soporte para rutas externas (Vercel Blob, S3, etc.)
- Campo `estado` para control de ciclo de vida: `activo`, `archivado`, `eliminado`
- Índices optimizados para búsquedas rápidas
- Relaciones con equipos Y órdenes de trabajo

**Nueva Tabla de Auditoría (`auditoria_documentos`):**
- Registra todas las acciones: subida, descarga, visualización, eliminación
- Incluye IP address y user-agent para trazabilidad
- Timestamps precisos para cada acción
- Índices para búsquedas por documento, usuario y acción

### 2. Schema Prisma Actualizado (`prisma/schema.prisma`)

```prisma
model Documento {
  id                Int      @id @default(autoincrement())
  tipo              String   // manual, especificaciones, garantia, certificado, otro
  nombre            String
  descripcion       String?
  ruta_archivo      String?  // Para almacenamiento externo
  contenido_archivo Bytes?   // Para almacenamiento en BD (LONGBLOB)
  tipo_archivo      String   // MIME type
  tamano            Int      // Tamaño en bytes
  equipo_id         Int?
  orden_id          Int?
  subido_por        Int
  almacenado_en_bd  Boolean  @default(false)
  estado            String   @default("activo")
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  equipo            Equipo? @relation(fields: [equipo_id], references: [id])
  orden             OrdenTrabajo? @relation(fields: [orden_id], references: [id])
  usuario           Usuario @relation(fields: [subido_por], references: [id])
  auditoria         AuditoriaDocumento[]
}

model AuditoriaDocumento {
  id           Int      @id @default(autoincrement())
  documento_id Int
  usuario_id   Int
  accion       String   // subida, descarga, visualizacion, eliminacion
  descripcion  String?
  ip_address   String?
  user_agent   String?
  created_at   DateTime @default(now())
  
  documento Documento @relation(fields: [documento_id], references: [id])
  usuario   Usuario @relation("AuditoriaDocumento", fields: [usuario_id], references: [id])
}
```

### 3. Migración de Prisma (`prisma/migrations/improve_document_storage_and_auditing/`)

Archivo SQL que:
- Modifica tabla `documentos` existente
- Crea tabla `auditoria_documentos` nueva
- Añade índices optimizados

### 4. Endpoints API Mejorados

#### POST `/api/equipos/[id]/documentos`
- Subida de documentos a equipos
- Detección automática de tipo de documento basado en extensión
- Almacenamiento híbrido: BD para < 1MB, Vercel Blob para archivos mayores
- Registra auditoría automáticamente
- Soporta descripción de documentos

```bash
curl -X POST http://localhost:3000/api/equipos/1/documentos \
  -F "archivo=@manual.pdf" \
  -F "tipo=manual" \
  -F "descripcion=Manual de usuario" \
  -F "subido_por_id=1"
```

#### GET `/api/equipos/[id]/documentos`
- Obtiene lista de documentos de un equipo
- Filtrable por tipo y estado
- Incluye información del usuario que subió

```bash
curl http://localhost:3000/api/equipos/1/documentos?tipo=manual&estado=activo
```

#### GET `/api/documentos/[id]`
- Obtiene metadatos del documento (sin contenido binario)
- Información de usuario y referencias

#### GET `/api/documentos/[id]/descarga`
- Descarga el documento
- Registra automáticamente acción en auditoría
- Si está en BD: devuelve contenido directo
- Si está en almacenamiento externo: redirige a URL

```bash
curl -O http://localhost:3000/api/documentos/5/descarga
```

#### DELETE `/api/documentos/[id]`
- Soft delete: marca documento como eliminado (no lo borra)
- Registra acción en auditoría
- Mantiene contenido para recuperación

```bash
curl -X DELETE http://localhost:3000/api/documentos/5
```

### 5. Características de Auditoría

Todas las operaciones de documentos se registran automáticamente en `auditoria_documentos`:

```sql
SELECT a.accion, u.nombre, a.created_at, a.ip_address
FROM auditoria_documentos a
JOIN usuarios u ON a.usuario_id = u.id
WHERE a.documento_id = 5
ORDER BY a.created_at DESC;
```

Registra:
- **Subida**: Quién, cuándo, dónde desde
- **Descarga**: Quién descargó, cuándo, desde dónde
- **Eliminación**: Quién eliminó, cuándo, desde dónde
- **Visualización**: Auditoría disponible para implementar

### 6. Almacenamiento Híbrido

El sistema automáticamente decide dónde guardar:

```
Archivo < 1MB → Base de Datos (LONGBLOB)
              └─ Descargas rápidas
              └─ Sin dependencias externas
              
Archivo >= 1MB → Vercel Blob (o S3)
                └─ Escalable
                └─ Sin limitar BD
                └─ Requiere BLOB_READ_WRITE_TOKEN
```

## Pasos de Implementación en Railway

### 1. Ejecutar Migración
```bash
# Opción A: Automáticamente en build
# En package.json, el build script ya incluye: npx prisma migrate deploy

# Opción B: Manual vía Railway CLI
railway run npx prisma migrate deploy
```

### 2. Configurar Variables de Entorno
En Railway Dashboard, agregar:
```env
BLOB_READ_WRITE_TOKEN=your_token_here  # Opcional, para archivos > 1MB
```

### 3. Verificar Creación de Tablas
```bash
railroad run mysql -h $MYSQL_HOSTNAME -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE
> SHOW TABLES;
> DESCRIBE documentos;
> DESCRIBE auditoria_documentos;
```

## Validaciones y Límites

| Aspecto | Valor | Notas |
|---------|-------|-------|
| Tamaño máximo de archivo | 50 MB | Configurable en API |
| Tamaño umbral BD → Blob | 1 MB | Configurable en endpoint |
| Tipos soportados | PDF, Excel, Word, Imagen, ZIP | Extensible |
| Retención auditoría | Indefinida | Limpiar manualmente si es necesario |
| Recuperación soft delete | 30 días (recomendado) | Configurable con cron job |

## Consultas SQL Útiles

### Ver todos los documentos de un equipo
```sql
SELECT d.nombre, d.tipo, d.tamano, u.nombre as subido_por, d.created_at
FROM documentos d
JOIN usuarios u ON d.subido_por = u.id
WHERE d.equipo_id = 1 AND d.estado = 'activo'
ORDER BY d.created_at DESC;
```

### Ver historial de descargas
```sql
SELECT d.nombre, u.nombre as usuario, a.created_at, a.ip_address
FROM auditoria_documentos a
JOIN documentos d ON a.documento_id = d.id
JOIN usuarios u ON a.usuario_id = u.id
WHERE a.accion = 'descarga'
ORDER BY a.created_at DESC
LIMIT 100;
```

### Limpiar documentos eliminados (> 30 días)
```sql
DELETE FROM documentos 
WHERE estado = 'eliminado' 
AND updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### Tamaño de documentos por equipo
```sql
SELECT e.nombre, COUNT(*) as cantidad, SUM(d.tamano) as tamaño_total_bytes
FROM documentos d
JOIN equipos e ON d.equipo_id = e.id
WHERE d.estado = 'activo'
GROUP BY e.id
ORDER BY tamaño_total_bytes DESC;
```

## Integración en UI (Detalles de Equipo)

El componente de detalles de equipo puede mostrar:

1. **Lista de Documentos Existentes**
   ```
   - Manual PDF (523 KB) - Subido por Admin - 15 min
   - Especificaciones (2.1 MB) - Subido por Tech - 2 días
   - Garantía Imagen (1.4 MB) - Subido por Admin - 1 semana
   ```

2. **Formulario de Subida**
   ```
   - Selector de tipo de documento
   - Input de archivo con drag-drop
   - Campo de descripción opcional
   - Barra de progreso
   ```

3. **Acciones por Documento**
   - Descargar (registra en auditoría)
   - Ver detalles (metadata)
   - Eliminar (soft delete, recuperable)

## Seguridad

- ✅ Auditoría completa de acceso a documentos
- ✅ Soft delete para recuperación
- ✅ Registro de IP y user-agent
- ✅ Control de tamaño de archivos
- ✅ Validación de tipos MIME
- ✅ Relaciones con usuarios para trazabilidad
- ✅ Índices para búsquedas rápidas sin full scan

## Próximas Mejoras Posibles

1. **Búsqueda de Contenido**: Indexación FTS para buscar dentro de PDFs
2. **Versioning**: Mantener historial de versiones de documentos
3. **Compartir Documentos**: Tabla de permisos de lectura/escritura
4. **Notificaciones**: Alertar cuando se añaden documentos importantes
5. **Clasificación**: Tags y categorías para mejor organización

## Documentación Adicional

- `docs/DOCUMENT_STORAGE.md` - Guía completa de almacenamiento
- `docs/RAILWAY_SETUP.md` - Configuración en Railway
