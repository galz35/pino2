# Auditoria Backend NestJS y Base de Datos

Fecha: 2026-04-30
Ruta: `/opt/apps/pino2/backend`

## Stack detectado

- NestJS 11.
- Fastify adapter.
- PostgreSQL con `pg` directo.
- JWT/passport, bcrypt, class-validator, class-transformer.
- Swagger con Bearer Auth.
- Helmet y rate limit.
- Socket.IO/WebSockets.
- Firebase Admin para notificaciones.

Nota: el README raiz menciona TypeORM, pero el codigo y dependencias usan `pg` directo. Conviene corregir la documentacion para no confundir mantenimiento.

## Que tiene

### Modulos NestJS detectados

- Auth, users, stores, chains.
- Products, product-barcodes, departments.
- Sales, cash-shifts, inventory, invoices, suppliers.
- Clients, accounts-receivable, accounts-payable.
- Orders, pending-orders, pending-deliveries, routes.
- Vendor-inventories, visit-logs, store-zones, zones.
- Authorizations, licenses, notifications, sync, errors.
- Returns, collections, daily-closings.
- Grupos economicos, grupos clientes, arqueos, cargas camion, liquidaciones ruta.

### Infraestructura

- `main.ts` configura global prefix `api`, validacion global con whitelist/forbidNonWhitelisted, CORS, Swagger, Helmet y rate limit.
- `DatabaseService` centraliza `query`, transacciones y captura opcional de consultas lentas.
- `ensureOperationalTables()` crea tablas operativas y agrega columnas necesarias para sync/idempotencia.
- Guardas/decoradores para JWT, roles, public routes, current user y acceso a tienda.
- Gateway de eventos para sincronizacion/notificaciones realtime.

### Modelo de datos

El esquema/migraciones cubren:

- Contexto: chains, stores, licenses, config.
- Seguridad: users, user_stores, permisos JSONB.
- Catalogo: departments, subdepartments via `parent_id`, products, product_barcodes.
- Caja/POS: cash_shifts, sales, sale_items.
- Inventario: movements, vendor_inventories.
- Clientes/proveedores: clients, suppliers.
- Pedidos y distribucion: orders, order_items, pending_orders, pending_deliveries, routes, cargas_camion.
- Finanzas: accounts_receivable, account_payments, accounts_payable, invoices, invoice_items, collections, returns, daily_closings, arqueos, liquidaciones_ruta.
- Operacion: sync_logs, sync_status, consultasql_historial, error_logs, device_tokens, visit_logs.

## Lo que le falta

### Contratos y validacion

- Varios controladores aceptan `@Body() dto: any`. Esto reduce la utilidad del `ValidationPipe` porque no hay DTO fuerte que validar.
- Hay DTOs en algunos modulos, pero no son consistentes en todo el backend.
- Faltan enums centrales para roles, estados de pedido, estado de caja, metodo de pago, tipo de movimiento, tipo de pedido, estados de sync.
- Faltan respuestas tipadas y normalizadas por modulo. Cada servicio mapea filas manualmente.

### Base de datos

- El DDL esta repartido entre `schema.sql`, migraciones y `DatabaseService.ensureOperationalTables()`. Esto dificulta saber cual es la fuente de verdad.
- `schema.sql` usa `uuid-ossp`/`uuid_generate_v4()`, mientras migraciones usan `gen_random_uuid()`. Conviene estandarizar extension y funcion UUID.
- Faltan constraints/checks para valores de estado. Hoy muchos estados son `VARCHAR`, lo que permite datos invalidos.
- Falta politica clara de soft delete vs hard delete por tablas maestras.
- Faltan indices compuestos adicionales para consultas esperadas: por tienda + fecha, tienda + estado + fecha, cliente + status, rutero + fecha, producto + tienda + activo.
- Falta particion/archivado o estrategia de crecimiento para ventas, movimientos, logs y eventos realtime.

### Logica de negocio

- Las reglas criticas deben vivir en backend como fuente de verdad: calculo de totales, stock, autorizaciones, cierre caja, credito, devoluciones e idempotencia.
- Hay riesgo de duplicar reglas en React/Flutter para pedidos, precios, inventario y cobranza.
- Conviene encapsular transacciones por caso de uso, no solo por servicio CRUD.
- Falta una capa clara para auditoria de cambios: quien cambio estado, antes/despues, modulo, IP/dispositivo, request id.

### Seguridad

- Rate limit global de 2000/minuto es alto para login. Debe existir limit especifico para auth.
- Swagger en produccion debe protegerse o deshabilitarse segun entorno.
- CORS debe validarse por ambiente y dominio real.
- Refresh token y revocacion deben documentarse y probarse.
- Faltan permisos granulares si se pretende operar con master, cadena, tienda, gerente, vendedor, rutero, bodeguero y cajero.

### Pruebas

- Hay pruebas backend activas e historicas, incluyendo e2e para app/auth-sync/barcodes.
- Falta cobertura sistematica por modulo critico: ventas, inventario, caja, pedidos, despacho, cartera, devoluciones, sync, roles y multi-tienda.
- Faltan pruebas de concurrencia: dos cajas vendiendo el mismo producto, doble sync con external_id repetido, cierre caja durante ventas pendientes, dos usuarios actualizando pedido.

## Mejoras recomendadas

### Orden de base de datos

1. Definir migraciones como unica fuente de verdad.
2. Convertir `schema.sql` en snapshot generado o documento de referencia, no mecanismo alterno.
3. Reducir `ensureOperationalTables()` a tablas estrictamente operativas o moverlo a migraciones.
4. Crear `schema_migrations` obligatorio para todas las migraciones.
5. Agregar constraints y enums/checks para estados.
6. Crear indices por consultas reales medidas con `consultasql_historial`.

### Orden de API

1. DTOs para todos los creates/updates/filters.
2. OpenAPI completo y usado para generar clientes TypeScript/Dart.
3. Respuestas normalizadas: `{ data, meta }` para listas paginadas.
4. Paginacion server-side obligatoria en endpoints de listas grandes.
5. Idempotency key obligatoria en operaciones offline: ventas, pedidos, cobros, devoluciones, movimientos.
6. Auditoria transversal por interceptor/servicio.

### Tablas/logica prioritarias

- `sales`, `sale_items`, `cash_shifts`: garantizar consistencia de caja y venta.
- `products`, `product_barcodes`, `movements`: stock y codigos de barra como fuente confiable.
- `orders`, `order_items`, `pending_orders`, `pending_deliveries`: pipeline de pedido/despacho/entrega.
- `accounts_receivable`, `collections`: cartera, abonos e idempotencia.
- `returns`: devoluciones con impacto correcto en inventario y cuenta.
- `sync_status`, `sync_logs`, `consultasql_historial`, `error_logs`: operacion y soporte.

## Mejora de documentacion tecnica

- Reemplazar `backend/README.md` template por README real: variables `.env`, scripts, migraciones, seed, tests, endpoints, despliegue.
- Crear `docs/API_CONTRATOS.md` con estados validos y ejemplos por flujo.
- Crear `docs/BD_MODELO_DATOS.md` con relaciones, indices y reglas de integridad.
- Crear `docs/SEGURIDAD_ROLES_PERMISOS.md` con matriz de permisos por rol.
