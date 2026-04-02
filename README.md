# Sistema MultiTienda (v2.0)

Este repositorio contiene la migración completa del Sistema MultiTienda y Los Pinos Mobile, pasando de una arquitectura Serverless (Firebase/Next.js) a una infraestructura relacional robusta (PostgreSQL/NestJS/React Vite).

## Estructura del Proyecto

El proyecto sigue una estructura de monorepo lógico dividido en 3 pilares principales:

- `/backend`: API REST, Lógica de Negocio y WebSockets (NestJS + TypeORM + PostgreSQL).
- `/web`: Aplicación de Punto de Venta PWA SPA (Vite + React + Tailwind + Radix UI).
- `/flutter`: [Futuro] Aplicación móvil conectada a esta API (Clean Architecture).
- `/docs`: Documentación consolidada para humanos y para IA local.
- `/plan`: Bitácora histórica de análisis, decisiones y avances.

## Punto de entrada recomendado

Si vas a retomar el proyecto o darselo a una IA local:

1. leer [docs/00_INDEX.md](./docs/00_INDEX.md)
2. leer [docs/01_GEMINI_HANDOFF.md](./docs/01_GEMINI_HANDOFF.md)
3. leer [docs/06_BASE_DE_DATOS_ESTADO_ACTUAL.md](./docs/06_BASE_DE_DATOS_ESTADO_ACTUAL.md)
4. usar `plan/2026-04-01/` como historial detallado del corte actual

## Actualización manual en este VPS

Para actualizar backend y republicar React en este mismo servidor:

1. revisar `docs/00_INDEX.md`
2. usar `./manual_update_dev.sh`

Modos útiles:

- `./manual_update_dev.sh all`
- `./manual_update_dev.sh backend`
- `./manual_update_dev.sh web`
- `./manual_update_dev.sh local-all`

## Decisiones Técnicas

- **Base de datos:** PostgreSQL para asegurar integridad referencial y cumplir requisitos financieros de Kárdex y Caja.
- **Frontend SPA:** Cambio de Next.js (SSR) a React + Vite (SPA) para maximizar la velocidad y aprovechar `IndexedDB` en transacciones POS offline rápidas.
- **Sincronización:** Uso de un patrón Last-Write-Wins junto con el API Batch de NestJS para solventar transacciones locales generadas por fallos de red.
- **Micro UI Components:** Reutilización del 100% de la capa gráfica original mediante `@radix-ui` y `Tailwind CSS`.
