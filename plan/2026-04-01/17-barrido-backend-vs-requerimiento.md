# 17 - Barrido Backend vs Requerimiento y Plan

**Fecha:** 2026-04-01  
**Proyecto:** `pino`

## 1. Objetivo

Contrastar el backend NestJS actual contra:

- [requerimiento.txt](/opt/apps/pino/plan/2026-03-31/requerimiento.txt)
- [05-plan-backend-nestjs.md](/opt/apps/pino/plan/2026-04-01/05-plan-backend-nestjs.md)

Este documento reemplaza la lectura literal de los planes viejos cuando estos ya quedaron desactualizados por implementación posterior.

## 2. Resumen ejecutivo

Estado del backend frente al requerimiento base:

- **Cumplido fuerte:** autenticación, tiendas, usuarios, productos, departamentos, inventario base, pedidos, facturación, cuentas por cobrar, cuentas por pagar, cobros, devoluciones, rutas, zonas, sincronización batch y monitor de sync.
- **Cumplido parcial:** preparación/alistamiento/despacho como flujo explícito de web, inventario de bodega/rutero como endpoints dedicados, y realtime fino por tipo de evento.
- **Pendiente real de arquitectura/producto:** ampliar el realtime más allá del patrón genérico actual y endurecer la trazabilidad de los estados operativos de bodega.

Hallazgo importante:

- los documentos [00-resumen-ejecutivo.md](/opt/apps/pino/plan/2026-04-01/00-resumen-ejecutivo.md), [01-analisis-gap-backend.md](/opt/apps/pino/plan/2026-04-01/01-analisis-gap-backend.md) y [05-plan-backend-nestjs.md](/opt/apps/pino/plan/2026-04-01/05-plan-backend-nestjs.md) quedaron **parcialmente viejos**; describen módulos como faltantes cuando hoy ya existen en código.

## 3. Matriz por bloque funcional

### 3.1 Catálogo, tiendas y seguridad

**Cumplido**

- `auth`
- `users`
- `stores`
- `chains`
- `config`
- `zones` y `store-zones`
- `departments`

Evidencia:

- [auth.controller.ts](/opt/apps/pino/backend/src/modules/auth/auth.controller.ts)
- [users.controller.ts](/opt/apps/pino/backend/src/modules/users/users.controller.ts)
- [stores.controller.ts](/opt/apps/pino/backend/src/modules/stores/stores.controller.ts)

### 3.2 Productos e inventario

**Cumplido fuerte**

- productos con `units_per_bulk`, `stock_bulks`, `stock_units`
- ajustes de inventario con split bultos/unidades derivado
- movimientos/kárdex
- inventario del rutero en `vendor_inventories`

Evidencia:

- [products.service.ts](/opt/apps/pino/backend/src/modules/products/products.service.ts)
- [inventory.service.ts](/opt/apps/pino/backend/src/modules/inventory/inventory.service.ts)
- [vendor-inventories.service.ts](/opt/apps/pino/backend/src/modules/vendor-inventories/vendor-inventories.service.ts)

**Parcial**

- ya existen endpoints dedicados para inventario de bodega y de rutero dentro de `inventory`
- la transferencia bodega -> rutero existe en la práctica dentro de `orders.updateStatus()` al cargar camión, no como API explícita separada

### 3.3 Pedidos, bodega, preparación y despacho

**Cumplido fuerte**

- creación de pedidos contado/crédito
- cuenta por cobrar automática en crédito
- máquina de estados
- transferencia a inventario del rutero al pasar a `CARGADO_CAMION`
- descuento de inventario del rutero al marcar `ENTREGADO`

Evidencia:

- [orders.service.ts](/opt/apps/pino/backend/src/modules/orders/orders.service.ts)
- [orders.controller.ts](/opt/apps/pino/backend/src/modules/orders/orders.controller.ts)
- [pending-orders.service.ts](/opt/apps/pino/backend/src/modules/pending-orders/pending-orders.service.ts)
- [pending-deliveries.service.ts](/opt/apps/pino/backend/src/modules/pending-deliveries/pending-deliveries.service.ts)

**Parcial**

- el requerimiento habla de recepción, preparación, alistamiento y despacho como flujo operativo visible
- hoy la base está en la máquina de estados `RECIBIDO -> EN_PREPARACION -> ALISTADO -> CARGADO_CAMION -> EN_ENTREGA -> ENTREGADO`
- ya existen endpoints auxiliares (`prepare`, `stage`, `load-truck`, `dispatch`, `deliver`)
- todavía no existe un módulo separado de bodega; el flujo sigue concentrado en `orders`

### 3.4 Cobros, CxC, CxP y facturas

**Cumplido fuerte**

- cuentas por cobrar
- pagos parciales y bloqueo de sobrepago
- cobros (`collections`)
- facturas proveedor
- cuentas por pagar
- pago de cuentas por pagar
- cierre diario

Evidencia:

- [accounts-receivable.service.ts](/opt/apps/pino/backend/src/modules/accounts-receivable/accounts-receivable.service.ts)
- [collections.service.ts](/opt/apps/pino/backend/src/modules/collections/collections.service.ts)
- [accounts-payable.service.ts](/opt/apps/pino/backend/src/modules/accounts-payable/accounts-payable.service.ts)
- [invoices.service.ts](/opt/apps/pino/backend/src/modules/invoices/invoices.service.ts)
- [daily-closings.service.ts](/opt/apps/pino/backend/src/modules/daily-closings/daily-closings.service.ts)

### 3.5 Devoluciones

**Cumplido fuerte**

- devolución desde operación de ruta
- devolución desde POS/venta
- retorno de mercancía a bodega
- descuento del inventario del rutero cuando aplica
- movimiento de inventario tipo `IN`

Evidencia:

- [returns.service.ts](/opt/apps/pino/backend/src/modules/returns/returns.service.ts)

### 3.6 Sync y realtime

**Cumplido base**

- batch sync
- monitor de sincronización
- estado por tienda
- reintento manual desde monitor

Evidencia:

- [sync.controller.ts](/opt/apps/pino/backend/src/modules/sync/sync.controller.ts)
- [sync.service.ts](/opt/apps/pino/backend/src/modules/sync/sync.service.ts)

Fix reciente del barrido:

- ya existe `POST /sync/force/:storeId`, que antes era un gap real del frontend `master-sync-monitor`

**Parcial**

- el backend sí emite eventos websocket con `EventsGateway`
- ya emite al menos `NEW_ORDER`, `ORDER_STATUS_CHANGE`, `NEW_RETURN`, `NEW_COLLECTION`, `NEW_VISIT`, `PRODUCT_CREATED`, `PRODUCT_UPDATED` e `INVENTORY_UPDATE`
- todavía no está endurecido como catálogo formal de eventos con helpers por dominio ni cobertura completa de transferencias específicas de rutero

Evidencia:

- [events.gateway.ts](/opt/apps/pino/backend/src/common/gateways/events.gateway.ts)

## 4. Comparación contra el plan viejo

### Ya no son brecha real

Estos bloques estaban listados como trabajo futuro y hoy ya existen:

- `returns`
- `collections`
- `accounts-payable`
- `daily-closings`
- `vendor-inventories`

### Siguen parciales respecto al plan

- endpoints auxiliares de estados de pedido
- helpers/eventos websocket más precisos por dominio
- endpoints dedicados de inventario bodega/rutero fuera de `vendor-inventories`

## 5. Conclusión práctica

El backend actual **sí cubre el núcleo operativo del requerimiento** y está mucho más avanzado que lo que reflejan los planes iniciales.  
Lo que falta ya no es “crear módulos grandes inexistentes”, sino:

- formalizar mejor el flujo de bodega/preparación/alistamiento
- ampliar el realtime de forma más explícita
- seguir cerrando contratos finos entre React y backend

En resumen:

- **backend core:** sólido
- **backend vs requerimiento:** ampliamente cubierto
- **backend vs plan viejo:** el plan quedó parcialmente superado por el código actual
