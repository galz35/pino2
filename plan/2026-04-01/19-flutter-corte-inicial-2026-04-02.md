# 19 - Flutter Corte Operativo 2026-04-02

## 1. Objetivo del corte

Salir de cero y dejar una app móvil útil conectada al backend actual de `pino`.

## 2. Lo que quedó implementado

- bootstrap Flutter real en `flutter/lib/main.dart`
- `ProviderScope` y app shell
- router con `go_router`
- runtime config para:
  - API base
  - socket base
  - socket path
  - namespace
- cliente HTTP con `dio`
- almacenamiento seguro con `flutter_secure_storage`
- repositorio de autenticación
- controlador de sesión con Riverpod
- `SplashScreen`
- `LoginScreen`
- `HomeScreen`
- lectura de tiendas asignadas del usuario
- normalización de rol para UI móvil
- base local con `drift`
- cache offline de tiendas asignadas
- bitácora local de eventos realtime
- cola offline base para acciones futuras
- integración inicial entre `home`, `realtime` y persistencia local
- `ProductCatalogScreen`
- `ClientPortfolioScreen`
- `QuickOrderScreen`
- `RouteBoardScreen`
- `CollectionsScreen`
- `ReturnsScreen`
- `WarehouseBoardScreen`

## 3. Validación técnica

Validado en este corte:

- `flutter analyze` -> OK
- `flutter test` -> OK
- `build_runner` / generación Drift -> OK

## 4. Hallazgo importante del repo

Se corrigió un problema de versionado:

- `flutter` estaba como gitlink `160000`
- no existía `.gitmodules`
- el repo padre no podía absorber archivos móviles

Se convirtió `flutter/` en carpeta normal del repo principal para poder versionar la app móvil dentro de `pino`.

## 5. Lo que falta ahora

- procesador real de cola offline
- sincronización online/offline por conectividad
- listeners realtime conectados a features de negocio
- bodega especializada con escaneo y hardware

## 6. Estado honesto

Flutter ya no está en cero.

Sí está listo dentro del alcance móvil actual.

Este corte deja una base sólida para seguir trabajando sin volver a empezar desde el template.

Ahora Flutter ya tiene:

- sesión real
- shell navegable
- cache local útil
- realtime base
- home móvil por rol con acción principal rápida
- catálogo operativo móvil
- cartera básica de clientes móvil
- tablero de ruta y entregas móvil
- preventa rápida de una sola pantalla
- cobros rápidos
- devoluciones rápidas
- tablero de bodega por estados
- estructura lista para entrar a sync completo y hardware
