# Hallazgos criticos

Fecha: 2026-04-30

## P0 - Riesgos que bloquean estabilidad

### `sync_idempotency_log` se usa pero no se encontro su DDL

Se referencia en:

- `backend/src/modules/sales/sales.service.ts`
- `backend/src/modules/orders/orders.service.ts`
- `backend/src/modules/collections/collections.service.ts`
- `backend/src/modules/returns/returns.service.ts`
- `backend/src/modules/sync/sync.service.ts`

No se encontro `CREATE TABLE IF NOT EXISTS sync_idempotency_log` en `backend/src` ni `backend/migrations`.

Impacto:

- El endpoint `/sync/idempotency-logs` puede fallar si la tabla no existe.
- Las rutas idempotentes pueden fallar justo cuando detectan duplicados.
- La auditoria de duplicados evitados queda incompleta.

Accion:

- Crear migracion formal para `sync_idempotency_log`.
- Agregar indices por `store_id`, `external_id`, `entity_type`, `created_at`.
- Agregar constraint unico por `store_id + external_id + entity_type`.
- Agregar prueba e2e que procese una operacion offline duplicada y verifique log.

### `product_barcodes` se usa y se migra, pero no se encontro creacion de tabla

El codigo usa `product_barcodes` en ProductsService, ProductBarcodesModule, sync y Flutter offline. La migracion `2026-04-21_barcode_refactor.sql` inserta e indexa `product_barcodes`, pero no crea la tabla.

Impacto:

- En una base nueva, la migracion de barcode puede fallar.
- Crear productos con barcode puede fallar.
- Busqueda por barcode y sync de catalogo pueden quedar rotos.

Accion:

- Crear migracion previa o correctiva con `CREATE TABLE IF NOT EXISTS product_barcodes`.
- Incluir `created_at` y `updated_at`, porque el codigo ordena por `created_at` y delta sync filtra por `updated_at`.
- Garantizar indice unico `(barcode, store_id)`.
- Mantener `products.barcode` solo como legacy si esa es la decision final.

### Build web falla por dependencia no instalada

Resultado:

- `npm run build` en `/opt/apps/pino2/web` falla.
- Error: `Cannot find package 'vite-plugin-pwa'`.
- `package.json` y `package-lock.json` declaran `vite-plugin-pwa`.
- `web/node_modules/vite-plugin-pwa` no existe.

Impacto:

- No se puede validar ni publicar frontend desde este working tree sin reparar dependencias.

Accion:

- Ejecutar `npm ci` en `web` o instalar dependencias segun lock.
- Repetir `npm run build`.
- Documentar version de Node/NPM usada por despliegue.

## P1 - Riesgos altos

### DDL repartido en demasiados lugares

Fuentes actuales:

- `backend/src/database/schema.sql`.
- `backend/migrations/*.sql`.
- `DatabaseService.ensureOperationalTables()`.

Impacto:

- No hay una fuente unica de verdad.
- Una base nueva puede no quedar igual que produccion.
- Los cambios automaticos en bootstrap pueden ocultar migraciones faltantes.

Accion:

- Migraciones deben ser la fuente unica.
- `schema.sql` debe ser snapshot generado o referencia, no camino alternativo.
- `ensureOperationalTables()` debe limitarse a tablas operativas muy controladas o moverse a migraciones.

### Sync batch mezcla transaccion global con fallos individuales

`SyncService.processBatchSync()` atrapa errores por operacion y sigue, pero toda la ejecucion esta dentro de `withTransaction()`.

Impacto:

- El codigo parece permitir fallos parciales, pero una excepcion no relanzada puede dejar batch marcado como completado aunque tenga operaciones fallidas.
- Si se cambia el manejo de errores, puede pasar a rollback total inesperado.

Accion:

- Decidir politica: todo o nada, o parcial.
- Si es parcial, usar transacciones por operacion o savepoints.
- Devolver resultado con `SUCCESS`, `FAILED`, `DUPLICATE` y persistir detalle.

### DTOs y tipos incompletos

Se detectaron multiples `@Body() dto: any`, `@Req() req: any`, `params: any[]`, `mapRow(row: any)` y `as any`.

Impacto:

- `ValidationPipe` pierde poder si los DTOs no existen.
- OpenAPI queda incompleto.
- React y Flutter consumen contratos implicitos.

Accion:

- Crear DTOs para todos los creates/updates/filters.
- Crear entidades/responses tipadas.
- Generar clientes TypeScript/Dart desde OpenAPI.

### Estados de negocio como strings libres

Estados de pedido, caja, cartera, devoluciones, sync e inventario usan `VARCHAR` sin checks/enums consistentes.

Impacto:

- Es posible guardar estados invalidos.
- Cada UI puede interpretar estados de forma distinta.

Accion:

- Definir enums centrales.
- Agregar `CHECK` constraints o tablas catalogo.
- Documentar matriz de transiciones.

## P2 - Riesgos medios

### Frontend calcula demasiados agregados localmente

Dashboards, reportes y comparaciones cargan listas y calculan totales en cliente.

Impacto:

- Degradacion con muchas tiendas/ventas/productos.
- Riesgo de inconsistencias con filtros.

Accion:

- Mover agregados a endpoints server-side.
- Paginacion y filtros server-side en todas las tablas grandes.

### Cache GET manual en Axios rompe forma completa de respuesta

`apiClient.get` puede retornar solo `{ data }`, sin `status`, `headers` ni metadatos Axios.

Impacto:

- Codigo futuro puede romperse al esperar una respuesta Axios completa.
- Invalidation global por cualquier mutacion es imprecisa.

Accion:

- Sustituir por TanStack Query o una capa cache por dominio.
- Invalidar por entidad/evento realtime.

### Flutter offline aun no es cierre integral

El README movil declara pendientes: sync completo, reconciliacion automatica, hardware impresion/escaneo y replay integral.

Impacto:

- La app sirve para operacion base, pero necesita cerrar escenarios reales de mala red.

Accion:

- Sync Center visible.
- Reintentos con backoff.
- Conflictos por entidad.
- Pruebas de red intermitente y duplicados.

## Verificaciones

- Backend build: OK.
- Web build: falla por `vite-plugin-pwa` ausente en `node_modules`.
- Flutter test: no ejecutable porque falta CLI `flutter`.
