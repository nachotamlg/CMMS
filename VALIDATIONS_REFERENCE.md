# Validaciones Implementadas

## Validaciones de Equipos

### Código Institucional
- **Obligatorio**: Sí
- **Formato**: Exactamente 12 dígitos numéricos
- **Regla de Duplicado**: No puede existir otro equipo con el mismo código
- **Validación**: Frontend + Backend

### Número de Serie
- **Obligatorio**: Sí
- **Longitud**: Mínimo 3 caracteres
- **Regla de Duplicado**: No puede existir otro equipo con el mismo número de serie
- **Validación**: Frontend + Backend

### Estado de Equipo
- **Obligatorio**: Sí
- **Valores Permitidos**: 
  - operativo
  - mantenimiento
  - en reparacion
  - fuera de servicio
  - nuevo
- **Validación**: Frontend + Backend

### Nivel de Riesgo (Criticidad)
- **Obligatorio**: Sí
- **Valores Permitidos**:
  - alto
  - media
  - bajo
- **Validación**: Frontend + Backend

## Validaciones de Mantenimiento Programado

### Fechas de Mantenimiento
Las validaciones de fechas están basadas en la frecuencia del mantenimiento y la última realización.

#### Reglas Generales
1. **No puede ser fecha pasada**: La próxima fecha de mantenimiento no puede ser más de 1 día en el pasado
2. **Límite máximo**: No puede programarse más de 2 años en el futuro (si no hay última realización)
3. **Respeto de frecuencia**: Si existe última realización, debe considerar la frecuencia

#### Validación con Última Realización
Si hay un registro de última realización:
- La próxima fecha DEBE estar mínimo `frecuencia_dias` después de la última realización
- La próxima fecha NO DEBE estar más de `frecuencia_dias + 30` después de la última realización

**Ejemplo**: 
- Último mantenimiento: 1 de enero
- Frecuencia: Mensual (30 días)
- Rango válido: 31 de enero - 2 de marzo
- Fechas inválidas: 15 de enero (muy pronto), 15 de marzo (muy lejano)

#### Validación sin Última Realización
Si no hay registro de última realización:
- La próxima fecha debe ser razonable (entre hoy y 2 años)
- Se puede programar dentro de la ventana de frecuencia normal

### Frecuencias Soportadas
| Frecuencia | Días |
|------------|------|
| Diaria | 1 |
| Semanal | 7 |
| Quincenal | 15 |
| Mensual | 30 |
| Bimensual | 60 |
| Trimestral | 90 |
| Semestral | 180 |
| Anual | 365 |

### Campos Obligatorios
- Tipo de mantenimiento
- Frecuencia
- Descripción
- Fecha próxima programada

## Ubicación de Validaciones

### Frontend (Client-Side)
- `components/equipment-form.tsx` - Validación de equipos
- `components/maintenance-date-suggester.tsx` - Sugerencias de fechas

### Backend (Server-Side)
- `app/actions/equipos.ts` - Validaciones de servidor para equipos
- `app/actions/mantenimientos.ts` - Validaciones de servidor para mantenimiento
- `app/api/equipos/route.ts` - Validaciones en API para equipos
- `app/api/mantenimientos/route.ts` - Validaciones en API para mantenimiento

### Utilidades
- `lib/validation/maintenance-validation.ts` - Funciones reutilizables de validación de mantenimiento

## Mensajes de Error

### Equipos
- "El código institucional debe tener exactamente 12 dígitos"
- "Ya existe un equipo con este código institucional"
- "Ya existe un equipo con este número de serie"
- "El estado del equipo es obligatorio"
- "El nivel de riesgo es obligatorio"

### Mantenimiento
- "La fecha de próximo mantenimiento no puede ser una fecha pasada"
- "La próxima fecha debe estar al menos X días después de la última realización (Frecuencia). Actualmente hay Y días."
- "La próxima fecha es demasiado lejana. No debe exceder X días desde la última realización."
- "La fecha de próximo mantenimiento no puede ser más de 2 años en el futuro"

## Sugerencias de Fechas

El componente `MaintenanceDateSuggester` ahora:
1. Calcula automáticamente fechas recomendadas basadas en frecuencia
2. Considera la última realización para determinar el punto de inicio
3. Genera 5 sugerencias de fechas válidas
4. Asigna puntuaciones basadas en qué tan bien se ajustan a la frecuencia

## Testing

Para probar las validaciones:

1. **Código institucional**: Intenta crear dos equipos con el mismo código de 12 dígitos
2. **Número de serie**: Intenta duplicar un número de serie
3. **Mantenimiento**: Intenta programar un mantenimiento en fecha pasada o muy lejana
4. **Frecuencia**: Crea mantenimiento con fecha de última realización y verifica que respete la frecuencia
