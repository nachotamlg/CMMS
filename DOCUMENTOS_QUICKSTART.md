# Almacenamiento de Documentos - Guía Rápida

## ¿Qué se cambió?

Se actualizó completamente el sistema de base de datos en Railway para guardar documentos (imágenes, PDFs, Excel, etc.) en detalles de equipos con auditoría automática.

## Tablas Nuevas/Modificadas

```
documentos              ← Mejorada con soporte para almacenamiento BD y externo
├── id
├── tipo              (manual, especificaciones, garantia, certificado, otro)
├── nombre
├── contenido_archivo (LONGBLOB para files < 1MB)
├── ruta_archivo      (URL en Vercel Blob para files >= 1MB)
├── tamano
├── almacenado_en_bd  (boolean)
├── estado            (activo, archivado, eliminado)
├── equipo_id         (FK)
├── orden_id          (FK)
└── subido_por        (FK)

auditoria_documentos   ← NUEVA: registra todas las acciones
├── id
├── documento_id      (FK)
├── usuario_id        (FK)
├── accion            (subida, descarga, visualizacion, eliminacion)
├── ip_address
├── user_agent
└── created_at
```

## Archivos Creados/Modificados

### Documentación
```
docs/DATABASE_IMPROVEMENTS.md  ← Guía COMPLETA (leer primero!)
docs/DOCUMENT_STORAGE.md       ← Detalles técnicos de almacenamiento
docs/RAILWAY_SETUP.md          ← Setup en Railway
DOCUMENTOS_QUICKSTART.md       ← Esta guía
```

### Base de Datos
```
scripts/init-mysql.sql         ← Script SQL mejorado
prisma/schema.prisma           ← Schema actualizado
prisma/migrations/improve_document_storage_and_auditing/migration.sql ← Nueva migración
```

### API Endpoints
```
app/api/equipos/[id]/documentos         ← POST subir, GET listar
app/api/documentos/[id]                 ← GET metadata, DELETE soft delete
app/api/documentos/[id]/descarga        ← GET descarga con auditoría
```

## Pasos para Activar

### 1. Deploy a Railway
```bash
# Solo push a rama conectada a Railway
# Railway ejecutará automáticamente:
# - npx prisma migrate deploy (crea tablas)
# - npm run build
```

### 2. Verificar Base de Datos
```bash
# En Railway CLI
railway run mysql -h $MYSQL_HOSTNAME -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE

# Dentro de MySQL:
SHOW TABLES;  # Debe mostrar 'documentos' y 'auditoria_documentos'
```

### 3. Configurar Almacenamiento (Opcional)
Para archivos > 1MB, agregar en Railway:
```env
BLOB_READ_WRITE_TOKEN=xxx  # Obtener de https://vercel.com/docs/storage/vercel-blob
```

Sin este token, los archivos > 1MB se rechazarán.

## Usar en Detalles de Equipo

### Subir Documento
```typescript
// app/detalles-equipo/[id]/page.tsx
const subirDocumento = async (file: File) => {
  const formData = new FormData();
  formData.append('archivo', file);
  formData.append('descripcion', 'Mi manual');
  formData.append('subido_por_id', userId);
  
  const res = await fetch(`/api/equipos/${equipoId}/documentos`, {
    method: 'POST',
    body: formData
  });
  
  return res.json();
};
```

### Listar Documentos
```typescript
const documentos = await fetch(`/api/equipos/${equipoId}/documentos`);
const lista = await documentos.json();

// Mostrar
lista.map(doc => (
  <div key={doc.id}>
    <h4>{doc.nombre}</h4>
    <p>{(doc.tamano / 1024 / 1024).toFixed(2)} MB</p>
    <button onClick={() => descargar(doc.id)}>Descargar</button>
    <button onClick={() => eliminar(doc.id)}>Eliminar</button>
  </div>
))
```

### Descargar Documento
```typescript
const descargar = async (documentoId: number) => {
  window.location.href = `/api/documentos/${documentoId}/descarga`;
  // Automáticamente registra en auditoría
};
```

### Eliminar Documento
```typescript
const eliminar = async (documentoId: number) => {
  const res = await fetch(`/api/documentos/${documentoId}`, {
    method: 'DELETE'
  });
  // Soft delete: marca como eliminado, no borra
};
```

## Límites

| Límite | Valor |
|--------|-------|
| Tamaño máximo | 50 MB |
| Umbral BD→Blob | 1 MB |
| Tipos soportados | PDF, Excel, Word, Imagen, ZIP (cualquiera) |

## Auditoría

Toda acción se registra automáticamente:

```sql
-- Ver todas las descargas
SELECT d.nombre, u.nombre, a.created_at, a.ip_address
FROM auditoria_documentos a
JOIN documentos d ON a.documento_id = d.id
JOIN usuarios u ON a.usuario_id = u.id
WHERE a.accion = 'descarga'
ORDER BY a.created_at DESC;
```

## Soft Delete

Los documentos NO se eliminan, se marcan como "eliminado":

```sql
-- Documentos activos
SELECT * FROM documentos WHERE estado = 'activo';

-- Documentos eliminados (recuperables)
SELECT * FROM documentos WHERE estado = 'eliminado';

-- Recuperar documento
UPDATE documentos SET estado = 'activo' WHERE id = 5;

-- Limpiar documentos eliminados hace > 30 días
DELETE FROM documentos WHERE estado = 'eliminado' AND updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## Troubleshooting

### Error: "Archivo demasiado grande"
→ Máximo 50MB. Configurar en `app/api/equipos/[id]/documentos/route.ts`

### Error: "Almacenamiento externo no disponible"
→ Archivo > 1MB pero sin `BLOB_READ_WRITE_TOKEN`. Agregar token en Railway.

### La descarga no registra auditoría
→ Verificar que `AuditoriaDocumento` existe en base de datos

## Lectura Recomendada

1. **Primero**: `docs/DATABASE_IMPROVEMENTS.md` (visión general completa)
2. **Luego**: `docs/DOCUMENT_STORAGE.md` (detalles técnicos)
3. **Entonces**: `docs/RAILWAY_SETUP.md` (configuración Railway)
4. **Finalmente**: Revisar endpoints en `app/api/documentos/` y `app/api/equipos/[id]/documentos/`

## Soporte

Si hay problemas:
1. Verificar logs en Railway Dashboard
2. Ejecutar `npx prisma db execute` para debugging SQL
3. Revisar tablas: `SHOW COLUMNS FROM documentos;`
4. Verificar relaciones: `DESCRIBE auditoria_documentos;`
