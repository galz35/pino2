# Inventario funcional y tecnico

Fecha: 2026-04-30

## Metricas de codigo

- Frontend React: 188 archivos en `web/src`.
- Paginas React: 73 archivos en `web/src/pages`.
- Backend NestJS: 133 archivos en `backend/src`.
- Modulos NestJS: 37 carpetas bajo `backend/src/modules`.
- Flutter: 66 archivos en `flutter/lib`.
- Flutter features: 14 dominios bajo `flutter/lib/features`.

## Web React

Stack:

- React 19, Vite 6, TypeScript 5.9.
- React Router 7 con lazy loading.
- Tailwind CSS, Radix UI, lucide-react, Recharts.
- Axios con interceptor JWT y cache GET en memoria.
- IndexedDB y sync service propio para operaciones offline.
- Configuracion PWA en `vite.config.ts` via `vite-plugin-pwa`.

Cobertura funcional detectada:

- Login y recuperacion de password.
- POS principal.
- Tienda: dashboard, facturacion, productos, departamentos, subdepartamentos, usuarios, configuracion.
- Inventario: movimientos, ajustes, entrada rapida, bodega.
- Proveedores y facturas de proveedor.
- Caja y arqueos.
- Autorizaciones y autorizaciones de precio.
- Pedidos pendientes, pipeline, dispatcher, dispatch y cargas.
- Control tower, delivery route, cierre diario rutero.
- Finanzas: cuentas por cobrar, aging, cuentas por pagar, liquidacion.
- Vendedores/ruta: vendedores, dashboard, zonas, clientes, cobros, inventario, venta rapida, ventas, rutas, devoluciones.
- Master admin: cadenas, tiendas, usuarios, licencias, monitor, config, zonas, sync monitor, comparacion multi-tienda.
- Chain admin: dashboard de cadena.

## Backend NestJS

Stack:

- NestJS 11 con Fastify.
- PostgreSQL con `pg` directo.
- JWT/passport, bcrypt, class-validator, class-transformer.
- Swagger, CORS, Helmet, rate limit.
- Socket.IO para eventos.
- Firebase Admin para notificaciones.

Modulos principales:

- Auth, users, stores, chains, licenses, config.
- Products, product-barcodes, departments, inventory.
- Sales, cash-shifts, invoices, suppliers.
- Clients, accounts-receivable, accounts-payable.
- Orders, pending-orders, pending-deliveries, routes.
- Store-zones, zones, visit-logs, vendor-inventories.
- Authorizations, notifications, sync, errors.
- Returns, collections, daily-closings.
- Grupos economicos, grupos clientes, arqueos, cargas camion, liquidaciones ruta.

API detectada:

- Auth: register, login, refresh, forgot-password, me, profile.
- Products: CRUD, import, barcode lookup, alternate barcodes.
- Sales: process, list, dashboard-stats, report, return.
- Cash shifts: open, close, active, stats, list, detail.
- Orders: create, list, detail, autorizar, status, prepare, stage, load-truck, dispatch, deliver.
- Inventory: adjust, movements, warehouse, vendor, transfer, quick-entry, merma, ajuste.
- Sync: statuses, idempotency-logs, batch, force, data.
- Finance: accounts receivable/payable, payments, collections, summary, daily closings, arqueos, liquidaciones.
- Logistics: pending orders, pending deliveries, cargas camion, routes.
- Admin/catalog: stores, chains, users, suppliers, invoices, zones, departments, licenses, config.

## Base de datos

Tablas base detectadas en `schema.sql`:

- Contexto: `chains`, `stores`, `licenses`, `config`.
- Seguridad: `users`, `user_stores`.
- Catalogo: `departments`, `products`.
- Caja/ventas: `cash_shifts`, `sales`, `sale_items`.
- Inventario: `movements`, `vendor_inventories`.
- Clientes/proveedores: `clients`, `suppliers`.
- Pedidos: `orders`, `order_items`, `pending_orders`, `pending_deliveries`, `routes`.
- Finanzas: `accounts_receivable`, `account_payments`, `accounts_payable`, `payable_payments`, `collections`, `returns`, `return_items`, `daily_closings`.
- Distribucion: `store_zones`, `visit_logs`.
- Operacion: `sync_logs`, `consultasql`, `consultasql_historial`.

Migraciones detectadas:

- `002_vendor_modules.sql`: vendor modules, deliveries, routes, pending orders, error logs y columnas extra.
- `2026-04-20_distribucion.sql`: grupos, clientes extendidos, pedidos extendidos, arqueos, liquidaciones, cargas.
- `2026-04-21_barcode_refactor.sql`: pobla e indexa `product_barcodes`, pero no crea la tabla.
- `run_migration.js`: runner ad hoc con `schema_migrations`.

## Flutter

Stack:

- Flutter/Dart SDK declarado `>=3.10.0 <4.0.0`.
- Riverpod, GoRouter, Dio, Drift, sqlite3_flutter_libs.
- flutter_secure_storage, shared_preferences, connectivity_plus.
- socket_io_client, Firebase Messaging, local notifications.
- PDF/share/geolocator/url_launcher.

Features:

- Auth, home, catalog, clients, collections.
- Deliveries/ruta, quick order, returns.
- Warehouse, vendor inventory, daily closing.
- Sales history, startup, preventa.

Cache/offline local:

- Tiendas asignadas por usuario.
- Productos y codigos de barra por tienda.
- Clientes, cartera, resumen de cobros.
- Rutas, entregas, eventos realtime, cola de sync.
- Visit logs.

## Pruebas existentes

Backend activo:

- `app.e2e-spec.ts`: smoke de rutas y proteccion JWT.
- `auth-sync.e2e-spec.ts`: register/login/me y endpoints base para sync offline.
- `barcodes.e2e-spec.ts`: flujo multi-barcode y validacion de sync payload.

Backend legacy:

- Suite destructiva y reportes historicos de cobertura, migracion, schema y fallos.

Flutter:

- `local_cache_repository_test.dart`.
- `mobile_domain_logic_test.dart`.
- `widget_test.dart`.

Web:

- No se detecto suite React dedicada en `web/src`.
