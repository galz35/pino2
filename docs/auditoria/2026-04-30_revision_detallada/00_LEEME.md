# Revision detallada Pino2 - 2026-04-30

Ruta revisada: `/opt/apps/pino2`

Esta carpeta complementa la auditoria previa `auditoria_2026-04-30/` con una revision mas operativa y planes de trabajo accionables. El objetivo no es repetir que existe el sistema, sino dejar claro que falta cerrar, en que orden y con que entregables.

## Documentos

- `01_INVENTARIO_FUNCIONAL.md`: mapa de modulos, rutas, endpoints, tablas, pruebas y verificaciones.
- `02_HALLAZGOS_CRITICOS.md`: riesgos concretos encontrados en datos, build, sync, tipado, seguridad y QA.
- `03_PLAN_BACKEND_BD.md`: plan de trabajo para NestJS, PostgreSQL, migraciones, DTOs e idempotencia.
- `04_PLAN_REACT_DISENO_TABLAS.md`: plan de trabajo para React, tablas, diseno operativo, performance y pruebas.
- `05_PLAN_FLUTTER_OFFLINE_CAMPO.md`: plan de trabajo para app movil, offline, ruta, bodega, preventa y hardware.
- `06_PLAN_QA_SEGURIDAD_DEVOPS.md`: plan de pruebas, seguridad, observabilidad y despliegue.
- `07_CRONOGRAMA_PRIORIZADO.md`: orden recomendado de ejecucion por semanas y criterios de cierre.

## Verificacion ejecutada

- Backend: `npm run build` en `/opt/apps/pino2/backend` termina correctamente.
- Web: `npm run build` en `/opt/apps/pino2/web` falla porque `vite-plugin-pwa` no existe en `web/node_modules`, aunque si esta declarado en `package.json` y `package-lock.json`.
- Flutter: `flutter test` no se pudo ejecutar porque `flutter` no esta instalado en el PATH del VPS.

## Lectura ejecutiva

El sistema esta avanzado y tiene alcance real de POS, administracion, bodega, ruta, preventa, cartera, devoluciones, sync y app movil. La prioridad no deberia ser agregar mas pantallas; debe ser estabilizar contratos, base de datos, pruebas, tablas operativas y offline.

Los puntos mas urgentes son:

1. Crear/migrar formalmente tablas usadas por codigo pero no encontradas en DDL revisado: `sync_idempotency_log` y `product_barcodes`.
2. Reparar entorno web instalando dependencias con lock para que `npm run build` vuelva a pasar.
3. Convertir migraciones en fuente unica de verdad y sacar DDL silencioso del bootstrap salvo casos operativos controlados.
4. Cerrar DTOs, enums y OpenAPI para que React y Flutter no dependan de `any` ni contratos implicitos.
5. Implementar pruebas de flujos criticos antes de seguir ampliando modulos.
