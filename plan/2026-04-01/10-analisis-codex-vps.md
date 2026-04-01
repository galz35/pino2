# 10 - Analisis Codex VPS

**Fecha:** 2026-04-01
**Repo:** `pino`
**Ruta local:** `/opt/apps/pino`

## 1. Hallazgos principales

### 1.1 Requerimiento base

- Archivo encontrado: `plan/2026-03-31/requerimiento.txt`
- El alcance funcional confirmado es un sistema multi-tienda con:
  - web administrativa en React
  - backend NestJS + Fastify + PostgreSQL
  - app movil Flutter
  - sincronizacion en tiempo real entre bodega, preventa y rutero

### 1.2 Carpeta analizada

Se analizaron los archivos de `plan/2026-04-01`:

- `00-resumen-ejecutivo.md`
- `01-analisis-gap-backend.md`
- `02-analisis-gap-react.md`
- `03-analisis-gap-flutter.md`
- `04-plan-base-datos.md`
- `05-plan-backend-nestjs.md`
- `06-plan-react-web.md`
- `07-plan-flutter-movil.md`
- `08-plan-realtime-sync.md`
- `09-cronograma-fases.md`

### 1.3 Diferencia entre plan y codigo real

El plan describe un sistema mas avanzado que el estado real del repo.

Hallazgos concretos:

- El repo actual tiene solo un commit visible en `main`: `94cf110 Initial commit of system`
- La carpeta `flutter/` esta vacia
- El frontend web existe y tiene bastante codigo real
- El backend NestJS existe y tiene multiples modulos reales
- El plan de `2026-04-01` asume trabajo futuro y brechas ya identificadas, no un estado ya terminado

## 2. Estado real del codigo

### 2.1 Backend

El backend si existe y su estructura coincide parcialmente con el plan.

Hallazgos:

- `backend/src/main.ts` usa NestJS + Fastify
- prefijo global configurable: `API_PREFIX` o `api`
- puerto configurable: `PORT` o `3010`
- CORS configurable por `CORS_ORIGIN`
- Swagger activo en `/docs`
- escucha en `0.0.0.0`

Modulos reales detectados en `backend/src/modules/`:

- auth
- users
- stores
- chains
- products
- departments
- sales
- inventory
- cash-shifts
- clients
- orders
- suppliers
- notifications
- sync
- authorizations
- zones
- licenses
- invoices
- config
- store-zones
- visit-logs
- vendor-inventories
- accounts-receivable
- pending-deliveries
- routes
- pending-orders
- errors
- returns
- collections
- accounts-payable
- daily-closings

Conclusion:

- el backend no esta vacio
- el backend ya incluye varios modulos que en el plan aparecen como "nuevos"
- hay que validar compilacion y ejecucion, no solo el papel

### 2.2 Web React

Hallazgos reales:

- Vite + React + TypeScript
- `BrowserRouter` sin `basename`
- `vite.config.ts` no define `base`
- `src/services/api-client.ts` tiene `baseURL` hardcodeado a `http://localhost:3010/api`

Impacto:

- asi como esta, el frontend NO esta listo para colgarse limpio en `https://www.rhclaroni.com/dev/`
- tambien fallaria al salir por internet porque intentaria pegarle a `localhost:3010`

### 2.3 Flutter

Hallazgo critico:

- `flutter/` esta vacia en este repo

Conclusion:

- el plan de Flutter existe como diseno
- el codigo Flutter real no esta presente en `main`

## 3. Lectura util del plan 2026-04-01

### 3.1 Lo mas valioso del plan

El bloque `2026-04-01` si es util porque ya deja definido:

- brechas reales de negocio
- fases de implementacion
- orden de trabajo
- modelo de eventos realtime
- cambios de BD requeridos
- paginas nuevas de React
- endpoints nuevos de Nest

### 3.2 Brechas mas importantes detectadas por el plan

- manejo de bultos y unidades
- inventario del rutero formal
- flujo completo del pedido
- realtime incompleto
- devoluciones
- cobros del rutero
- cuentas por pagar
- cierre de caja del rutero

## 4. Propuesta segura para este VPS

Objetivo:

- publicar este proyecto sin chocar con `EF`, `portal`, `planer` ni `clima`

Ruta recomendada:

- frontend web: `https://www.rhclaroni.com/dev/`
- backend publico: `https://www.rhclaroni.com/api-dev/`

Puertos internos sugeridos:

- backend Nest: `3035`
- frontend estatico servido por Nginx desde `/var/www/dev/`

Por que asi:

- `/dev/` queda aislado del resto de sistemas
- `/api-dev/` permite que Flutter o clientes externos consuman la API sin depender del frontend
- no se toca `/api/`, `/api-portal-planer/`, `/api-portal-clima/`, `/portal/` ni `/apig/`

## 5. Cambios minimos requeridos antes del despliegue

### 5.1 Frontend

Cambios obligatorios:

- agregar `basename=\"/dev\"` al `BrowserRouter` o hacerlo configurable por entorno
- configurar `vite.config.ts` con `base: '/dev/'` para build productivo
- quitar `baseURL: 'http://localhost:3010/api'`
- mover API base a variable de entorno, por ejemplo `VITE_API_URL=/api-dev`

### 5.2 Backend

Cambios minimos:

- crear `.env` productivo para `PORT=3035`
- definir `CORS_ORIGIN=https://www.rhclaroni.com`
- revisar `.env` de PostgreSQL
- levantar el backend separado en PM2, por ejemplo `pino-api`

### 5.3 Nginx

Agregar snippets separados:

- `location /dev/` -> frontend build
- `location /api-dev/` -> `http://127.0.0.1:3035/api/`

## 6. Riesgos actuales antes de publicar

- el frontend no esta adaptado a subpath `/dev/`
- el frontend apunta a localhost fijo
- no se ha validado si el backend compila limpio en este VPS
- no se ha validado conexion real a PostgreSQL
- Flutter no esta en el repo, por tanto el movil hoy no es desplegable desde este corte

## 7. Recomendacion tecnica

Orden correcto de trabajo:

1. adaptar frontend para `/dev/` y `VITE_API_URL`
2. instalar dependencias y compilar backend
3. levantar backend aislado en puerto propio
4. compilar frontend y publicarlo en `/dev/`
5. probar login, rutas y Swagger por internet
6. despues continuar con las fases funcionales del plan

## 8. Conclusion

El proyecto `pino` si se puede desarrollar en este VPS sin afectar `portal`, `planer`, `clima` ni `EF`, pero hoy todavia necesita una capa de adaptacion de despliegue.

El plan de `2026-04-01` sirve como hoja de ruta funcional, pero el codigo real aun no esta alineado del todo con ese plan, especialmente en:

- despliegue web bajo subruta
- configuracion de API por entorno
- ausencia actual del codigo Flutter
