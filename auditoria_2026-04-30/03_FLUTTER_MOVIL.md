# Auditoria Flutter Movil

Fecha: 2026-04-30
Ruta: `/opt/apps/pino2/flutter`

## Stack detectado

- Flutter/Dart SDK >= 3.10.
- Riverpod para estado.
- GoRouter para rutas.
- Dio para API.
- flutter_secure_storage y shared_preferences para sesion/config.
- Drift + sqlite3_flutter_libs para cache local.
- connectivity_plus para conectividad.
- socket_io_client para realtime.
- Firebase Messaging y notificaciones locales.
- PDF/share/geolocator/url_launcher para operacion movil.

## Que tiene

### Arquitectura

- `app/router`: rutas y proteccion por estado de autenticacion.
- `core/network`: API client, conectividad, delta sync, procesador de cola.
- `core/database`: Drift DB, cache local, preventa cache.
- `core/realtime`: websocket y eventos.
- `core/storage`: token storage.
- `core/documents`: PDF receipt.
- `features/*`: separacion por dominio.

### Features detectadas

- Auth/login.
- Home por rol.
- Catalogo.
- Clientes/cartera.
- Cobros.
- Rutas/entregas.
- Pedido rapido.
- Devoluciones.
- Bodega.
- Inventario vendedor.
- Cierre diario.
- Historial ventas.
- Preventa: ruta, clientes, agregar cliente, pedido.
- Startup/splash.

### Offline/cache

La base local Drift incluye:

- Tiendas cacheadas por usuario.
- Productos cacheados por tienda.
- Codigos de barra cacheados con indice `(barcode, store_id)`.
- Clientes cacheados.
- Cuentas por cobrar cacheadas.
- Resumen de cobros.
- Rutas y entregas cacheadas.
- Eventos realtime logueados.
- Cola de sincronizacion.
- Visit logs.

## Lo que le falta

### Offline completo

- El README ya identifica que falta fase 2: procesador completo de sync offline, reconciliacion automatica integral y replay automatico de pedidos/cobros/devoluciones.
- Falta politica explicita de conflictos: last-write-wins, merge por campo, bloqueo por estado o resolucion manual.
- Falta pantalla operativa para cola offline: pendientes, errores, reintentos, descartar/reintentar, detalle tecnico.
- Falta evidencia de pruebas de escenarios sin red prolongada, red intermitente, token expirado y duplicados por reintento.

### UX movil

- Debe optimizarse por uso real de calle/bodega: una mano, botones grandes, bajo brillo, mala senal, lector, teclado numerico, impresion.
- Faltan patrones visuales consistentes para sincronizando/offline/error/conflicto.
- Conviene separar flujos por rol en home y ocultar modulos que no aplican.
- En bodega/preventa/ruta se debe priorizar velocidad: menos formularios largos y mas acciones guiadas.

### Hardware

- Falta cierre con impresoras Bluetooth/USB/WiFi segun dispositivo real.
- Falta integracion robusta con escaner fisico o camara para codigos de barra.
- Falta perfilado en dispositivos industriales de baja memoria/CPU.

### Calidad

- Hay 3 pruebas Flutter detectadas, pero falta cubrir mas pantallas y repositorios.
- Falta generacion de contratos desde OpenAPI para evitar divergencia con backend.
- Falta telemetria local de errores y sync que se suba cuando vuelve internet.

## Mejoras recomendadas

### Corto plazo

- Crear pantalla `Sync Center`: pendientes, fallidos, ultimo sync, reintentos, detalle de error.
- Agregar pruebas para `SyncQueueProcessor`, `DeltaSyncService`, repositorios de pedidos/cobros/devoluciones y restauracion de sesion offline.
- Estandarizar estados visuales offline en todas las pantallas.
- Asegurar que toda operacion offline mande `external_id`/idempotency key.
- Documentar flujos por rol: preventa, rutero, bodeguero, gerente.

### Mediano plazo

- Generar cliente Dart desde Swagger/OpenAPI.
- Agregar reconciliacion por entidad: productos, clientes, cuentas, pedidos, entregas, cobros, devoluciones.
- Agregar logs locales persistentes y envio al backend.
- Agregar soporte de impresion/escaneo validado con hardware objetivo.
- Agregar descarga selectiva por tienda/ruta para reducir cache innecesario.

### Diseno movil

- Home con tarjetas grandes por tarea del dia: ruta asignada, clientes pendientes, pedidos por entregar, cobros pendientes, productos faltantes.
- Modo offline visible pero no invasivo: barra superior + icono + detalle al tocar.
- Formularios de campo con guardado automatico local.
- Acciones rapidas: llamar cliente, abrir mapa, registrar no compra, cobrar, devolver, firmar/confirmar entrega.
- Pantallas de bodega con flujo tipo checklist: escanear, validar cantidad, marcar faltante, finalizar carga.
