# Plan de trabajo React, diseno y tablas

Objetivo: hacer que la web sea confiable para operacion diaria, con tablas rapidas, UX por rol y menos logica duplicada.

## Fase 1 - Reparar build y entorno

Duracion estimada: 0.5 a 1 dia.

Tareas:

1. Ejecutar `npm ci` en `web`.
2. Confirmar que `node_modules/vite-plugin-pwa` existe.
3. Ejecutar `npm run build`.
4. Documentar version de Node/NPM esperada.
5. Revisar si `vite-plugin-pwa` debe quedarse como devDependency o dependency segun flujo de deploy.

Criterio de cierre:

- `npm run build` web pasa en el VPS.

## Fase 2 - DataTable corporativo

Duracion estimada: 5 a 8 dias.

Tareas:

1. Crear componente tabla unico para modulos operativos.
2. Server-side pagination.
3. Server-side sorting.
4. Filtros por columna y filtros globales.
5. Columnas configurables por usuario/rol.
6. Export controlado por endpoint, no por lista parcial en cliente.
7. Acciones por fila y acciones masivas.
8. Estados: loading, empty, error, offline, permission denied.

Aplicar primero a:

- Productos.
- Ventas/reportes.
- Pedidos/pipeline/despacho.
- Cuentas por cobrar.
- Movimientos de inventario.
- Usuarios/permisos.
- Sync monitor.

Criterio de cierre:

- Las tablas grandes no descargan todo el dataset.
- Filtros sobreviven cambio de pagina.
- Cada tabla muestra conteo total, pagina actual y estado de carga.

## Fase 3 - UX por rol

Duracion estimada: 4 a 7 dias.

Roles:

- Cajero: POS, caja, cliente, ticket, devolucion.
- Bodeguero: picking, carga, inventario, faltantes.
- Rutero: ruta, entrega, cobro, devolucion, cierre diario.
- Preventa/vendedor: clientes, pedido rapido, cartera, visita.
- Gerente tienda: dashboard, autorizaciones, cartera, inventario, usuarios.
- Master admin: tiendas, cadenas, licencias, sync, salud del sistema.

Tareas:

1. Reducir navegacion visible por rol.
2. Crear home operativo por rol.
3. Ordenar menu por frecuencia de uso.
4. Estados visuales consistentes para pedidos, caja, cartera, inventario y sync.
5. Confirmaciones claras para acciones financieras o irreversibles.

Criterio de cierre:

- Un usuario operativo entra directo a sus tareas del dia.
- Menus no muestran modulos irrelevantes.

## Fase 4 - Separar logica de UI

Duracion estimada: 5 a 10 dias.

Tareas:

1. Crear hooks por dominio: products, orders, inventory, cash, collections, returns.
2. Mover calculos no visuales fuera de componentes.
3. Sustituir `any` por contratos generados o tipos compartidos.
4. Estandarizar errores API.
5. Sustituir cache manual Axios por cache por dominio.
6. Invalidar datos por eventos realtime.

Criterio de cierre:

- Componentes presentan UI y delegan datos/reglas.
- Menos `as any` en pantallas criticas.

## Fase 5 - Pruebas frontend

Duracion estimada: 4 a 8 dias.

Tareas:

1. Configurar Vitest + React Testing Library si no existe.
2. Tests de rutas protegidas por rol.
3. Tests de login y expiracion 401.
4. Tests de POS: agregar producto, cobrar, error de caja cerrada.
5. Tests de tablas: filtros, paginacion, error, empty.
6. Tests de modulos criticos: productos, pedidos, cartera, inventario.

Criterio de cierre:

- Suite frontend corre en CI/local.
- Flujos criticos tienen pruebas antes de redisenar.

## Fase 6 - Diseno operativo

Duracion estimada: 4 a 6 dias.

Tareas:

1. Documentar design system propio: colores, densidad, estados, botones, badges.
2. Crear componentes comunes: `StatusBadge`, `MoneyCell`, `QuantityCell`, `EmptyState`, `ErrorState`, `OfflineBanner`.
3. Hacer POS y bodega compatibles con teclado, lector y pantallas tactiles.
4. Mejorar responsive real en tablas y flujos de campo.
5. Unificar copy de errores y acciones.

Criterio de cierre:

- El sistema se siente como una herramienta operacional, no como pantallas sueltas.
- Los estados criticos se reconocen rapido sin leer mucho texto.
