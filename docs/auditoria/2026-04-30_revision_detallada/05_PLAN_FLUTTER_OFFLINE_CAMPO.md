# Plan de trabajo Flutter, offline y operacion de campo

Objetivo: cerrar la app movil para preventa, ruta, cobro, devolucion y bodega con tolerancia real a mala conectividad.

## Fase 1 - Entorno y verificacion

Duracion estimada: 0.5 a 1 dia.

Tareas:

1. Instalar o documentar Flutter SDK en el VPS/CI.
2. Ejecutar `flutter pub get`.
3. Ejecutar `flutter test`.
4. Ejecutar analisis estatico con `flutter analyze`.
5. Documentar version de Flutter/Dart compatible con `pubspec.yaml`.

Criterio de cierre:

- Pruebas Flutter corren en entorno reproducible.

## Fase 2 - Sync Center

Duracion estimada: 3 a 5 dias.

Tareas:

1. Pantalla de cola offline.
2. Ver pendientes, fallidos, completados recientes.
3. Reintentar fallidos.
4. Descartar entrada fallida con confirmacion.
5. Ver detalle tecnico: endpoint, payload resumido, error, intentos.
6. Indicador global en home y pantallas criticas.

Criterio de cierre:

- Un operador o soporte puede saber que falta sincronizar.
- No se depende de logs tecnicos para diagnosticar offline.

## Fase 3 - Reconciliacion y conflictos

Duracion estimada: 5 a 8 dias.

Tareas:

1. Definir politica por entidad: productos, clientes, cuentas, pedidos, entregas, cobros, devoluciones.
2. Implementar reintentos con backoff.
3. Manejar 401 sin perder cola.
4. Manejar 409/conflictos con mensaje claro.
5. Persistir `externalId` en cada operacion offline.
6. Confirmar que backend evita duplicados.

Criterio de cierre:

- Red intermitente no duplica pedidos/cobros/devoluciones.
- Fallos quedan visibles y recuperables.

## Fase 4 - Optimizar campo por rol

Duracion estimada: 5 a 8 dias.

Preventa:

- Ruta del dia.
- Clientes pendientes.
- Agregar cliente con geolocalizacion.
- Pedido rapido.
- Cartera visible antes de vender.

Rutero:

- Entregas asignadas.
- Confirmar entrega.
- Cobrar.
- Registrar devolucion.
- Cierre diario.

Bodega:

- Picking.
- Carga camion.
- Faltantes.
- Ajustes autorizados.
- Escaneo de producto.

Criterio de cierre:

- Cada rol completa su jornada sin entrar a modulos no relevantes.
- Operaciones frecuentes requieren pocos toques.

## Fase 5 - Hardware

Duracion estimada: 5 a 10 dias, depende del dispositivo real.

Tareas:

1. Definir impresoras objetivo: Bluetooth, USB, red o sistema Android.
2. Definir escaner objetivo: camara, lector fisico HID, lector integrado.
3. Prototipo de impresion de comprobante.
4. Prototipo de escaneo offline contra `cached_product_barcodes`.
5. Pruebas en dispositivo industrial real.

Criterio de cierre:

- Se imprime y escanea en el hardware que usara la operacion.

## Fase 6 - Pruebas moviles

Duracion estimada: 4 a 7 dias.

Tareas:

1. Tests de repositorios offline.
2. Tests de `SyncQueueProcessor`.
3. Tests de `DeltaSyncService`.
4. Tests de auth restore sin red.
5. Tests de cola con POST/PATCH, 401, timeout y error funcional.
6. Tests de busqueda barcode offline.

Criterio de cierre:

- La app movil tiene pruebas para operar sin red y recuperar sincronizacion.
