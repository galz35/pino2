# 🔧 FUNCIONES POR ROL Y MÓDULO
### Sistema MultiTienda · 13 abril 2026

---

## ROLES Y PERMISOS

### 🟪 master-admin (Dueño General)
- **Plataforma:** Web
- **Acceso:** Absoluto a todo el sistema
- **Puede:** Crear tiendas, crear admins, manejar cadenas, ver monitor sync, comparar tiendas, entrar a cualquier sucursal
- **Menú:** Panel, Tiendas, Cadenas, Usuarios, Licencias, Monitor Sync, Comparar Tiendas, Zonas, Sub-Zonas, Configuración

### 🟥 store-admin (Administrador de Tienda)
- **Plataforma:** Web
- **Acceso:** Solo su tienda asignada
- **Puede:** Gestionar productos, inventario, ventas, facturación, finanzas, empleados, rutas, reportes
- **No puede:** Crear nuevas tiendas, ver otras sucursales
- **Menú:** Caja, Comandas, Facturación, Panel, Inventario (grupo), Finanzas (grupo), Reportes, Comercial (grupo), Equipo (grupo), Configuración

### 🟩 inventory / Bodeguero
- **Plataforma:** Web
- **Acceso:** Solo módulos de inventario de su tienda
- **Puede:** Rectificar inventario, ajustar stock, preparar pedidos, alistar, despachar, recibir devoluciones
- **Menú:** Bodega, Productos, Entrada, Movimientos, Ajustes, Proveedores, Facturas Proveedor

### 🟦 cashier / Cajero
- **Plataforma:** Web
- **Acceso:** Solo facturación y caja
- **Puede:** Cobrar, abrir/cerrar turnos de caja
- **Menú:** Facturación, Comandas (si habilitado), Caja

### 🟧 Rutero
- **Plataforma:** Flutter (App Móvil)
- **Acceso:** Solo operación de su ruta
- **Puede:** Ver inventario asignado, entregar pedidos, cobrar, registrar devoluciones, cierre de caja
- **Menú Flutter:** Ruta de Hoy, Cobranzas, Devoluciones, Cierre de Caja

### 🟨 vendor / Vendedor Ambulante (Preventa)
- **Plataforma:** Flutter (App Móvil)
- **Acceso:** Solo creación de pedidos
- **Puede:** Consultar catálogo, levantar pedidos contado/crédito, ver clientes, emitir ventas
- **Menú Flutter:** Venta Rápida, Clientes, Historial Ventas, Cobranzas, Devoluciones

### 🟫 sales-manager / Gestor de Ventas
- **Plataforma:** Web
- **Acceso:** Solo módulos comerciales
- **Puede:** Ver dashboard de ventas, gestionar rutas y despacho, supervisar equipos
- **Menú:** Dashboard Ventas, Rutas y Despacho, Ventas, Clientes, Zonas, Cobranzas, Inventario Vendedor, Personal

### 🔵 chain-admin / Administrador de Cadena
- **Plataforma:** Web
- **Acceso:** Múltiples tiendas de una cadena
- **Puede:** Supervisar tiendas de su cadena
- **Menú:** Panel, Tiendas

### 🔘 dispatcher / Despachador
- **Plataforma:** Web
- **Acceso:** Solo despacho y bodega
- **Puede:** Despachar, ver bodega
- **Menú:** Despacho, Bodega

---

## FUNCIONES POR MÓDULO

### 📦 INVENTARIO
| Función | Quién la usa | Dónde |
|---|---|---|
| Registrar entrada de producto | Bodeguero, Admin | Web: `/inventory/entry` |
| Ver movimientos de stock | Bodeguero, Admin | Web: `/inventory/movements` |
| Ajustar inventario (rectificación) | Bodeguero | Web: `/inventory/adjustments` |
| Dashboard de bodega | Bodeguero, Admin | Web: `/warehouse` |
| Transferir inventario a rutero | Admin | Web: `/vendors/inventory` |
| Ver inventario del rutero | Admin, Rutero | Web: `/vendors/inventory`, Flutter |
| Consultar catálogo/existencias | Preventa | Flutter: `product_catalog_screen` |

### 🛒 PEDIDOS Y VENTAS
| Función | Quién la usa | Dónde |
|---|---|---|
| Levantar pedido (contado/crédito) | Preventa | Flutter: `quick_order_screen` |
| Recibir pedidos entrantes | Bodeguero, Admin | Web: `/pending-orders` |
| Preparar, alistar, despachar | Bodeguero | Web: `/warehouse`, `/dispatcher` |
| Ver pipeline de estados | Admin | Web: `/orders-pipeline` |
| Facturación presencial (POS) | Cajero, Admin | Web: `/facturacion` |
| Entregar pedido en ruta | Rutero | Flutter: `route_board_screen` |

### 💰 FINANZAS
| Función | Quién la usa | Dónde |
|---|---|---|
| Cuentas por cobrar | Admin | Web: `/finance/receivables` |
| Registrar cobro/abono | Admin, Rutero | Web + Flutter: `collections_screen` |
| Aging de cartera | Admin | Web: `/finance/aging` |
| Cuentas por pagar | Admin | Web: `/finance/payables` |
| Ingreso factura proveedor | Admin, Bodeguero | Web: `/suppliers/invoice` |
| Cierre de caja rutero | Rutero | Flutter: `daily_closing_screen` |
| Turnos de caja tienda | Cajero, Admin | Web: `/cash-register` |

### 🚛 LOGÍSTICA
| Función | Quién la usa | Dónde |
|---|---|---|
| Gestionar rutas | Admin, Gestor | Web: `/vendors/routes` |
| Asignar ruta | Admin | Web: `/vendors/assign-route` |
| Gestionar zonas | Admin | Web: `/vendors/zones` |
| Ver ruta del día | Rutero | Flutter: `route_board_screen` |
| Registrar devolución | Rutero | Flutter: `returns_screen` |

### 👥 ADMINISTRACIÓN
| Función | Quién la usa | Dónde |
|---|---|---|
| CRUD usuarios | Admin, Master | Web: `/users` |
| Autorizaciones de precios | Admin | Web: `/authorizations` |
| Configuración de tienda | Admin | Web: `/settings` |
| Gestión de vendedores | Admin, Gestor | Web: `/vendors` |
| Reportes | Admin | Web: `/reports` |
| Monitoreo de sincronización | Master Admin | Web: `/master-admin/sync-monitor` |
| Comparar tiendas | Master Admin | Web: `/master-admin/comparison` |

---

## TIEMPO REAL (Socket.IO)

| Evento | Disparado por | Consumido por |
|---|---|---|
| `NEW_ORDER` | Preventa crea pedido | Bodega, Admin |
| `NEW_VISIT` | Vendedor registra visita | Admin |
| `PRODUCT_CREATED` | Admin crea producto | Flutter (catálogo) |
| `PRODUCT_UPDATED` | Admin actualiza producto | Flutter (catálogo) |
| `ORDER_STATUS_CHANGE` | Bodega cambia estado | Admin, Rutero |
| `INVENTORY_UPDATE` | Movimiento de stock | Todas las plataformas |
| `NOTIFICATION` | Sistema | Todos los usuarios |
