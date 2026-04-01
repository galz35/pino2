# 11 - Plan de Ejecucion Backend Inicial

**Fecha:** 2026-04-01
**Proyecto:** `pino`
**Enfoque acordado:** Base de datos + logica backend primero, React despues, Flutter al final.

## 1. Recomendacion de arranque

Si yo lo arranco de forma correcta, el orden es este:

1. **Base de datos y backend primero**
2. **React web despues**
3. **Flutter al final**

Motivo:

- React hoy depende totalmente de contratos API estables
- Flutter aun no esta presente en el repo
- si se toca UI antes de fijar BD y backend, se duplica trabajo
- la mayor parte del riesgo actual esta en desalineaciones entre plan, schema y servicios Nest

## 2. Estado de partida confirmado

### 2.1 Base de datos

- PostgreSQL local en Docker: `postgres_alacaja`
- base: `multitienda_db`
- usuario: `alacaja`
- acceso local validado por `127.0.0.1:5432`
- la BD ya tiene `41` tablas
- ya incluye tablas avanzadas:
  - `accounts_payable`
  - `collections`
  - `returns`
  - `daily_closings`
  - `vendor_inventories`
  - `routes`
  - `vendor_routes`

### 2.2 Datos actuales

- `10` usuarios
- `3` tiendas
- `5` productos
- `0` pedidos

### 2.3 Backend

El backend tiene base real y no esta vacio. Ya existen modulos importantes:

- auth
- products
- inventory
- orders
- returns
- collections
- accounts-payable
- daily-closings
- vendor-inventories
- routes
- accounts-receivable

### 2.4 Frontend

El frontend aun no esta listo para despliegue publico:

- `BrowserRouter` sin `basename`
- API hardcodeada a `http://localhost:3010/api`
- Socket hardcodeado a `http://localhost:3010/events`

## 3. Estrategia por fases

## Fase 0 - Baseline tecnico

Objetivo:

- poder arrancar backend de forma confiable
- confirmar que el contrato base no este roto

Tareas:

- [ ] crear `.env` local para backend usando `127.0.0.1`
- [ ] instalar dependencias de backend
- [ ] compilar backend
- [ ] ejecutar smoke tests basicos
- [ ] validar login real

## Fase 1 - Alineacion schema y contratos backend

Objetivo:

- eliminar desalineaciones entre BD viva, `schema.sql` y servicios Nest

Tareas prioritarias:

- [x] detectar bug `products.sub_department_id` vs `products.sub_department`
- [x] detectar que `JWT_REFRESH_EXPIRES_IN` no se usaba
- [x] detectar que `POST /products` pierde campos enviados por React
- [x] alinear `cash-shifts` con el contrato real del POS React
- [x] alinear `inventory.adjust` con cantidades enteras y fallback de `req.user.sub`
- [x] alinear `pending-orders`, `pending-deliveries` y `visit-logs` con el flujo vendedor React
- [ ] validar y corregir mapeos restantes de productos
- [ ] validar modulos que usan `routes` y `vendor_routes`
- [ ] validar consistencia de `orders`, `order_items`, `movements`, `vendor_inventories`
- [ ] corregir drift entre `schema.sql` y la BD viva
- [ ] revisar respuesta y errores de auth

## Fase 2 - Flujo core de productos e inventario

Objetivo:

- dejar solido el corazon de bodega e inventario

Tareas:

- [ ] producto crear/editar/listar con contrato correcto
- [ ] stock dual: `current_stock`, `stock_bulks`, `stock_units`
- [x] ajustes de inventario
- [ ] movimientos/kardex
- [ ] importacion masiva

## Fase 3 - Flujo core de pedidos

Objetivo:

- dejar operativo el ciclo pedido -> preparacion -> carga -> entrega

Tareas:

- [ ] crear pedido con `paymentType` y `priceLevel`
- [ ] transiciones de estado validas
- [ ] carga a camion con transferencia de inventario
- [ ] entrega con descuento de inventario del rutero
- [ ] eventos realtime de pedidos

## Fase 4 - Operacion de campo

Objetivo:

- rutero y operacion movil listos en backend antes de Flutter

Tareas:

- [x] devoluciones
- [ ] cobros
- [ ] cierres diarios
- [ ] cuentas por cobrar enlazadas

## Fase 5 - Financiero y soporte operativo

Objetivo:

- cerrar la base del modulo administrativo

Tareas:

- [ ] cuentas por pagar
- [ ] integracion con facturas proveedor
- [ ] rutas
- [ ] notificaciones y errores

## Fase 6 - Realtime backend

Objetivo:

- que React luego no necesite polling excesivo

Tareas:

- [ ] expandir `EventsGateway`
- [ ] emitir cambios de inventario
- [ ] emitir cambios de pedido
- [ ] emitir devoluciones y cobros

## Fase 7 - React

Solo despues de estabilizar backend:

- [ ] adaptar `/dev/`
- [ ] mover API y socket a env
- [ ] arreglar redirects por roles
- [ ] validar login y dashboards
- [ ] corregir consumo de productos, pedidos, inventario

## Fase 8 - Flutter

Queda al final:

- [ ] bajar o crear el codigo real Flutter
- [ ] alinear contratos moviles con backend estable

## 4. Trabajo que ya arranco hoy

Correcciones iniciales ya identificadas para aplicar primero:

1. `products.service.ts`
   - corregir filtro de subdepartamento
   - guardar los campos que React ya envia
   - devolver `department` ademas de `departmentName`
2. `auth.service.ts`
   - usar `JWT_REFRESH_EXPIRES_IN`

## 5. Decision tecnica

**Si tengo que escoger un camino correcto, comienzo asi:**

- primero cierro Fase 0 y Fase 1
- despues Fase 2 y Fase 3
- solo cuando el backend este estable empiezo React

Ese orden reduce retrabajo y te deja una base mas limpia para seguir creciendo este sistema.
