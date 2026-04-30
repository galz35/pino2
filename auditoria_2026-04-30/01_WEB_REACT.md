# Auditoria Web React

Fecha: 2026-04-30
Ruta: `/opt/apps/pino2/web`

## Stack detectado

- React 19, Vite 6, TypeScript 5.9.
- React Router 7 con lazy loading.
- Tailwind CSS, Radix UI, lucide-react, recharts.
- Axios para API.
- IndexedDB/offline services propios.
- PWA disponible por dependencia `vite-plugin-pwa`, aunque la estrategia completa debe validarse.

## Que tiene

### Estructura

- `src/App.tsx` concentra rutas protegidas y lazy loading.
- `src/components/ui` contiene biblioteca visual basada en Radix/shadcn-like.
- `src/components/pos` contiene el nucleo POS: busqueda, carrito, pago, tickets, devoluciones, cliente, escaner, caja.
- `src/pages/store-admin` cubre dashboard, facturacion, productos, inventario, proveedores, usuarios, caja, autorizaciones, pedidos, despacho, bodega, rutas, finanzas, vendedores, clientes y reportes.
- `src/pages/master-admin` cubre cadenas, tiendas, usuarios, licencias, monitor, config, zonas, sync y comparacion multi-tienda.
- `src/pages/chain-admin` cubre dashboard de cadena.
- `src/contexts` maneja auth y POS.
- `src/lib` incluye runtime config, sync, IndexedDB, logs, export Excel, Firebase y utilidades.

### Funcionalidad visible por rutas

- Login y recuperacion de password.
- POS principal en `/`.
- Administracion por tienda: dashboard, caja, facturacion, productos, departamentos/subdepartamentos, inventario, proveedores, reportes y configuracion.
- Flujo de pedidos y distribucion: pending orders, dispatcher, dispatch, cargas, control tower, warehouse, delivery route.
- Finanzas: cuentas por cobrar, aging, cuentas por pagar, arqueo, liquidacion.
- Ventas/rutas: vendedores, zonas, clientes, cobros, inventario vendedor, venta rapida, rutas, devoluciones.
- Master admin: tiendas, cadenas, usuarios, licencias, monitoreo, zonas/subzonas, sync monitor, comparacion multi-tienda.

## Lo que le falta

### Calidad tecnica

- Falta test suite React visible. No se detectaron `*.test.tsx` ni `*.spec.tsx` en `web/src`.
- Mucho uso de `any` en componentes, paginas y servicios. Esto debilita la seguridad de contratos con backend.
- `api-client.ts` sobreescribe `apiClient.get` para cache en memoria y retorna un objeto parcial `{ data }`; esto puede romper codigo que espere `status`, `headers` o estructura completa de Axios.
- El cache GET es global por URL/params y se limpia en cualquier mutacion. Es simple, pero puede ocultar datos desactualizados si hay WebSockets/offline/otras pestañas.
- Token JWT en `localStorage`: practico, pero aumenta impacto si hay XSS.
- Algunas pantallas calculan datos en cliente consultando listas completas, por ejemplo dashboard y comparacion multi-tienda. Eso puede degradar con volumen.
- Hay logs de debug (`console.log`) en componentes POS/pending tickets.

### UX/diseño

- La app tiene muchos modulos, pero necesita jerarquia visual mas clara por rol. Un usuario operativo no deberia ver ruido administrativo.
- Las tablas operativas necesitan un patron unico: busqueda, filtros por columna, orden, paginacion, exportacion, acciones por fila, acciones masivas, columnas configurables y persistencia por usuario.
- En flujos POS y bodega conviene disenar para teclado/lector/celular/tablet, no solo desktop.
- Faltan estados consistentes de error, vacio, cargando, offline y sincronizando por pantalla.
- El sistema usa componentes UI reutilizables, pero falta un documento de design system propio: colores por estado, densidad, botones primarios/secundarios, badges de estados de pedido, inventario y caja.

## Mejoras recomendadas

### Diseno y experiencia

- Crear un `DataTable` corporativo unico con server-side pagination, filtros, columnas, export y seleccion multiple.
- Definir paleta por dominio: caja, inventario, credito, despacho, ruta, riesgo, exito, alerta.
- Crear componentes de estado: `EmptyState`, `ErrorState`, `OfflineBanner`, `SyncStatusBadge`, `PermissionDenied`, `LoadingTableSkeleton`.
- Separar vistas por modo: operador POS, bodeguero, rutero, gerente tienda, master admin.
- Mejorar pantallas de dashboard con KPIs accionables: ventas hoy, margen, faltantes, pedidos vencidos, cartera vencida, cajas abiertas, sync pendiente.
- Reducir saturacion visual en tablas grandes: densidad compacta, sticky header, filtros colapsables, columnas esenciales por defecto.

### Logica frontend

- Migrar llamadas API a servicios/hook por modulo: `useProducts`, `useOrders`, `useCashShift`, `useInventory`, `useCollections`.
- Reemplazar `any` por contratos generados desde OpenAPI o tipos compartidos.
- Reemplazar cache manual en Axios por TanStack Query o una capa propia con invalidacion por dominio.
- Agregar pruebas con Vitest + React Testing Library para rutas protegidas, login, POS y modulos criticos.
- Estandarizar manejo de errores con un interceptor que distinga 401, 403, 409, 422, offline y errores de servidor.
- Incorporar request id/correlation id en headers para cruzar errores web con backend.

### Tablas prioritarias a mejorar

- Productos: filtros por departamento, subdepartamento, stock minimo, proveedor, activo/inactivo, barcode principal/alternos.
- Ventas/reportes: paginacion por fecha, corte de caja, cajero, metodo de pago, exportacion controlada.
- Pedidos/despacho: estados tipo kanban + tabla, acciones masivas, historial de cambios.
- Cuentas por cobrar/pagar: aging server-side, semaforos, abonos, historial, conciliacion.
- Usuarios/roles: permisos efectivos, tiendas asignadas, estado, ultimo acceso.
- Sync monitor: operaciones pendientes, duplicados evitados, ultimo error, reintentos y tienda afectada.
