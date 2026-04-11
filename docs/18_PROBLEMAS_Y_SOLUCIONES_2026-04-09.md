# 🔧 PROBLEMAS ENCONTRADOS Y SOLUCIONES APLICADAS
**Fecha:** 09 de Abril, 2026  
**Sesión:** Auditoría del Módulo Comercial y Logístico  

---

## RESUMEN EJECUTIVO

Se identificaron y resolvieron **7 problemas** durante la auditoría. Se detectaron **4 brechas funcionales** pendientes de implementación.

---

## PROBLEMAS RESUELTOS

### 🔴 P1 — Desconexión Ventas ↔ Logística (CRÍTICO)

**Síntoma:**  
Los pedidos registrados por el vendedor (`vender@lospinos.com`) no aparecían en la pantalla de "Asignar Ruta" del gestor (`gestor@lospinos.com`).

**Causa Raíz:**  
El servicio `OrdersService.create()` guardaba el pedido en la tabla `orders` y sus items en `order_items`, pero **nunca insertaba un registro en `pending_deliveries`**. Sin ese registro, la pantalla de "Asignar Ruta" no tenía datos que mostrar.

**Archivo Modificado:**  
`backend/src/modules/orders/orders.service.ts` (línea ~78)

**Solución Aplicada:**  
```sql
INSERT INTO pending_deliveries (store_id, order_id, client_id, address, status)
VALUES ($1, $2, $3, (SELECT address FROM clients WHERE id = $3 LIMIT 1), 'Pendiente')
```
Se ejecuta automáticamente después de insertar los `order_items`, dentro de la misma transacción.

**Impacto:**  
Todo pedido nuevo ahora es visible para el Gestor en "Asignar Ruta" de forma inmediata.

---

### 🔴 P2 — Roles No Reconocidos (CRÍTICO)

**Síntoma:**  
Usuarios con roles en español ("Vendedor", "Gestor Ventas", "Repartidor") veían menús vacíos o eran redirigidos al login.

**Causa Raíz:**  
La función `normalizeUserRole()` en `web/src/lib/user-role.ts` solo reconocía valores exactos en inglés (`vendor`, `sales-manager`, etc.) y no las variaciones que existen en la base de datos de producción.

**Archivo Modificado:**  
`web/src/lib/user-role.ts` (líneas 47-56)

**Solución Aplicada:**  
Se añadieron 5 nuevos casos al switch:
- `'vendedor'` → `'vendor'`
- `'vendedor-ambulante'` → `'vendor'`
- `'gestor-ventas'` → `'sales-manager'`
- `'repartidor'` → `'rutero'`
- `'despachador-de-ruta'` → `'rutero'`

---

### 🔴 P3 — Errores NaN en Cálculos de Precio (CRÍTICO)

**Síntoma:**  
Los totales de venta aparecían como "NaN" en la pantalla de Venta Rápida y en el Dashboard.

**Causa Raíz:**  
El campo `salePrice` llegaba como string desde la API PostgreSQL, y la multiplicación `string * number` producía `NaN`.

**Archivo Modificado:**  
`web/src/pages/store-admin/vendors/vendor-quick-sale-page.tsx` (línea 137)

**Solución Aplicada:**  
```javascript
// Antes:
cart.reduce((acc, item) => acc + item.salePrice * item.quantity, 0)

// Después:
cart.reduce((acc, item) => acc + (Number(item.salePrice) || 0) * item.quantity, 0)
```

---

### 🔴 P4 — Import Incorrecto de Librería (CRÍTICO)

**Síntoma:**  
La página del Panel Comercial no cargaba. Error en consola: `Module not found: lucide-center`.

**Causa Raíz:**  
Typo en import: `from 'lucide-center'` en lugar de `from 'lucide-react'`.

**Archivo Modificado:**  
`web/src/pages/store-admin/vendors/vendor-dashboard-page.tsx` (línea 2)

---

### 🟠 P5 — Navegación Incompleta del Gestor (ALTO)

**Síntoma:**  
El perfil Gestor de Ventas no podía acceder a Cobranzas, Carga de Inventario ni Personal de Ruta desde el menú lateral.

**Archivo Modificado:**  
`web/src/components/app-layout.tsx` (función `getGestorVentasNav`)

**Solución:**  
Se añadieron 3 ítems al menú + traducciones ES/EN correspondientes:
- `Cobranzas` → `/store/:storeId/vendors/collections`
- `Carga de Inventario` → `/store/:storeId/vendors/inventory`
- `Personal de Ruta` → `/store/:storeId/vendors`

---

### 🟡 P6 — Filtro de Inventario Excluía Ruteros (MEDIO)

**Síntoma:**  
Al abrir "Carga de Inventario", el selector solo mostraba vendedores, no ruteros. Pero los ruteros también llevan mercancía.

**Archivo Modificado:**  
`web/src/pages/store-admin/vendors/vendor-inventory-page.tsx` (línea 41)

**Solución:**  
```javascript
// Antes:
normalizeUserRole(u.role) === 'vendor'

// Después:
['vendor', 'rutero'].includes(normalizeUserRole(u.role))
```

---

### 🟡 P7 — Filtro de Rutas Excluía Ruteros (MEDIO)

**Síntoma:**  
En el planificador de rutas diarias, el selector solo mostraba vendedores.

**Archivo Modificado:**  
`web/src/pages/store-admin/vendors/vendor-routes-page.tsx` (línea 56)

**Solución:** Idéntica a P6.

---

## BRECHAS FUNCIONALES PENDIENTES

### ⚠️ B1 — Página de Devoluciones del Vendedor/Rutero (ALTA PRIORIDAD)

**Estado Backend:** ✅ Completo — `ReturnsService` (426 líneas) con:
- Devolución por bultos/unidades
- Ajuste bidireccional de inventario (rutero → bodega)
- Registro en Kardex (`movements`)
- Idempotencia vía `external_id`
- Notificación real-time `NEW_RETURN`

**Estado Frontend:** ❌ No existe página web dedicada

**Para implementar:**
- Crear `vendor-returns-page.tsx`
- Agregar ruta en `App.tsx`
- Agregar ítem en menú del Vendedor y Rutero en `app-layout.tsx`

---

### ⚠️ B2 — Cierre de Caja del Rutero (MEDIA)

**Estado Backend:** ✅ Tabla `daily_closings` + módulo registrado  
**Estado Frontend:** ❌ No existe página

---

### ⚠️ B3 — Flutter: UI de Preventa y Rutero (EN PAUSA)

El directorio `flutter/` contiene la estructura base del proyecto pero las pantallas de UI están en desarrollo activo detenido. El backend está 100% listo para recibir llamadas de Flutter.

---

### ⚠️ B4 — Autorización de Precios 4 y 5 (PARCIAL)

El sistema tiene una página `authorizations-page.tsx` pero el flujo de solicitud-aprobación no está detallado por el cliente (vacío funcional §19.2 del requerimiento).
