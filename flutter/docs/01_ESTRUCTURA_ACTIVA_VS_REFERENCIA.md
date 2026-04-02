# Estructura Activa vs Referencia

Fecha de corte: 2026-04-02

## 1. App Flutter activa

La aplicación móvil que hoy sí se considera activa y válida para seguir construyendo quedó en esta estructura:

- `lib/app`
- `lib/core`
- `lib/features`
- `lib/main.dart`

### Capas activas

- `lib/app`
  - shell, router y tema principal
- `lib/core`
  - config, red, storage, realtime y base local
- `lib/features`
  - módulos vigentes:
    - `auth`
    - `home`
    - `catalog`
    - `clients`
    - `orders`
    - `deliveries`
    - `collections`
    - `returns`
    - `warehouse`
    - `startup`

## 2. Material importado desde Gemini

El material descargado desde Gemini no se dejó mezclado dentro del árbol activo.

Se movió a:

- `../flutter_reference/gemini_import/source/`
- `../flutter_reference/gemini_import/diagnostics/`

### Qué contiene `source/`

- arquitectura alternativa con estas capas:
  - `lib/config`
  - `lib/data`
  - `lib/domain`
  - `lib/infrastructure`
  - `lib/presentation`
- assets experimentales
- piezas Android específicas no integradas al paquete activo

### Qué contiene `diagnostics/`

- salidas de `analyze`
- logs de `build_runner`
- archivos de errores
- artefactos de pruebas manuales del import

## 3. Criterio de orden aplicado

Se aplicó esta regla:

- lo que hoy compone la app real queda en `lib/app`, `lib/core`, `lib/features`
- lo que vino como dump de referencia queda fuera del árbol activo
- lo diagnóstico no se deja suelto en la raíz de `flutter/`

## 4. Beneficio del orden

Con esta separación:

- la app activa queda legible
- el material de Gemini no se pierde
- la referencia experimental sigue disponible
- futuras integraciones pueden tomarse por partes sin contaminar la app real

## 5. Regla para próximos cortes

Si se rescata algo de `../flutter_reference/gemini_import/source/`, debe pasar por integración explícita hacia una de estas capas:

- `lib/app`
- `lib/core`
- `lib/features`

No se debe volver a soltar código masivo experimental directamente dentro de `lib/`.
