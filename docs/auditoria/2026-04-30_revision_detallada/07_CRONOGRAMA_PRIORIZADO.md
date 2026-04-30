# Cronograma priorizado

Este cronograma asume un equipo pequeno y prioriza estabilizar antes de crecer.

## Semana 1 - Bloqueadores de estabilidad

Objetivo: que el sistema compile y que la base tenga DDL coherente.

Entregables:

1. `npm run build` web pasa.
2. Migracion `product_barcodes` formal.
3. Migracion `sync_idempotency_log` formal.
4. Verificacion DDL contra tablas usadas por codigo.
5. Backend build sigue pasando.
6. Documento actualizado de variables y comandos.

Cierre:

- Una base nueva puede crearse con migraciones sin errores en barcode/sync.

## Semana 2 - Contratos y pruebas criticas backend

Objetivo: reducir fallos silenciosos.

Entregables:

1. DTOs de sales, orders, collections, returns, sync.
2. Enums de estados criticos.
3. Pruebas e2e para venta, pedido, cobro, devolucion, sync duplicado.
4. Politica de sync batch definida y aplicada.

Cierre:

- Operaciones financieras criticas estan validadas y probadas.

## Semana 3 - Tablas React y API paginada

Objetivo: que pantallas grandes no dependan de listas completas.

Entregables:

1. DataTable base.
2. Paginacion server-side en productos.
3. Paginacion server-side en ventas/reportes.
4. Paginacion server-side en pedidos.
5. Estados comunes de tabla.
6. Tests frontend iniciales.

Cierre:

- Productos, ventas y pedidos pueden operar con volumen.

## Semana 4 - Offline Flutter y Sync Center

Objetivo: hacer visible y recuperable el offline movil.

Entregables:

1. Flutter SDK/CI operativo.
2. `flutter test` y `flutter analyze` corren.
3. Sync Center.
4. Reintento/descartar fallidos.
5. Pruebas de cola offline.
6. Indicador global de sync.

Cierre:

- Un operador puede saber que esta pendiente o fallo sin mirar logs.

## Semana 5 - UX por rol y operacion diaria

Objetivo: reducir ruido y pasos.

Entregables:

1. Home por rol.
2. Menu filtrado por rol.
3. POS optimizado para teclado/lector.
4. Bodega tipo checklist.
5. Ruta/preventa con tareas del dia.
6. Estados visuales unificados.

Cierre:

- Cada rol entra directo a su flujo principal.

## Semana 6 - Seguridad, observabilidad y release

Objetivo: dejar despliegue y soporte en forma operable.

Entregables:

1. Rate limit auth.
2. Swagger protegido por ambiente.
3. CORS por dominio real.
4. Request id y logs estructurados.
5. Auditoria de cambios sensibles.
6. Smoke test post deploy.
7. Checklist de release y rollback.

Cierre:

- Cada release es verificable, rastreable y reversible.

## Orden de no negociables

1. No agregar mas pantallas antes de reparar build web y DDL faltante.
2. No ampliar offline sin idempotencia probada.
3. No redisenar tablas sin paginacion server-side.
4. No considerar listo un flujo financiero sin prueba e2e.
5. No desplegar migraciones sin backup y registro en `schema_migrations`.
