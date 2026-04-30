# Plan de trabajo Backend y Base de Datos

Objetivo: convertir NestJS + PostgreSQL en una base confiable para operacion real, offline y multi-tienda.

## Fase 1 - Migraciones y DDL

Duracion estimada: 2 a 4 dias.

Tareas:

1. Crear migracion `product_barcodes` completa.
2. Crear migracion `sync_idempotency_log`.
3. Crear/validar `order_status_history`, si no existe en DDL formal.
4. Auditar tablas usadas por codigo contra DDL con script automatizado.
5. Mover cambios de `ensureOperationalTables()` a migraciones cuando sean parte del modelo.
6. Dejar `ensureOperationalTables()` solo para tablas operativas temporales si aplica.
7. Estandarizar UUID: elegir `gen_random_uuid()` o `uuid_generate_v4()`.

Criterio de cierre:

- Base nueva puede levantarse solo con migraciones.
- `npm run build` backend OK.
- Prueba e2e crea producto con barcode, venta offline duplicada y consulta idempotency logs.

## Fase 2 - Contratos DTO y OpenAPI

Duracion estimada: 4 a 7 dias.

Tareas:

1. DTOs para stores, chains, users, clients, suppliers, departments, zones.
2. DTOs para orders, sales, cash shifts, inventory, returns, collections.
3. DTOs para sync batch y delta data.
4. Responses tipadas para listas con `{ data, meta }`.
5. Enums centrales para roles, estados, pagos, movimientos, sync.
6. Swagger con ejemplos de request/response por flujo critico.

Criterio de cierre:

- Sin `@Body() dto: any` en modulos criticos.
- OpenAPI genera cliente TypeScript y Dart.
- Validacion rechaza campos extra y estados invalidos.

## Fase 3 - Idempotencia y sync

Duracion estimada: 5 a 8 dias.

Tareas:

1. Definir formato unico de idempotency key: `externalId`.
2. Constraint unico por entidad offline.
3. Batch sync con politica formal: parcial con savepoints o todo/nada.
4. Persistir resultado por operacion: success, duplicate, failed.
5. Endpoint de detalle para operaciones fallidas.
6. Reintento seguro sin doble venta, doble cobro, doble devolucion.

Criterio de cierre:

- Reprocesar el mismo batch no duplica datos.
- Duplicados quedan auditados.
- Fallos parciales devuelven detalle y no marcan todo como exitoso.

## Fase 4 - Reglas de negocio

Duracion estimada: 7 a 12 dias.

Tareas:

1. Centralizar calculo de totales, impuestos y descuentos.
2. Sacar IVA quemado de codigo y pasarlo a configuracion por tienda/pais.
3. Estados permitidos de `orders` con transiciones validas.
4. Kardex obligatorio para ventas, ajustes, mermas, transferencias, devoluciones.
5. Cierre de caja con corte por metodos de pago.
6. Cuentas por cobrar con aging server-side.
7. Devoluciones con impacto correcto en inventario y cartera.

Criterio de cierre:

- Cada flujo financiero tiene prueba e2e.
- No hay calculos criticos dependientes solo de cliente web/movil.

## Fase 5 - Performance

Duracion estimada: 3 a 6 dias.

Tareas:

1. Paginacion obligatoria en listas grandes.
2. Indices por consultas reales: tienda + fecha, tienda + estado, cliente + status, rutero + fecha.
3. Revisar `consultasql_historial` y activar captura controlada de queries lentas.
4. Endpoints agregados para dashboards y reportes.
5. Plan de retencion para logs, movimientos, eventos y ventas historicas.

Criterio de cierre:

- Dashboards no cargan listas completas.
- Reportes grandes responden paginados.
- Consultas criticas tienen EXPLAIN revisado.

## Fase 6 - Seguridad backend

Duracion estimada: 3 a 5 dias.

Tareas:

1. Rate limit especifico para login/register/forgot-password.
2. Swagger protegido por ambiente.
3. CORS cerrado por dominio real.
4. Refresh token con revocacion documentada.
5. Auditoria transversal: user, store, action, entity, before/after, request id.
6. Matriz de permisos por rol y accion.

Criterio de cierre:

- Endpoint sensible auditado.
- Roles no dependen solo de convenciones de UI.
- Pruebas cubren 401, 403 y acceso cruzado entre tiendas.
