# 📋 PLAN DE TRABAJO — TAREAS PENDIENTES
**Fecha:** 09 de Abril, 2026  
**Estado:** Sistema al 90% de cumplimiento del requerimiento.txt  

---

## FASE 1 — Completar Brechas Funcionales Web (Prioridad Alta)

### [x] 1.1 Crear página de Devoluciones del Vendedor/Rutero ✅ COMPLETADO
- **Prioridad:** 🔴 ALTA (cierra el ciclo operativo del §15 y §6.6)
- **Backend:** Ya listo → `POST /returns` con `ruteroId` + items (bultos/unidades)
- **Creado:** `web/src/pages/store-admin/vendors/vendor-returns-page.tsx`
- **Ruta registrada en:** `web/src/App.tsx` → `/store/:storeId/vendors/returns`
- **Menú agregado en:** `web/src/components/app-layout.tsx` → Vendedor + Rutero
- **Lógica implementada:**
  - [x] Listar inventario del vendedor/rutero (GET `/vendor-inventories?vendorId=...`)
  - [x] Permitir seleccionar productos y cantidades (bultos + unidades)
  - [x] Enviar `POST /returns` con los items
  - [x] Mostrar confirmación con total devuelto
  - [x] El stock regresa a bodega automáticamente (backend ya lo hace)

### [x] 1.2 Crear página de Cierre de Caja del Rutero ✅ COMPLETADO
- **Prioridad:** 🟡 MEDIA (§14.3)
- **Backend:** Tabla `daily_closings` existe + módulo registrado
- **Creado:** `web/src/pages/store-admin/delivery-route/rutero-daily-closing-page.tsx`
- **Ruta registrada en:** `web/src/App.tsx`
- **Menú agregado en:** `app-layout.tsx` → Rutero
- **Lógica implementada:**
  - [x] Calcular total ventas del día (GET `/pending-deliveries`)
  - [x] Calcular total cobros del día (GET `/accounts-receivable`)
  - [x] Calcular total devoluciones (GET `/returns`)
  - [x] Mostrar resumen + botón "Cerrar Caja"
  - [x] `POST /daily-closings` con los totales

---

## FASE 2 — Validación y Pruebas (Prioridad Media)

### [x] 2.1 Prueba de flujo completo punta a punta
- [x] Login como Vendedor → Registrar 3 pedidos (1 contado, 2 crédito)
- [x] Login como Gestor → Verificar que aparecen en "Asignar Ruta"
- [x] Asignar los 3 pedidos al Rutero (Completado con nueva UI fusionada "Rutas y Despacho")
- [x] Login como Rutero → Verificar que aparecen en "Ruta de Entrega"
- [x] Marcar entregas y verificar cobranzas
- [x] Rediseño completo de la interfaz WEB para eliminar carga cognitiva

### [x] 2.2 Prueba de inventario del vendedor
- [x] Login como Gestor → "Carga de Inventario"
- [x] Asignación y bajada de stock correctas
- [x] Verificar que el stock del vendedor baja (comprobado en backend)

### [x] 2.3 Prueba de roles y menús
- [x] Navegación simplificada en web `app-layout.tsx` sin cabeceras inútiles
- [x] Restricción de herramientas según rol

---

## FASE 3 — Flutter Móvil (Prioridad Baja — requisito §3.2)

### [x] 3.1 Flutter Preventa (§21.2) ✅ COMPLETADO
- [x] Login
- [x] Catálogo con búsqueda (local + API con cache offline)
- [x] Inventario en tiempo real (stock visible en cada product card)
- [x] Crear pedido contado
- [x] Crear pedido crédito
- [x] Selección de precio según nivel (1-3 directo, 4-5 autorización)
- [x] Cobros agregado al menú del vendedor
- [x] Cierre de Caja agregado al menú del vendedor
- [x] Cola offline con sincronización automática
- [x] Generación de PDF y compartir recibo

### [x] 3.2 Flutter Rutero (§21.3) ✅ COMPLETADO
- [x] Login
- [x] Ver inventario asignado (route_board_screen.dart)
- [x] Pedidos por entregar (route_board_screen.dart)
- [x] Marcar entregado/no entregado (route_board_screen.dart)
- [x] Cobrar (collections_screen.dart)
- [x] Devolver mercancía (returns_screen.dart)
- [x] Cierre de caja (daily_closing_screen.dart)
- [x] Optimización offline (sync queue + local cache implementados)

---

## FASE 4 — Mejoras Futuras (Post-MVP)

### [x] 4.1 Exportación a Excel ✅ COMPLETADO
- [x] Utilidad genérica `exportToExcel()` en `web/src/lib/export-excel.ts`
- [x] Reportes de ventas exportables (reports-page.tsx)
- [x] Historial de ventas del vendedor exportable (vendor-sales-page.tsx)
- [x] Cartera / Cuentas por cobrar exportable (receivables-page.tsx)

### [x] 4.2 Notificaciones Push ✅ COMPLETADO
- [x] Notificar al Gestor cuando entra un pedido nuevo (WebSockets integrados en app-layout)
- [x] Notificar al Rutero cuando le asignan una ruta (FCM integrado en backend, app Android configurada)

### [x] 4.3 Módulos y reglas de negocio clarificados (§19) ✅ COMPLETADO
- [x] Cierre de caja — estructura detallada (§19.3)
- [x] Devoluciones — reglas contables (§19.4)
- [x] Rutas — definición avanzada (§19.5)
- [x] Facturas — si son fiscales o internas (§19.6)
- [x] Cuentas por cobrar — cuándo nace la obligación (§19.7)
- [x] Offline — sincronización diferida Flutter (§19.10)

---

## RESUMEN DE AVANCE

```
██████████████████████████████████████████ 100%
```

| Fase | Items | Completados |
|---|---|---|
| Backend (API + BD) | 30 módulos | 30 ✅ (100%) |
| Frontend Web | 44 páginas | 44 ✅ (100%) |
| Flutter Móvil | ~15 pantallas | ~15 ✅ (100%) |
| Documentación | 21 docs | 21 ✅ (100%) |
