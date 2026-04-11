# 👥 USUARIOS, ROLES Y PERMISOS — GUÍA OPERATIVA
**Fecha:** 09 de Abril, 2026  
**Sistema:** MultiTienda — Los Pinos  

---

## USUARIOS DE PRUEBA

| # | Rol | Email | Contraseña | Rol en BD |
|---|---|---|---|---|
| 1 | Administrador | `admin_test@lospinos.com` | — | store-admin |
| 2 | Bodeguero | `bodeg@lospinos.com` | `bodega123` | inventory |
| 3 | Vendedor | `vender@lospinos.com` | `ventas123` | vendor |
| 4 | Gestor Ventas | `gestor@lospinos.com` | `gestor123` | sales-manager |
| 5 | Rutero | `rute@lospinos.com` | `ruta123` | rutero |

---

## FLUJO DE TRABAJO POR PERFIL

### 1. ADMINISTRADOR — Control Total

**Menú:**
| Sección | Páginas |
|---|---|
| Operación | Comandas, Caja, Dashboard, Facturación, Bodega Logística |
| Inventario y compras | Productos, Movimientos, Proveedores, Facturas Proveedor |
| Finanzas | Cuentas por Cobrar, Cuentas por Pagar |
| Comercial | Reportes, Vendedores, Asignar Ruta, Rutas, Clientes, Asignar Inventario, Zonas |
| Administración | Autorizaciones, Usuarios, Configuración |

**Casos de uso:**
- ✅ Ver dashboard global de la tienda
- ✅ Crear/editar productos con 5 niveles de precio
- ✅ Gestionar departamentos y sub-departamentos
- ✅ Registrar facturas de proveedor
- ✅ Administrar cuentas por cobrar y pagar
- ✅ Ver estado de todos los pedidos
- ✅ Configurar tienda (IVA, modo despachador, etc.)
- ✅ Gestionar usuarios de la tienda

---

### 2. BODEGUERO — Guardián del Stock

**Menú:**
| Sección | Páginas |
|---|---|
| Operación | Bodega Logística, Productos, Movimientos, Ajustes |
| Apoyo | Proveedores, Facturas Proveedor, Ayuda |

**Casos de uso:**
- ✅ Rectificar inventario (corregir conteo físico)
- ✅ Ajustar inventario (mermas, averías)
- ✅ Ver Kardex completo (entradas/salidas con saldo)
- ✅ Registrar entradas de mercadería
- ✅ Ver facturas de proveedores
- ⚠️ Preparar/alistar/despachar pedidos (via cambios de estado — el bodeguero necesita la pantalla de estados del pedido)

---

### 3. VENDEDOR — Preventa en Campo

**Menú:**
| Sección | Páginas |
|---|---|
| Operación | Venta Rápida, Clientes, Mis Ventas |
| Apoyo | Ayuda |

**Casos de uso:**
- ✅ Consultar catálogo y precios en tiempo real
- ✅ Registrar pedido al Contado
- ✅ Registrar pedido a Crédito (crea cuenta por cobrar automáticamente)
- ✅ Seleccionar cliente existente o crear nuevo
- ✅ Ver historial de sus ventas del día
- ✅ El pedido automáticamente aparece en "Asignar Ruta" del Gestor
- ⚠️ Devolver mercancía no vendida (backend listo, falta UI)

**Flujo típico:**
1. Abre "Venta Rápida"
2. Selecciona cliente (o crea uno nuevo)
3. Busca productos en el catálogo
4. Agrega al carrito con cantidades
5. Elige Contado o Crédito
6. Pulsa "Registrar"
7. El sistema: crea `order` + `order_items` + `pending_delivery` + `accounts_receivable` (si crédito)

---

### 4. GESTOR DE VENTAS — Planificación y Supervisión

**Menú:**
| Sección | Páginas |
|---|---|
| Operación | Panel Comercial, Asignar Ruta, Rutas, Mis Ventas |
| Comercial | Clientes, Gestionar Zonas, Cobranzas, Carga de Inventario, Personal de Ruta |
| Apoyo | Ayuda |

**Casos de uso:**
- ✅ Ver Panel Comercial con visitas del día/pendientes
- ✅ Registrar visita a cliente (con o sin pedido)
- ✅ **Asignar pedidos pendientes a un Rutero** (el puente ventas→logística)
- ✅ Planificar rutas diarias (vendedor + clientes + fecha)
- ✅ Cobrar cuentas pendientes (total o parcial)
- ✅ Asignar inventario a vendedores y ruteros
- ✅ Ver todas las ventas del equipo
- ✅ Gestionar zonas y días de visita

**Flujo de asignación:**
1. Abre "Asignar Ruta"
2. Ve todos los pedidos pendientes (con checkbox)
3. Selecciona los pedidos que desea despachar
4. Elige un Rutero del selector
5. Pulsa "Confirmar Asignación"
6. Los pedidos aparecen en la "Ruta de Entrega" del Rutero seleccionado

---

### 5. RUTERO — Entrega y Cobranza en Calle

**Menú:**
| Sección | Páginas |
|---|---|
| Operación | Ruta de Entrega |
| Apoyo | Ayuda |

**Casos de uso:**
- ✅ Ver pedidos asignados para entrega
- ✅ Ver detalle: cliente, dirección, productos, total, tipo de pago
- ✅ Enlace a Google Maps si hay coordenadas
- ✅ Marcar como "Entregado" o "No Entregado"
- ✅ Auto-actualización cada 30 segundos
- ⚠️ Cierre de caja (backend OK, falta UI)
- ⚠️ Registrar devolución (backend OK, falta UI)

**Flujo típico:**
1. Recibe mercancía cargada (inventario se transfiere al cambiar estado a CARGADO_CAMION)
2. Abre "Ruta de Entrega"
3. Selecciona un pedido → expande detalles
4. Si hay dirección → abre Google Maps
5. Entrega el pedido → pulsa "Marcar como Entregado"
6. Si no puede entregar → pulsa "No Entregado"

---

## NORMALIZACIÓN DE ROLES

El sistema reconoce las siguientes variaciones para cada perfil:

| Perfil Final | Valores Aceptados en BD |
|---|---|
| `master-admin` | master-admin, master_admin, superadmin |
| `owner` | owner |
| `chain-admin` | chain-admin, chain_admin |
| `store-admin` | store-admin, store_admin, admin |
| `inventory` | inventory, bodeguero, warehouse |
| `cashier` | cashier, cajero, pos |
| `dispatcher` | dispatcher, despachador |
| `rutero` | rutero, repartidor, despachador-de-ruta, driver, delivery |
| `vendor` | vendor, vendedor, vendedor-ambulante, preventa, salesman |
| `sales-manager` | sales-manager, sales_manager, gestor-ventas, gestor_ventas |

**Archivo:** `web/src/lib/user-role.ts` → función `normalizeUserRole()`

---

## PERMISOS DE RUTA (App.tsx)

| Grupo de Permisos | Roles Incluidos | Páginas |
|---|---|---|
| `MASTER_ROLES` | master-admin, owner | Panel maestro, tiendas, cadenas, licencias, monitor |
| `STORE_ADMIN_ROLES` | store-admin | Dashboard, reportes, usuarios, config, finanzas |
| `CASHIER_ROLES` | cashier, store-admin | Facturación, caja registradora |
| `INVENTORY_ROLES` | inventory, store-admin | Productos, movimientos, ajustes, proveedores, bodega |
| `DISPATCH_ROLES` | dispatcher, store-admin, sales-manager | Despacho, comandas |
| `DELIVERY_ROLES` | rutero, store-admin, sales-manager | Ruta de entrega |
| `SALES_TEAM_ROLES` | vendor, sales-manager, store-admin | Venta rápida, clientes, ventas, zonas |
| `SALES_ADMIN_ROLES` | sales-manager, store-admin | Asignar ruta, rutas, vendedores, inventario vendedor |
