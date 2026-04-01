# Mapa Del Proyecto

## 1. Raiz del repositorio

Directorios principales:

- `backend/`: API REST, logica de negocio, websocket y acceso a PostgreSQL
- `web/`: SPA React para POS, administracion y operacion comercial
- `flutter/`: reservado para la futura app movil
- `plan/`: bitacora de analisis, hallazgos, decisiones y checklist de avance
- `docs/`: referencia consolidada de arquitectura y operacion

## 2. Mapa de backend

Punto de entrada:

- `backend/src/main.ts`
- `backend/src/app.module.ts`

Capa de base de datos:

- `backend/src/database/database.module.ts`
- `backend/src/database/database.service.ts`
- `backend/src/database/schema.sql`

Modulos de negocio actuales: 31

Principales dominios:

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
- sync
- authorizations
- zones
- licenses
- invoices
- store-zones
- visit-logs
- vendor-inventories
- accounts-receivable
- pending-deliveries
- routes
- pending-orders
- returns
- collections
- accounts-payable
- daily-closings
- errors

Infra compartida:

- `backend/src/common/events.module.ts`
- `backend/src/common/gateways/events.gateway.ts`
- `backend/src/common/guards/`

## 3. Mapa de frontend web

Punto de entrada:

- `web/src/main.tsx`
- `web/src/App.tsx`

Numeros actuales:

- paginas: 53
- componentes: 78
- componentes `ui/`: 36

Capas clave:

- `web/src/pages/`: pantallas por dominio
- `web/src/components/`: UI reusable y layouts
- `web/src/contexts/`: auth y POS
- `web/src/hooks/`: hooks de red, timeout y realtime
- `web/src/services/`: cliente API y dominios financieros
- `web/src/lib/`: runtime config, roles, sync, alerts y utilidades
- `web/src/types/`: tipos base del frontend

Pantallas grandes:

- `pages/master-admin/`
- `pages/store-admin/`
- `pages/store-admin/vendors/`
- `pages/store-admin/products/`
- `pages/store-admin/suppliers/`
- `pages/store-admin/inventory/`

Archivos clave para entender la app:

- `web/src/App.tsx`
- `web/src/components/app-layout.tsx`
- `web/src/components/app-header.tsx`
- `web/src/services/api-client.ts`
- `web/src/services/finance-service.ts`
- `web/src/lib/runtime-config.ts`
- `web/src/lib/user-role.ts`
- `web/src/lib/redirect-logic.ts`
- `web/src/hooks/use-real-time-events.ts`

## 4. Mapa de documentacion

Referencia consolidada:

- `docs/`

Historia del proyecto:

- `plan/2026-04-01/`

Documentos mas importantes del historial:

- `12-checklist-avance.md`
- `14-barrido-estructura-react.md`
- `15-mapa-consumo-api-react.md`
- `17-barrido-backend-vs-requerimiento.md`

## 5. Mapa de despliegue logico

Backend:

- servicio Node/NestJS en puerto `3035`
- API publica esperada por frontend: `/api-dev`
- socket publico esperado: `/api-dev/socket.io`

Frontend:

- SPA bajo basename `/dev`

Base de datos:

- PostgreSQL en Docker
- contenedor: `postgres_alacaja`
- BD: `multitienda_db`

