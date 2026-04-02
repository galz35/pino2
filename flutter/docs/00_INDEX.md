# Flutter Docs

## Estado actual

Este directorio documenta la estructura real del frente móvil activo de `pino`.

## Archivos principales

- `01_ESTRUCTURA_ACTIVA_VS_REFERENCIA.md`
- `02_MAPA_MODULOS_Y_FLUJOS.md`
- `03_MAPA_API_MOVIL.md`
- `04_ALCANCE_ACTUAL_100.md`
- `05_PDF_FACTURA_MOVIL_Y_DISPOSITIVOS_BAJA_GAMA.md`

## Regla operativa

La app Flutter activa vive en:

- `lib/app`
- `lib/core`
- `lib/features`
- `lib/main.dart`

Los módulos móviles activos hoy son:

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

El material importado desde Gemini que no forma parte de la app activa vive en:

- `../flutter_reference/gemini_import/`
