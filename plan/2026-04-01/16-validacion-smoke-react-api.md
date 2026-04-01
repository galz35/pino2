# 16 - Validación Smoke React -> API

**Fecha:** 2026-04-01  
**Proyecto:** `pino`

## 1. Objetivo

Validar que el contrato principal que consume el frontend React responda correctamente sobre el despliegue real:

- frontend: `https://www.rhclaroni.com/dev/`
- api: `https://www.rhclaroni.com/api-dev/`
- socket: `https://www.rhclaroni.com/api-dev/socket.io`

## 2. Resultado general

Resultado de esta pasada:

- login: **OK**
- endpoints clave consumidos por React: **OK**
- handshake Socket.IO por `nginx`: **OK**
- publicación `/dev/`: **OK**

Conclusión:

- la capa de contrato frontend/backend principal quedó estable para seguir
- lo pendiente ya es más de validación visual/manual que de ruptura técnica base

## 3. Login validado

Prueba:

- `POST /api-dev/auth/login`

Credencial usada:

- `admin@multitienda.com`

Resultado:

- `201 Created`
- token recibido correctamente
- usuario `master-admin` válido

## 4. Store base usada para las pruebas

Tienda tomada del backend:

- `9321856d-19ba-42b8-ba47-cf35c0d133dd`
- nombre: `Los Pinos - Central`

## 5. Endpoints React validados

Todos estos respondieron correctamente con `200`:

- `GET /stores/:storeId`
- `GET /products?storeId=...`
- `GET /departments?storeId=...`
- `GET /suppliers?storeId=...`
- `GET /users?storeId=...`
- `GET /cash-shifts/active?storeId=...`
- `GET /cash-shifts?storeId=...&status=open`
- `GET /sales?storeId=...`
- `GET /pending-orders?storeId=...&status=Pendiente`
- `GET /pending-deliveries?storeId=...`
- `GET /authorizations?storeId=...&status=PENDING`
- `GET /accounts-receivable?storeId=...&pending=true`
- `GET /store-zones?storeId=...`
- `GET /clients?storeId=...`
- `GET /visit-logs?storeId=...&days=7`
- `GET /routes?storeId=...`
- `GET /sync/statuses`
- `GET /errors`

Lectura rápida:

- productos: devolvió `array(5)`
- departments: `array(3)`
- users: `array(6)`
- clients: `array(2)`
- authorizations: `array(2)`
- cash shift activo: objeto válido con contrato mixto

## 6. Socket.IO validado

Prueba:

- `GET /api-dev/socket.io/?EIO=4&transport=polling`

Resultado:

- `200 OK`
- handshake de Socket.IO correcto
- servidor anuncia upgrade a `websocket`

Esto confirma que el path encapsulado:

- `/api-dev/socket.io`

ya responde a través de `nginx`.

## 7. Publicación web validada

Prueba:

- `GET /dev/`

Resultado:

- `200 OK`
- `index.html` devuelve assets con prefijo correcto `/dev/...`

## 8. Lectura honesta del estado

Con esta pasada ya no veo un bloqueo técnico base en:

- login
- routing base
- publicación web
- contrato API principal
- socket path

Lo que sigue faltando es:

- validación manual de flujo en navegador
- revisar UX real de login, dashboard, productos, caja y reportes
- detectar si hay pantallas que cargan pero no fluyen bien por detalles visuales o de negocio
