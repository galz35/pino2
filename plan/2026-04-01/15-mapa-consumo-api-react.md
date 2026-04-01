# 15 - Mapa de Consumo API en React

**Fecha:** 2026-04-01  
**Proyecto:** `pino`

## 1. Objetivo

Este documento lista los archivos React que consumen API de forma directa y responde tres preguntas:

1. qué archivo consume la API
2. qué endpoint consume
3. para qué lo consume

Alcance:

- páginas
- componentes
- hooks/lib con consumo real

No incluye:

- llamadas indirectas que viajan por props
- endpoints solo planeados
- backend

## 2. Consumidores compartidos / infraestructura

| Archivo | Endpoint | Para qué |
|---|---|---|
| `src/services/api-client.ts` | base configurable (`/api-dev`) | Cliente HTTP global con JWT, caché GET y manejo de `401` |
| `src/services/finance-service.ts` | `GET /accounts-receivable`, `POST /accounts-receivable/:id/payments`, `GET /collections`, `GET /collections/summary`, `GET /accounts-payable`, `GET /accounts-payable/:id`, `POST /accounts-payable/:id/payment`, `GET /invoices`, `POST /invoices`, `PATCH /invoices/:id`, `DELETE /invoices/:id`, `GET /suppliers`, `GET /products` | Capa de dominio para finanzas, compras y CxP |
| `src/lib/error-logger.ts` | `POST /errors` | Registrar errores del frontend en backend |
| `src/lib/sync-service.ts` | `POST /sync/batch` | Enviar operaciones offline en lote al backend |
| `src/hooks/use-real-time-events.ts` | Socket.IO (`/api-dev/socket.io`, namespace `/events`) | Escuchar eventos `sync_update` y `store_update` filtrando eventos ajenos a la tienda activa |
| `src/components/app-layout.tsx` | `GET /stores/:storeId` + websocket vía `use-real-time-events` | Cargar `settings`, armar navegación y llenar la campana de notificaciones operativas |
| `src/components/global-alert-provider.tsx` | `GET /authorizations?status=PENDING`, opcionalmente `storeId`, `PATCH /authorizations/:id/status` | Mostrar y resolver autorizaciones pendientes para perfiles administrativos de tienda o globales |
| `src/components/auth/admin-auth-dialog.tsx` | `POST /auth/login` | Validar credenciales administrativas sin reemplazar la sesión actual |

## 3. Dashboard y métricas

| Archivo | Endpoint | Para qué |
|---|---|---|
| `src/components/dashboard/active-cash-registers.tsx` | `GET /cash-shifts/active?storeId=...` | Mostrar cajas activas |
| `src/components/dashboard/historical-shifts-list.tsx` | `GET /cash-shifts` | Listado histórico de turnos |
| `src/components/dashboard/master-admin-dashboard-metrics.tsx` | `GET /users`, `GET /stores` | Métricas globales del dashboard master |
| `src/components/dashboard/store-admin-dashboard-metrics.tsx` | `GET /sales?storeId=...`, `GET /pending-deliveries?storeId=...`, `GET /stores/:storeId` | KPIs por tienda y operación comercial |
| `src/pages/store-admin/dashboard/dashboard-page.tsx` | `GET /stores/:storeId` | Cargar datos base y `settings` de tienda |

## 4. POS, caja y ventas

| Archivo | Endpoint | Para qué |
|---|---|---|
| `src/pages/store-admin/billing/billing-page.tsx` | `GET /stores/:storeId`, `GET /cash-shifts`, `POST /sales/process` | Cargar configuración, turno abierto y procesar venta |
| `src/pages/store-admin/cash-register/cash-register-page.tsx` | `GET /cash-shifts/active?storeId=...`, `GET /cash-shifts/stats/:shiftId`, `POST /cash-shifts`, `POST /cash-shifts/close` | Apertura, estadísticas y cierre de caja |
| `src/components/pos/payment-grid.tsx` | `GET /cash-shifts/active?storeId=...`, `POST /sales/process` | Confirmar turno activo y ejecutar pago desde grid |
| `src/components/pos/daily-sales-dialog.tsx` | `GET /sales` | Consultar ventas del día |
| `src/components/pos/add-client-dialog.tsx` | `POST /clients` | Crear cliente rápido desde POS |
| `src/components/pos/client-selection-dialog.tsx` | `GET /clients?storeId=...` | Cargar clientes de tienda y filtrarlos localmente para selección rápida |
| `src/components/pos/product-grid-navigation.tsx` | `GET /departments?storeId=...&type=main`, `GET /products?storeId=...&departmentId=...` | Navegación por departamentos principales y productos |
| `src/components/pos/product-grid.tsx` | `GET /products` | Cargar productos para el grid |
| `src/components/pos/product-search.tsx` | `GET /products?storeId=...&search=...&limit=...` | Buscar productos con el endpoint real del catálogo |
| `src/components/pos/returns-dialog.tsx` | `GET /sales/:ticket?storeId=...`, `POST /returns` | Buscar ticket y registrar devolución |
| `src/components/pos/cashier-billing-view.tsx` | `GET /stores/:storeId` | Cargar settings que afectan POS desde el detalle real de la tienda |
| `src/components/pos/printable-sale-ticket.tsx` | `GET /stores/:storeId` | Obtener encabezado/pie del ticket desde `settings` |
| `src/components/printable-ticket.tsx` | `GET /stores/:storeId` | Obtener datos de tienda para impresión |

## 5. Master Admin

| Archivo | Endpoint | Para qué |
|---|---|---|
| `src/pages/master-admin/add-chain-page.tsx` | `POST /chains` | Crear cadena |
| `src/pages/master-admin/add-store-page.tsx` | `POST /stores` | Crear tienda |
| `src/pages/master-admin/edit-store-page.tsx` | `GET /stores/:storeId`, `PATCH /stores/:storeId` | Cargar y editar tienda |
| `src/pages/master-admin/master-chains-page.tsx` | `GET /chains`, `DELETE /chains/:id` | Listar y eliminar cadenas |
| `src/pages/master-admin/master-config-page.tsx` | `GET /config/general`, `PUT /config/general` | Configuración general |
| `src/pages/master-admin/master-dashboard-page.tsx` | `GET /users`, `GET /stores` | Dashboard global |
| `src/pages/master-admin/master-licenses-page.tsx` | `GET /stores` | Revisar licencias por tienda |
| `src/pages/master-admin/master-monitor-page.tsx` | `GET /errors` | Ver registros de error |
| `src/pages/master-admin/master-stores-page.tsx` | `GET /stores`, `DELETE /stores/:id` | Listar y eliminar tiendas |
| `src/pages/master-admin/master-sub-zones-page.tsx` | `GET /zones`, `GET /sub-zones`, `PATCH /sub-zones/:id`, `POST /sub-zones`, `DELETE /sub-zones/:id` | Gestionar sub-zonas |
| `src/pages/master-admin/master-sync-monitor-page.tsx` | `GET /stores`, `GET /sync/statuses`, `POST /sync/force/:storeId` | Monitorear estado de sincronización y marcar reintento manual por tienda |
| `src/pages/master-admin/master-users-page.tsx` | `GET /users`, `GET /stores` | Gestión global de usuarios |
| `src/pages/master-admin/master-zones-page.tsx` | `GET /zones`, `PATCH /zones/:id`, `POST /zones`, `DELETE /zones/:id` | Gestión global de zonas |

## 6. Store Admin: operación general

| Archivo | Endpoint | Para qué |
|---|---|---|
| `src/pages/store-admin/authorizations/authorizations-page.tsx` | `GET /authorizations`, `PATCH /authorizations/:id/status` | Revisar y resolver autorizaciones |
| `src/pages/store-admin/control-tower/control-tower-page.tsx` | `GET /pending-orders`, `GET /pending-deliveries`, `GET /authorizations`, `GET /cash-shifts` | Vista consolidada operativa |
| `src/pages/store-admin/delivery-route/delivery-route-page.tsx` | `GET /pending-deliveries?storeId=...&status=Pendiente&ruteroId=...`, `PATCH /pending-deliveries/:id` | Listar y actualizar entregas del rutero |
| `src/pages/store-admin/dispatcher/dispatcher-page.tsx` | `GET /stores/:storeId`, `GET /products`, `POST /pending-orders` | Crear pedidos para despacho/manuales |
| `src/pages/store-admin/finance/receivables-page.tsx` | `GET /accounts-receivable?storeId=...&pending=true`, `GET /collections?storeId=...&date=...`, `GET /collections/summary?storeId=...&date=...`, `POST /accounts-receivable/:id/payments` | Operar cartera pendiente y cobros diarios |
| `src/pages/store-admin/reports/reports-page.tsx` | `GET /sales` | Base de reportes de ventas |
| `src/pages/store-admin/settings/settings-page.tsx` | `GET /stores/:storeId`, `PATCH /stores/:storeId/settings` | Cargar y actualizar configuración de tienda |

## 7. Store Admin: inventario y productos

| Archivo | Endpoint | Para qué |
|---|---|---|
| `src/pages/store-admin/inventory/inventory-adjustments-page.tsx` | `GET /products`, `POST /inventory/adjust` | Consultar productos y registrar ajustes |
| `src/pages/store-admin/inventory/inventory-movements-page.tsx` | `GET /inventory/movements` | Ver kardex/movimientos |
| `src/pages/store-admin/products/add-product-page.tsx` | `GET /departments?type=main`, `GET /sub-departments`, `GET /suppliers`, `POST /products` | Crear producto y cargar catálogos auxiliares reales |
| `src/pages/store-admin/products/edit-product-page.tsx` | `GET /products/:id`, `GET /departments?type=main`, `GET /sub-departments`, `GET /suppliers`, `PATCH /products/:id` | Editar datos, precios, inventario y clasificación real del producto |
| `src/pages/store-admin/products/departments-page.tsx` | `GET /departments`, `POST /departments`, `PATCH /departments/:id`, `DELETE /departments/:id` | CRUD de departamentos |
| `src/pages/store-admin/products/products-page.tsx` | `GET /products`, `GET /departments?type=main`, `GET /sub-departments` | Listado de productos con navegación por departamento y sub-departamento |
| `src/pages/store-admin/products/sub-departments-page.tsx` | `GET /departments?type=main`, `GET /sub-departments`, `POST /departments`, `PATCH /departments/:id`, `DELETE /departments/:id` | Gestión de sub-departamentos |
| `src/components/products/import-products-dialog.tsx` | `POST /products/import` | Importación masiva de productos vía CSV |

## 8. Store Admin: proveedores

| Archivo | Endpoint | Para qué |
|---|---|---|
| `src/pages/store-admin/suppliers/add-supplier-page.tsx` | `POST /suppliers` | Crear proveedor |
| `src/pages/store-admin/suppliers/edit-supplier-page.tsx` | `GET /suppliers/:id`, `PATCH /suppliers/:id` | Cargar y editar proveedor |
| `src/pages/store-admin/suppliers/suppliers-page.tsx` | `GET /suppliers`, `DELETE /suppliers/:id` | Listar y eliminar proveedores |
| `src/pages/store-admin/suppliers/supplier-invoices-page.tsx` | `GET /suppliers`, `GET /products`, `GET /invoices`, `POST /invoices`, `PATCH /invoices/:id`, `DELETE /invoices/:id`, `GET /accounts-payable`, `GET /accounts-payable/:id`, `POST /accounts-payable/:id/payment` | Registrar compras, gestionar facturas y pagar CxP |

## 9. Store Admin: usuarios

| Archivo | Endpoint | Para qué |
|---|---|---|
| `src/pages/store-admin/users/add-user-page.tsx` | `POST /auth/register` | Crear usuario de tienda |
| `src/pages/store-admin/users/edit-user-page.tsx` | `GET /users/:id`, `PATCH /users/:id` | Cargar y editar usuario |
| `src/pages/store-admin/users/users-page.tsx` | `GET /users`, `DELETE /users/:id` | Listar y eliminar usuarios |
| `src/pages/store-admin/vendors/add-vendor-page.tsx` | `POST /users` | Crear personal de ruta |
| `src/pages/store-admin/vendors/vendors-page.tsx` | `GET /users?storeId=...` | Listar personal de ruta y filtrar roles `vendor`, `sales-manager` y `rutero` en frontend |

## 10. Vendors / Ruta en web

| Archivo | Endpoint | Para qué |
|---|---|---|
| `src/pages/store-admin/vendors/assign-route-page.tsx` | `GET /pending-deliveries?storeId=...&status=Pendiente&unassigned=true`, `GET /users?storeId=...&role=Rutero`, `POST /pending-deliveries/assign-route` | Asignar pedidos a rutero |
| `src/pages/store-admin/vendors/vendor-clients-page.tsx` | `GET /users?storeId=...&role=Vendedor Ambulante`, `GET /store-zones?storeId=...`, `GET /clients?storeId=...` | Gestionar clientes y relación con vendedor/zona |
| `src/pages/store-admin/vendors/vendor-collections-page.tsx` | `GET /accounts-receivable?pending=true`, `POST /accounts-receivable/:id/payments` | Cobros y abonos de cartera |
| `src/pages/store-admin/vendors/vendor-dashboard-page.tsx` | `GET /stores/:storeId`, `GET /store-zones`, `GET /clients`, `GET /visit-logs`, `POST /visit-logs` | Dashboard de gestión comercial y visitas |
| `src/pages/store-admin/vendors/vendor-inventory-page.tsx` | `GET /users?storeId=...&role=Vendedor Ambulante`, `GET /products?storeId=...&usesInventory=true`, `GET /vendor-inventories/:vendorId/:productId`, `POST /vendor-inventories/transaction` | Asignar/devolver inventario a vendedor |
| `src/pages/store-admin/vendors/vendor-quick-sale-page.tsx` | `GET /stores/:storeId`, `GET /products`, `GET /clients/:id`, `POST /orders` | Venta rápida del vendedor con cliente seleccionable, creado en flujo o precargado por `clientId` |
| `src/pages/store-admin/vendors/vendor-routes-page.tsx` | `GET /users?storeId=...&role=Vendedor Ambulante`, `GET /clients?storeId=...`, `POST /routes` | Crear rutas comerciales |
| `src/pages/store-admin/vendors/vendor-sales-page.tsx` | `GET /stores/:storeId`, `GET /products`, `GET /clients/:id`, `POST /orders` | Registrar pedido/venta del vendedor con cliente obligatorio dentro del flujo o precargado por `clientId` |
| `src/pages/store-admin/vendors/vendor-zones-page.tsx` | `GET /store-zones`, `PATCH /store-zones/:id`, `POST /store-zones`, `DELETE /store-zones/:id` | CRUD de zonas de tienda |
| `src/components/pos/add-client-dialog.tsx` usado desde `vendor-clients-page`, `billing-page`, `dispatcher-page`, `vendor-quick-sale-page` y `vendor-sales-page` | `POST /clients` | Alta rápida de cliente sin salir del flujo principal |

## 11. Lecturas técnicas importantes

### 11.1 El frontend consume API de forma bastante distribuida

No hay una capa fuerte de `services/` por dominio.  
Hoy gran parte de las páginas y componentes consumen `apiClient` directamente.

Eso significa:

- bueno para iterar rápido
- menos bueno para mantener contratos grandes a largo plazo

### 11.2 POS y dashboards mezclan consumo de datos con UI

En varios casos, el componente no solo renderiza; también consulta y transforma datos.

Ejemplos:

- `billing-page`
- `cash-register-page`
- `vendor-dashboard-page`
- `control-tower-page`

### 11.3 Hay intención de offline y realtime

Además del consumo REST, el frontend también usa:

- batch sync: `/sync/batch`
- websocket: `socket.io` bajo `/api-dev/socket.io`

Eso hace que la arquitectura del frontend sea más que un CRUD simple.

## 12. Conclusión práctica

Si mañana cambia un endpoint o un contrato JSON:

- primero hay que revisar este documento
- luego tocar el archivo consumidor concreto

La recomendación a futuro sería:

- mover consumos repetidos a servicios por dominio
- reducir llamadas API directas dentro de componentes UI
- dejar páginas más enfocadas en flujo y no en transporte HTTP
