# 🗃️ BASE DE DATOS — MAPA COMPLETO DE TABLAS
**Fecha:** 09 de Abril, 2026  
**Archivo Fuente:** `backend/src/database/schema.sql` (535 líneas)  
**Motor:** PostgreSQL con extensión `uuid-ossp`  

---

## RESUMEN

| Sección | Tablas | Descripción |
|---|---|---|
| Contexto y Seguridad | 4 | chains, stores, users, user_stores |
| Catálogo | 2 | departments, products |
| Ventas y Caja | 3 | cash_shifts, sales, sale_items |
| Inventario (Kardex) | 1 | movements |
| Clientes y Proveedores | 2 | clients, suppliers |
| Pedidos | 2 | orders, order_items |
| Zonas Geográficas | 2 | zones, sub_zones |
| Licencias | 1 | licenses |
| Facturas | 2 | invoices, invoice_items |
| Configuración | 1 | config |
| Vendedor/Rutero | 1 | vendor_inventories |
| Cuentas por Cobrar | 2 | accounts_receivable, account_payments |
| Comandas (Despacho) | 1 | pending_orders |
| Entregas Logísticas | 1 | pending_deliveries |
| Zonas por Tienda | 1 | store_zones |
| Visitas | 1 | visit_logs |
| Devoluciones | 2 | returns, return_items |
| Cobros | 1 | collections |
| Cuentas por Pagar | 2 | accounts_payable, payable_payments |
| Cierre de Caja | 1 | daily_closings |
| Rutas | 1 | routes |
| Auditoría SQL | 2 | consultasql, consultasql_historial |
| **TOTAL** | **36** | |

---

## DETALLE POR TABLA

### 🔐 SEGURIDAD Y ORGANIZACIÓN

#### `chains`
Cadenas comerciales (ej. "Los Pinos Distribuidora")
| Columna | Tipo | FK |
|---|---|---|
| id | UUID PK | — |
| name | VARCHAR(100) | — |
| logo_url | TEXT | — |
| owner_name | VARCHAR(100) | — |
| status | VARCHAR(20) | — |

#### `stores`
Sucursales dentro de una cadena
| Columna | Tipo | FK |
|---|---|---|
| id | UUID PK | — |
| chain_id | UUID | → chains |
| name | VARCHAR(100) | — |
| settings | JSONB | — (contiene: exchangeRate, enableDispatcherMode, enableSalesManagerMode, etc.) |

#### `users`
Todos los usuarios del sistema
| Columna | Tipo | Nota |
|---|---|---|
| id | UUID PK | — |
| email | VARCHAR(150) UNIQUE | — |
| password_hash | TEXT | bcrypt |
| role | VARCHAR(50) | Valor libre; normalizado en frontend |
| refresh_token | TEXT | JWT refresh |

#### `user_stores`
Relación N:M usuario↔tienda
| Columna | Tipo | FK |
|---|---|---|
| user_id | UUID | → users |
| store_id | UUID | → stores |

---

### 📦 CATÁLOGO

#### `products`
Producto con 5 niveles de precio y manejo de bultos/unidades
| Columna | Tipo | Nota |
|---|---|---|
| id | UUID PK | — |
| store_id | UUID FK | → stores |
| department_id | UUID FK | → departments |
| barcode | VARCHAR(100) | Código de barras |
| description | TEXT | Nombre/descripción |
| sale_price | DECIMAL(12,2) | Precio base (precio1) |
| cost_price | DECIMAL(12,2) | Costo |
| current_stock | INT | Stock total en unidades |
| **price1-price5** | DECIMAL(12,2) | 5 niveles de precio (§11) |
| **units_per_bulk** | INT | Unidades por bulto (§10) |
| **stock_bulks** | INT | Bultos actuales |
| **stock_units** | INT | Unidades sueltas actuales |
| uses_inventory | BOOLEAN | Si maneja inventario |

---

### 🛒 VENTAS Y CAJA

#### `cash_shifts`
Turnos de caja
| Columna | Tipo | Nota |
|---|---|---|
| starting_cash | DECIMAL | Efectivo inicial |
| expected_cash | DECIMAL | Esperado al cierre |
| actual_cash | DECIMAL | Real al cierre |
| difference | DECIMAL | Diferencia |

#### `sales` + `sale_items`
Ventas POS (caja física de tienda)

---

### 📋 PEDIDOS

#### `orders`
Pedidos levantados por vendedor o preventa
| Columna | Tipo | Nota |
|---|---|---|
| vendor_id | UUID FK | Quién levantó el pedido |
| client_id | UUID FK | A quién va |
| status | VARCHAR(30) | PENDING → RECIBIDO → EN_PREPARACION → ALISTADO → CARGADO_CAMION → EN_ENTREGA → ENTREGADO |
| **payment_type** | VARCHAR(20) | CONTADO / CREDITO (§7.1) |
| **price_level** | INT | 1-5 (§11) |
| external_id | UUID UNIQUE | Idempotencia para sync Flutter |

#### `order_items`
Detalle del pedido
| Columna | Tipo | Nota |
|---|---|---|
| **presentation** | VARCHAR(10) | UNIT / BULK (§10.4) |
| **price_level** | INT | Nivel de precio usado |

---

### 🏭 INVENTARIO VENDEDOR/RUTERO

#### `vendor_inventories`
Inventario personal del vendedor o rutero (mercancía que lleva consigo)
| Columna | Tipo | Nota |
|---|---|---|
| vendor_id | UUID FK | → users (vendedor o rutero) |
| product_id | UUID FK | → products |
| assigned_quantity | INT | Total asignado originalmente |
| sold_quantity | INT | Vendido del asignado |
| current_quantity | INT | Restante disponible |
| **assigned_bulks** | INT | Bultos asignados |
| **current_bulks** | INT | Bultos actuales |
| **assigned_units** | INT | Unidades asignadas |
| **current_units** | INT | Unidades actuales |

---

### 📬 ENTREGAS LOGÍSTICAS

#### `pending_deliveries`
El puente entre Ventas y Logística
| Columna | Tipo | Nota |
|---|---|---|
| order_id | UUID FK | → orders (viene de la venta) |
| rutero_id | UUID FK | → users (quien entrega, NULL si no asignado) |
| client_id | UUID FK | → clients |
| address | TEXT | Dirección de entrega |
| status | VARCHAR(50) | Pendiente → Asignado → Entregado / No Entregado |

---

### ↩️ DEVOLUCIONES

#### `returns`
Cabecera de la devolución
| Columna | Tipo | Nota |
|---|---|---|
| rutero_id | UUID FK | Quién devuelve |
| order_id | UUID FK | De qué pedido viene |
| total | DECIMAL | Total monetario devuelto |
| external_id | UUID UNIQUE | Idempotencia Flutter |

#### `return_items`
Detalle de productos devueltos
| Columna | Tipo | Nota |
|---|---|---|
| **quantity_bulks** | INT | Bultos devueltos (§10) |
| **quantity_units** | INT | Unidades devueltas |

---

### 💰 FINANCIERO

#### `accounts_receivable` + `account_payments`
Cuentas por cobrar con pagos parciales

#### `accounts_payable` + `payable_payments`
Cuentas por pagar a proveedores

#### `collections`
Cobros hechos en ruta por el rutero

#### `daily_closings`
Cierre de caja del rutero (§14.3)
| Columna | Tipo |
|---|---|
| total_sales | DECIMAL |
| total_collections | DECIMAL |
| total_returns | DECIMAL |
| cash_total | DECIMAL |
| closing_date | DATE |

---

## DIAGRAMA DE RELACIONES PRINCIPALES

```
chains ─┬─ stores ─┬─ products ─── movements (Kardex)
        │          ├─ users ────── user_stores
        │          ├─ clients
        │          ├─ orders ───── order_items
        │          │    └─ pending_deliveries (Logística)
        │          ├─ vendor_inventories (Stock vendedor/rutero)
        │          ├─ returns ──── return_items
        │          ├─ collections
        │          ├─ accounts_receivable ── account_payments
        │          ├─ accounts_payable ──── payable_payments
        │          ├─ invoices ── invoice_items
        │          ├─ routes
        │          ├─ store_zones
        │          ├─ visit_logs
        │          └─ daily_closings
        │
        └─ suppliers
```

---

## ÍNDICES DE PERFORMANCE (15 índices creados)

- `idx_products_store_barcode` — Búsqueda de productos por barcode
- `idx_orders_store_status` — Filtro de pedidos por tienda/estado
- `idx_vendor_inventories_vendor` — Inventario del vendedor
- `idx_pending_deliveries_store` — Entregas por tienda
- `idx_pending_deliveries_rutero` — Entregas por rutero
- `idx_returns_store`, `idx_returns_rutero` — Devoluciones
- `idx_collections_rutero_date` — Cobros por rutero y fecha
- `idx_daily_closings_rutero` — Cierres por rutero y fecha
- `idx_accounts_receivable_store`, `idx_accounts_receivable_client`
- `idx_accounts_payable_store`
- `idx_store_zones_store`, `idx_routes_store`
- `idx_visit_logs_store_vendor`
