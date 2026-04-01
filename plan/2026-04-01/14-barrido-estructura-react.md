# 14 - Barrido de React y su Estructura

**Fecha:** 2026-04-01  
**Proyecto:** `pino`

## 1. Resumen ejecutivo

El frontend `React` de `pino` no es un prototipo pequeño.  
Es una SPA administrativa/POS con varias capas ya separadas y un alcance real importante.

Foto rápida del tamaño actual:

- páginas: **53**
- componentes: **78**
- componentes `ui/`: **36**
- servicios: **3**
- contexts: **2**
- hooks: **7**
- utilidades `lib/`: **9**

Distribución de páginas:

- `master-admin`: **14**
- `store-admin`: **37**
- páginas globales: **2**

## 2. Estructura real del frontend

Base del proyecto:

- [src](/opt/apps/pino/web/src)
- [pages](/opt/apps/pino/web/src/pages)
- [components](/opt/apps/pino/web/src/components)
- [contexts](/opt/apps/pino/web/src/contexts)
- [hooks](/opt/apps/pino/web/src/hooks)
- [services](/opt/apps/pino/web/src/services)
- [lib](/opt/apps/pino/web/src/lib)
- [types](/opt/apps/pino/web/src/types)

Subárbol principal:

- [pages/master-admin](/opt/apps/pino/web/src/pages/master-admin)
- [pages/store-admin](/opt/apps/pino/web/src/pages/store-admin)
- [components/pos](/opt/apps/pino/web/src/components/pos)
- [components/dashboard](/opt/apps/pino/web/src/components/dashboard)
- [components/auth](/opt/apps/pino/web/src/components/auth)
- [components/products](/opt/apps/pino/web/src/components/products)
- [components/ui](/opt/apps/pino/web/src/components/ui)

## 3. Capa de entrada y routing

### 3.1 Entrada

La entrada es mínima:

- [main.tsx](/opt/apps/pino/web/src/main.tsx)

Solo monta `App` con `React.StrictMode`.

### 3.2 Router principal

El router real vive en:

- [App.tsx](/opt/apps/pino/web/src/App.tsx)

Patrón actual:

- `BrowserRouter` con `basename` configurable
- `lazy loading` de todas las páginas importantes
- `ProtectedRoute` endurecido con validación de rol normalizado y acceso real por `storeId`
- providers globales montados arriba del árbol

Providers montados:

- `ThemeProvider`
- `AuthProvider`
- `PosProvider`
- `GlobalAlertProvider`
- `Toaster`
- `ErrorBoundary`

## 4. Organización funcional por módulos

### 4.1 Global

Páginas:

- [login-page.tsx](/opt/apps/pino/web/src/pages/login-page.tsx)
- [pos-page.tsx](/opt/apps/pino/web/src/pages/pos-page.tsx)

Rol:

- login
- redirección inicial por usuario
- punto de entrada al POS o al dashboard según rol

### 4.2 Master Admin

Páginas reales:

- dashboard
- tiendas
- cadenas
- usuarios
- licencias
- monitor
- configuración
- zonas
- sub-zonas
- sync monitor
- ayuda

Archivos visibles en:

- [master-admin](/opt/apps/pino/web/src/pages/master-admin)

Conclusión:

- este módulo está bastante poblado
- no es solo navegación vacía
- ya cubre administración global importante

### 4.3 Store Admin

Módulos presentes:

- dashboard
- billing / POS web
- caja
- finanzas / cartera
- productos
- edición de producto
- inventario movimientos
- inventario ajustes
- pedidos pendientes
- despacho
- torre de control
- delivery route
- reportes
- settings
- usuarios
- proveedores
- facturas proveedor / cuentas por pagar
- autorizaciones
- ayuda

Raíz:

- [store-admin](/opt/apps/pino/web/src/pages/store-admin)

Conclusión:

- aquí está el grueso del negocio diario
- el frente administrativo real vive sobre esta carpeta
- ya existe un bloque financiero nuevo conectado a backend, no solo planeado

### 4.4 Vendors / Ruta en web

Submódulos presentes:

- lista de personal de ruta
- dashboard vendedor
- clientes
- cobros
- inventario vendedor
- venta rápida
- ventas
- rutas
- asignar ruta
- zonas

Raíz:

- [vendors](/opt/apps/pino/web/src/pages/store-admin/vendors)

Conclusión:

- este frente mezcla gestión administrativa de ruta con operación comercial
- está más avanzado de lo que parecía al inicio
- después del barrido actual, ya no depende de alias frágiles como `role=vendor`; el bloque usa roles reales de BD o normalización en frontend

## 5. Layout, navegación y roles

La navegación central vive en:

- [app-layout.tsx](/opt/apps/pino/web/src/components/app-layout.tsx)

Qué hace:

- compone navegación lateral
- cambia menú según rol
- lee `storeId` desde la ruta
- usa `store settings` para habilitar o no partes del menú
- soporta traducción básica `es/en`
- ya toma `settings` reales de tienda para encender/apagar bloques del menú
- ya conecta websocket de eventos y llena la campana de notificaciones operativas

Roles relevantes ya contemplados:

- `master-admin`
- `owner`
- `store-admin`
- `cashier`
- `inventory`
- `dispatcher`
- `rutero`
- `vendor`
- `sales-manager`

La normalización vive en:

- [user-role.ts](/opt/apps/pino/web/src/lib/user-role.ts)
- [redirect-logic.ts](/opt/apps/pino/web/src/lib/redirect-logic.ts)

Hallazgo útil del barrido:

- varios roles vienen mezclados entre nombres de negocio (`Vendedor Ambulante`, `Rutero`, `Gestor de Ventas`) y nombres normalizados (`vendor`, `rutero`, `sales-manager`)
- la navegación ya está preparada para eso, pero los filtros API sensibles deben seguir usando rol real de BD o filtrar localmente
- el cierre actual ya evita que un usuario de una tienda vea eventos websocket de otra tienda

## 6. Auth y sesión

La autenticación central vive en:

- [auth-context.tsx](/opt/apps/pino/web/src/contexts/auth-context.tsx)

Qué hace:

- restaura sesión desde `localStorage`
- guarda `access_token`
- guarda usuario
- resuelve login
- redirige según rol
- hace logout local

La capa HTTP global vive en:

- [api-client.ts](/opt/apps/pino/web/src/services/api-client.ts)
- [finance-service.ts](/opt/apps/pino/web/src/services/finance-service.ts)

Qué hace:

- usa `axios`
- agrega JWT automáticamente
- limpia sesión en `401`
- tiene caché en memoria para `GET`
- ahora resuelve base URL por entorno
- centraliza cuentas por cobrar, cobros, facturas y cuentas por pagar en un servicio de dominio

## 7. POS y operación de caja

La parte más densa de UI está en:

- [components/pos](/opt/apps/pino/web/src/components/pos)

Ahí viven piezas como:

- búsqueda de producto
- grid de productos
- diálogo de pago
- selección de cliente
- alta rápida de cliente reutilizable
- ticket imprimible
- devoluciones
- layout específico de cajero
- vista de facturación

El estado local del POS vive en:

- [pos-context.tsx](/opt/apps/pino/web/src/contexts/pos-context.tsx)

Hallazgos útiles del corte actual:

- `ClientSelectionDialog` ya quedó alineado con backend real usando `GET /clients?storeId=...`
- `billing`, `dispatcher`, `vendor-quick-sale` y `vendor-sales` ya comparten el mismo patrón de seleccionar o crear cliente sin salir del flujo
- el bloque de cliente dejó de depender de rutas muertas o endpoints no implementados
- `ProductSearch` y el POS de cajero ya quedaron alineados con endpoints reales, sin rutas `search` inexistentes ni lectura falsa de `stores/:id/settings`
- la autorización de precios restringidos ahora usa credenciales reales de administrador sin reemplazar la sesión activa

## 8. Clasificación de productos

La parte de productos ya no queda solo en departamentos planos.

Mejoras reales del corte:

- [products-page.tsx](/opt/apps/pino/web/src/pages/store-admin/products/products-page.tsx) ya consume departamentos principales y sub-departamentos reales
- [add-product-page.tsx](/opt/apps/pino/web/src/pages/store-admin/products/add-product-page.tsx) ya carga catálogos separados para departamento y sub-departamento
- [edit-product-page.tsx](/opt/apps/pino/web/src/pages/store-admin/products/edit-product-page.tsx) ya permite reclasificar el producto con un selector real, no texto libre
- [sub-departments-page.tsx](/opt/apps/pino/web/src/pages/store-admin/products/sub-departments-page.tsx) ya usa endpoints consistentes para principales y subniveles

Conclusión:

- el frente de productos está bastante más cerca de una operación mantenible
- la clasificación dejó de depender de datos simulados en frontend

## 9. Auth y autorización operativa

Además del login principal, el frontend trae un caso operativo importante:

- selección de precios restringidos en POS

Estado actual:

- [admin-auth-dialog.tsx](/opt/apps/pino/web/src/components/auth/admin-auth-dialog.tsx) ya no depende de un endpoint inexistente de PIN
- la validación ahora reutiliza `POST /auth/login` de forma aislada para comprobar credenciales administrativas sin tumbar la sesión actual
- [price-selection-dialog.tsx](/opt/apps/pino/web/src/components/pos/price-selection-dialog.tsx) quedó alineado con esa lógica

Conclusión:

- el flujo de autorización ya es defendible técnicamente
- falta solo validación manual con credenciales reales antes de llamarlo cerrado

## 10. Navegación y consistencia de rutas

Mejoras recientes que sí impactan uso real:

- [App.tsx](/opt/apps/pino/web/src/App.tsx) ya tiene fallback `* -> /`, evitando pantalla vacía en rutas desconocidas
- [vendor-dashboard-page.tsx](/opt/apps/pino/web/src/pages/store-admin/vendors/vendor-dashboard-page.tsx) ya puede mandar `clientId` a ventas rápidas
- [vendor-quick-sale-page.tsx](/opt/apps/pino/web/src/pages/store-admin/vendors/vendor-quick-sale-page.tsx) y [vendor-sales-page.tsx](/opt/apps/pino/web/src/pages/store-admin/vendors/vendor-sales-page.tsx) ya leen ese `clientId` y precargan el cliente
- [store-admin-dashboard-metrics.tsx](/opt/apps/pino/web/src/components/dashboard/store-admin-dashboard-metrics.tsx) dejó de depender de un endpoint inexistente

Conclusión:

- la navegación quedó menos frágil
- el dashboard principal y el flujo comercial del vendedor ya están mejor amarrados entre sí

Qué maneja:

- carrito
- modo `products/payment`
- cliente actual
- held bills
- loading de operación

Conclusión:

- el POS está parcialmente desacoplado del resto del panel
- tiene su propia mini-capa de estado para no ensuciar auth/layout

## 8. UI base y por qué esta estructura importa

La capa reusable de UI está en:

- [components/ui](/opt/apps/pino/web/src/components/ui)

Incluye:

- `dialog`
- `select`
- `dropdown-menu`
- `popover`
- `tabs`
- `tooltip`
- `toast`
- `accordion`
- `table`
- `form`
- `sheet`
- `scroll-area`

Eso confirma que la base del frontend sigue un patrón:

- `Radix` para comportamiento accesible
- `shadcn/ui` para organización de wrappers
- `Tailwind` para apariencia

## 9. Hooks y utilidades clave

Hooks reales:

- [use-real-time-events.ts](/opt/apps/pino/web/src/hooks/use-real-time-events.ts)
- [use-offline-operation.ts](/opt/apps/pino/web/src/hooks/use-offline-operation.ts)
- [use-sync-status.ts](/opt/apps/pino/web/src/hooks/use-sync-status.ts)
- [use-printable-ticket.ts](/opt/apps/pino/web/src/hooks/use-printable-ticket.ts)
- [use-inactivity-timeout.ts](/opt/apps/pino/web/src/hooks/use-inactivity-timeout.ts)
- [use-toast.ts](/opt/apps/pino/web/src/hooks/use-toast.ts)
- [use-mobile.tsx](/opt/apps/pino/web/src/hooks/use-mobile.tsx)

Utilidades de infraestructura:

- [runtime-config.ts](/opt/apps/pino/web/src/lib/runtime-config.ts)
- [sync-service.ts](/opt/apps/pino/web/src/lib/sync-service.ts)
- [indexed-db-service.ts](/opt/apps/pino/web/src/lib/indexed-db-service.ts)
- [error-logger.ts](/opt/apps/pino/web/src/lib/error-logger.ts)
- [audit-logger.ts](/opt/apps/pino/web/src/lib/audit-logger.ts)
- [swalert.ts](/opt/apps/pino/web/src/lib/swalert.ts)

## 10. Sync offline y realtime

Este frontend no es solo CRUD online.

Ya trae intención de operación resiliente:

### 10.1 Offline

Base local:

- [indexed-db-service.ts](/opt/apps/pino/web/src/lib/indexed-db-service.ts)

Qué sugiere:

- cola de operaciones pendientes
- estado de sincronización por tienda
- caché offline

Sync manager:

- [sync-service.ts](/opt/apps/pino/web/src/lib/sync-service.ts)

Qué sugiere:

- procesamiento batch de operaciones
- reintentos
- prioridad de eventos
- reenvío hacia `/sync/batch`

### 10.2 Realtime

Hook principal:

- [use-real-time-events.ts](/opt/apps/pino/web/src/hooks/use-real-time-events.ts)

Qué hace:

- conecta `socket.io-client`
- escucha `sync_update`
- escucha `store_update`
- emite `join_store`

Conclusión:

- el frontend ya estaba pensado para mezcla de web admin + eventos realtime + cierta tolerancia offline
- eso explica parte del tamaño del proyecto

## 11. Qué está simple y qué está inmaduro

### 11.1 Fuerte / ya estructurado

- routing principal
- auth base
- POS / caja
- panel master-admin
- panel store-admin
- vendors / ruta en web
- UI reusable
- soporte inicial para realtime

### 11.2 Aún inmaduro o incompleto

- la capa `services/` es muy delgada para el tamaño del proyecto
- mucho consumo API está directo dentro de páginas/componentes
- parte del estado de negocio vive disperso
- el sync offline existe como base, pero no está claro qué tanto del proyecto ya depende de él en producción
- faltan pantallas operativas planeadas:
  - preparación
  - picking
  - status board
  - CxC web formal
  - CxP web formal
  - devoluciones de bodega

## 12. Lectura arquitectónica final

Este React se entiende mejor así:

1. **Capa shell**
   - `main.tsx`
   - `App.tsx`
   - layout + router + providers

2. **Capa de sesión**
   - `auth-context`
   - `api-client`
   - redirect por rol

3. **Capa de módulos**
   - master-admin
   - store-admin
   - vendors
   - POS

4. **Capa de infraestructura UI**
   - `components/ui`
   - Radix/shadcn/Tailwind

5. **Capa de infraestructura de datos**
   - `runtime-config`
   - `sync-service`
   - `indexed-db-service`
   - realtime hook

## 13. Conclusión práctica

Si retomamos el plan después:

- no hay que “descubrir React desde cero”
- el proyecto ya tiene una forma clara
- el siguiente trabajo sensato no es rehacer estructura
- el siguiente trabajo sensato es cerrar módulos faltantes y afinar flujo real en navegador

En corto:

- el frontend ya tiene base fuerte
- le falta cierre funcional, no una reescritura de arquitectura
