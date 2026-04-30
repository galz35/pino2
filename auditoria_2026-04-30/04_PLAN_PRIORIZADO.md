# Plan priorizado de mejoras

Fecha: 2026-04-30
Proyecto: Pino2

## Prioridad 1 - Estabilizar base tecnica

Objetivo: reducir riesgo de datos y regresiones.

1. Definir migraciones como unica fuente de verdad de base de datos.
2. Auditar diferencias entre `schema.sql`, migraciones y `ensureOperationalTables()`.
3. Crear DTOs faltantes en backend y eliminar `@Body() dto: any` de modulos principales.
4. Centralizar enums/estados de negocio.
5. Activar paginacion server-side en listas grandes.
6. Proteger Swagger por ambiente.
7. Crear README real para backend y web.

Entregable esperado:

- Documento de modelo de datos actualizado.
- Migraciones limpias y versionadas.
- OpenAPI confiable.
- Contratos base para web y Flutter.

## Prioridad 2 - Cubrir flujos criticos con pruebas

Objetivo: poder cambiar sin romper ventas, caja, inventario y rutas.

Flujos minimos:

1. Login/refresh/me/permisos.
2. Venta POS con caja abierta.
3. Venta con stock y movimiento Kardex.
4. Cierre de caja.
5. Pedido preventa.
6. Preparacion/despacho/entrega.
7. Cobro contra cuenta por cobrar.
8. Devolucion con impacto en inventario/cartera.
9. Sync offline con `external_id` repetido.
10. Acceso multi-tienda por rol.

Pruebas recomendadas:

- Backend e2e con base de datos de prueba.
- React tests para rutas y pantallas criticas.
- Flutter tests para repositorios, cola offline y pantallas clave.

## Prioridad 3 - Mejorar tablas operativas

Objetivo: que administradores operen rapido y sin perder contexto.

Crear un componente tabla estandar para React con:

- Paginacion server-side.
- Filtros por columna.
- Orden server-side.
- Columnas configurables.
- Exportacion controlada.
- Seleccion multiple.
- Estados vacio/cargando/error/offline.
- Persistencia de filtros por usuario.

Aplicar primero a:

1. Productos.
2. Ventas/reportes.
3. Pedidos/despacho.
4. Cuentas por cobrar.
5. Inventario/movimientos.
6. Usuarios/permisos.
7. Sync monitor.

## Prioridad 4 - Mejorar UX por rol

Objetivo: reducir ruido y acelerar tareas reales.

Roles a optimizar:

- Cajero: POS, caja, devoluciones, cliente, ticket.
- Bodeguero: picking, cargas, inventario, faltantes.
- Rutero: ruta, entrega, cobro, devolucion, cierre diario.
- Preventa/vendedor: clientes, pedido rapido, cartera, visitas.
- Gerente tienda: dashboard, autorizaciones, cartera, inventario, usuarios.
- Master admin: tiendas, cadenas, licencias, sync, salud del sistema.

Acciones:

1. Crear home/dashboard especifico por rol.
2. Ocultar navegacion irrelevante.
3. Reducir pasos por tarea frecuente.
4. Estandarizar badges de estado.
5. Definir guia visual del sistema.

## Prioridad 5 - Offline y observabilidad

Objetivo: soportar operacion real con mala red.

Backend:

- Idempotencia obligatoria en operaciones offline.
- Logs con request id, user id, store id, device id.
- Endpoint de estado de sync por tienda/dispositivo.
- Metricas de duplicados evitados y fallos por entidad.

Web:

- Indicador offline/sync global.
- Cola IndexedDB visible para soporte.
- Invalidacion cache por evento realtime.

Flutter:

- Sync Center.
- Reintentos con backoff.
- Resolucion de conflictos.
- Logs locales sincronizables.
- Pruebas de red intermitente.

## Prioridad 6 - Seguridad y permisos

Objetivo: reducir riesgo operativo y proteger datos.

1. Separar rate limit de login vs API general.
2. Revisar almacenamiento de token web y endurecer CSP.
3. Crear matriz RBAC/ABAC por accion.
4. Auditar endpoints publicos y protegidos.
5. Agregar auditoria de cambios sensibles.
6. Validar CORS por entorno.
7. Definir politica de sesiones, refresh y revocacion.

## Backlog de mejoras de diseno

- Design system propio con tokens de color, densidad y estados.
- Componentes de estado comunes.
- Dashboard ejecutivo accionable.
- Modo compacto para POS/bodega.
- Mobile-first para pantallas de operacion rapida.
- Mejoras de accesibilidad: foco, contraste, labels, navegacion por teclado.

## Backlog de mejoras de logica

- Separar calculos de negocio de componentes React.
- Generar clientes API TypeScript/Dart desde OpenAPI.
- Crear servicios de dominio para ventas, inventario, cartera y pedidos.
- Definir eventos de dominio: sale.created, stock.adjusted, order.dispatched, collection.created, return.created.
- Normalizar estados y transiciones permitidas.
- Agregar auditoria before/after para entidades criticas.
