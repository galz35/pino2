# pino_mobile

Estado actual: app móvil operativa dentro del alcance actual.

Esta carpeta ya no es solo un scaffold. Aquí vive la app móvil real de `pino` para operación rápida de calle y bodega.

## Qué existe hoy

- login real contra backend NestJS
- sesión persistida
- router con `go_router`
- API client con `dio`
- cache local con `drift`
- cache local de tiendas, catálogo, clientes, cartera, resumen de cobranza, rutas y entregas
- bitácora de eventos realtime
- cola offline base
- pedido, cobro y devolución con fallback a cola local por caída de red
- procesador automático de cola cuando vuelve la conectividad
- refresco online-first automático en pantallas críticas cuando vuelve internet o termina la cola
- sesión restaurable aun si la red falla al abrir la app
- home rápido por rol
- preventa rápida
- catálogo operativo
- cartera de clientes
- ruta y entregas
- cobros
- devoluciones
- tablero de bodega
- comprobante PDF opcional y liviano para pedido/cobro

## Qué queda para fase 2

- procesador completo de sync offline
- reconciliación automática por conectividad
- hardware específico de impresión / escaneo
- optimización fina por dispositivo industrial
- replay automático integral de pedidos/cobros/devoluciones

## Stack actual

- `flutter_riverpod`
- `go_router`
- `dio`
- `flutter_secure_storage`
- `connectivity_plus`
- `socket_io_client`
- `drift`
- `sqlite3_flutter_libs`

## Fuente de verdad para continuar

Leer primero:

1. `docs/00_INDEX.md`
2. `docs/02_MAPA_MODULOS_Y_FLUJOS.md`
3. `docs/03_MAPA_API_MOVIL.md`
4. `../docs/07_FLUTTER_ESTRATEGIA_Y_PAUSA.md`
