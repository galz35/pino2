# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [Unreleased]

### Agregado
- **API Reference**: Se agregó `docs/API_REFERENCE.md` mapeando 140+ endpoints.
- **Deploy Guide**: Se agregó `docs/DEPLOY_GUIDE.md` con las instrucciones de CI/CD manual.
- **Health Module**: Se incorporó un controlador de salud `GET /api/health` en el backend para monitorear la conexión a PG (`app.module.ts`).
- **React Query Migrations**: Soporte `useQuery` y `useApiMutation` introducido en todo el panel administrativo de `web`, abandonando el enfoque manual de estado reactivo para las operaciones más críticas.
- **Auto Migration Runner**: Se creó un runner Node (`db:migrate`) que evalúa y registra automáticamente archivos `.sql` bajo `schema_migrations`.
- **Rate Limiting**: Se integró `@fastify/rate-limit` protegiendo contra DoS (2000req/min) en NestJS.

### Cambiado
- Refactorizado el código para evitar `Promise<any>` en la capa de datos.
- Re-diseñado el flujo PWA offline de la aplicación Flutter.
- Refactorizado el módulo de inventario (`adjustments`, `products`) usando un patrón asíncrono tipado.

### Corregido
- Corrección del provider `PG_CONNECTION` inyectado dinámicamente en los controladores para evitar errores de Crash al iniciar módulos NestJS independientes.

## [1.0.0] - 2026-04-01
### Agregado
- Sistema inicial estable (Pino1).
- Backend base de NestJS y capa de Frontend en Vite + React.
