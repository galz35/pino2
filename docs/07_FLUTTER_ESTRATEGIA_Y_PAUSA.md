# Flutter: Estrategia y Alcance Actual
Fecha de corte: 2026-04-02

## 1. Estado real hoy

Flutter ya no está solo en investigación.

Hoy existe una app móvil operativa dentro del alcance actual.

Lo que si existe hoy:

- SDK instalado localmente en `/root/develop/flutter`
- version validada: `Flutter 3.41.6` y `Dart 3.11.4`
- scaffold real creado en `flutter/`
- dependencias base ya agregadas en `flutter/pubspec.yaml`
- bootstrap real de aplicación
- runtime config para API y Socket.IO
- login conectado al backend NestJS actual
- sesión persistida con `flutter_secure_storage`
- router base con `go_router`
- splash screen y home inicial por rol
- home móvil orientado a acción rápida por rol
- preventa rápida de una sola pantalla
- catálogo operativo móvil
- clientes móvil
- ruta y entregas móvil
- cobros móviles
- devoluciones móviles
- bodega móvil por estados
- `flutter analyze` limpio
- `flutter test` limpio

Lo que no existe todavia:

- procesador de sync offline completo
- conectividad con reconciliación automática
- hardware específico de impresión / escaneo
- bodega móvil especializada de escaneo/carga
- factura fiscal móvil completa con impresión/hardware real

En otras palabras: la carpeta `flutter/` ya es una app móvil útil y operativa, aunque todavía no es la versión final offline/hardware-heavy.

## 2. Stack recomendado para este proyecto

El stack elegido para continuar despues es este:

- `flutter_riverpod`
  - estado y DI
  - decision: arrancar con Riverpod normal, sin generator al inicio
- `go_router`
  - navegacion declarativa y control de guards por sesion/rol
- `dio`
  - cliente HTTP principal para la API NestJS
- `flutter_secure_storage`
  - guardar access token y refresh token
- `connectivity_plus`
  - detectar online/offline para sync
- `socket_io_client`
  - compatible con el backend actual por Socket.IO
- `drift`
  - base local y cola de trabajo offline
- `sqlite3_flutter_libs`
  - soporte nativo SQLite para `drift`
- `path_provider` y `path`
  - manejo de rutas locales

## 3. Paquetes realmente agregados al repo

Estas dependencias ya estan en `flutter/pubspec.yaml`:

- `flutter_riverpod: ^3.3.1`
- `go_router: ^17.1.0`
- `dio: ^5.9.2`
- `flutter_secure_storage: ^10.0.0`
- `connectivity_plus: ^7.1.0`
- `socket_io_client: ^3.1.4`
- `drift: ^2.32.1`
- `sqlite3_flutter_libs: ^0.6.0+eol`
- `path_provider: ^2.1.5`
- `path: ^1.9.1`
- `build_runner: ^2.13.1` (dev)
- `drift_dev: ^2.32.1` (dev)

## 4. Criterios tecnicos decididos

### 4.1 Integracion con el backend actual

La app movil futura debe integrarse con la API publica existente, no con `localhost`.

Contrato base recomendado:

- API base: `https://www.rhclaroni.com/api-dev`
- host socket: `https://www.rhclaroni.com`
- socket path: `/api-dev/socket.io`
- namespace realtime: `/events`

### 4.2 Estado y arquitectura

La decision recomendada para `pino` movil es:

- `feature-first`
- `Riverpod` para estado
- `Dio` para REST
- `Drift` para cache local y cola offline
- `Socket.IO` para eventos push del backend

No conviene meter arquitectura excesiva antes de tener login, shell y sync basicos funcionando.

### 4.3 Code generation

Por ahora no conviene arrancar con demasiada generacion adicional.

Decision:

- si se retoma Flutter, empezar con `Riverpod` normal
- agregar code generation solo cuando los modelos y contratos ya esten estables

Razon:

- baja friccion inicial
- menos complejidad para Gemini local o futuras IAs
- menos puntos de falla mientras el backend ya es la fuente de verdad

## 5. Estado del codigo Flutter en el repo

Archivos relevantes hoy:

- `flutter/pubspec.yaml`
- `flutter/pubspec.lock`
- `flutter/lib/main.dart`
- `flutter/README.md`
- `flutter/lib/app/`
- `flutter/lib/core/`
- `flutter/lib/features/auth/`
- `flutter/lib/features/home/`
- `flutter/lib/features/catalog/`
- `flutter/lib/features/clients/`
- `flutter/lib/features/deliveries/`
- `flutter/lib/features/orders/`
- `flutter/lib/features/collections/`
- `flutter/lib/features/returns/`
- `flutter/lib/features/warehouse/`
- `flutter/lib/features/startup/`

Observacion importante:

- `flutter/lib/main.dart` ya no es el template roto inicial
- existe un primer corte funcional con auth y navegación
- existe base local `drift`, cache offline y realtime base
- hoy la cache local ya cubre tiendas, catálogo, clientes, cartera, resumen de cobranza, rutas y entregas
- pedido rápido, cobro y devolución ya pueden caer a cola local si falla conectividad
- la cola ya intenta reprocesarse cuando vuelve internet
- la sesión ya puede restaurarse con tolerancia a caída de red
- las pantallas críticas móviles ya se refrescan otra vez cuando vuelve internet o termina la cola local
- ya existe comprobante PDF liviano y opcional para pedido/cobro
- ya existe el primer corte real de preventa, catálogo, clientes, ruta, cobros, devoluciones y bodega
- todavía falta procesamiento offline completo

## 6. Reparacion de versionado

Se corrigió un problema real del repo:

- `flutter` estaba registrado en git como un gitlink `160000`
- no existía `.gitmodules`
- eso impedía versionar archivos Flutter dentro del repo principal

En este corte se reemplazó ese gitlink roto por una carpeta normal versionable dentro de `pino`.

## 7. Orden correcto para continuar
El orden correcto desde este corte es:

1. procesador real de sync offline
2. reconciliación de conectividad
3. integrar realtime más profundo en features
4. cache offline de más dominios críticos y replay más fino
5. bodega especializada con escaneo
6. reconciliación y sync offline completo

No conviene saltar directo a features pesadas sin cerrar primero persistencia local y sincronización.

## 8. Decision actual

Flutter quedó reactivado y ya cubre el alcance móvil actual.

Fuente de verdad actual del producto:

- backend NestJS
- frontend React

Para continuar, este documento y `plan/2026-04-01/19-flutter-corte-inicial-2026-04-02.md` son el punto de partida correcto.

## 10. Regla UX ya fijada

La regla operativa del móvil queda así:

- el usuario de calle y bodega no debe pelear con la app
- la app debe seguir el ritmo de trabajo del usuario
- la acción principal debe resolverse en segundos
- se prioriza una pantalla fuerte con acciones grandes antes que flujos largos de muchas vistas
- la captura rápida de pedido es prioritaria sobre una navegación bonita pero lenta

Por eso el corte actual quedó así:

- `Preventa rápida` como acción principal para venta/gestión
- `Ruta y entregas` como acción principal para rutero/despacho
- `Bodega` como acción principal para inventario/almacén
- `Cobros` y `Devoluciones` como flujos de apoyo rápidos
- `Catálogo` y `Clientes` como apoyo inmediato, no como laberinto

## 11. Decisión actual sobre PDF móvil

Si entra factura o comprobante PDF en Flutter:

- debe ser opcional
- no debe bloquear la operación principal
- no debe depender de visor embebido pesado
- se recomienda `pdf` + `share_plus`
- no se recomienda arrancar con `printing` como flujo principal en baja gama

Referencia:

- `flutter/docs/05_PDF_FACTURA_MOVIL_Y_DISPOSITIVOS_BAJA_GAMA.md`

## 9. Fuentes oficiales revisadas

- Flutter app architecture:
  - https://docs.flutter.dev/app-architecture
- Flutter offline-first:
  - https://docs.flutter.dev/app-architecture/design-patterns/offline-first
- Flutter authenticated requests:
  - https://docs.flutter.dev/cookbook/networking/authenticated-requests
- Flutter websockets:
  - https://docs.flutter.dev/cookbook/networking/web-sockets
- Riverpod:
  - https://riverpod.dev/
- `go_router`:
  - https://pub.dev/documentation/go_router/latest/go_router/
- `socket_io_client`:
  - https://pub.dev/packages/socket_io_client
