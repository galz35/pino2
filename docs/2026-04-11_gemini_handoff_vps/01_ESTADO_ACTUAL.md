# Estado Actual

## Repo correcto

- repo: `galz35/pino2`
- rama de trabajo: `main`
- carpeta local: `/opt/apps/pino2`

## Arquitectura actual

- backend: `NestJS + PostgreSQL + WebSockets`
- web: `React + Vite + Tailwind + Radix`
- móvil: `Flutter + Riverpod + Drift`

## Estado funcional real

- backend: compila y quedó montado desde `pino2`
- web: compila y quedó publicada en `/dev/`
- flutter: quedó revisado y con limpieza UX para usuario no técnico

## Cambios importantes hechos en este corte

- se montó `pino2` en `pm2` como `pino-api-dev`
- se corrigió un bug real de login en backend
- se reforzó `manual_update_dev.sh` para que no reinicie el repo viejo por error
- se agregó `manual_update.sh` como wrapper principal
- se limpió Flutter para que no muestre `API`, `Socket`, `Namespace` ni mensajes técnicos al usuario final

## Carpetas clave

- backend fuente: `backend/src`
- frontend fuente: `web/src`
- flutter fuente: `flutter/lib`
- documentación principal: `docs`
- documentación móvil: `flutter/docs`
