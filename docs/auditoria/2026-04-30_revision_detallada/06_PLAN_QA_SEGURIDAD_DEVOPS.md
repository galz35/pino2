# Plan QA, seguridad, observabilidad y DevOps

Objetivo: que cada despliegue sea verificable, seguro y diagnosticable.

## QA funcional

Flujos minimos a automatizar:

1. Login, refresh, logout y perfil.
2. Acceso por rol y tienda.
3. Crear producto con barcode principal y alterno.
4. Apertura de caja.
5. Venta POS con descuento de stock y Kardex.
6. Cierre de caja.
7. Pedido preventa.
8. Autorizacion por precio/nivel.
9. Picking, carga, despacho y entrega.
10. Cobro contra cuenta por cobrar.
11. Devolucion con impacto en inventario/cartera.
12. Sync offline duplicado.

## QA tecnico

Tareas:

1. Separar pruebas activas de legacy destructivas.
2. Crear dataset seed para e2e.
3. Base de datos de prueba aislada.
4. Smoke test post deploy: health, auth, products, sync, web build.
5. Snapshot de OpenAPI en CI para detectar cambios de contrato.

Criterio de cierre:

- Un deploy no se considera listo sin smoke automatico.

## Seguridad

Tareas:

1. Rate limit separado para auth.
2. Swagger protegido o apagado en produccion.
3. CORS cerrado por dominio real.
4. CSP web revisada para reducir XSS.
5. Revisar JWT en `localStorage`; si se mantiene, endurecer sanitizacion y CSP.
6. Matriz de permisos por rol/accion.
7. Auditoria de cambios sensibles.

Criterio de cierre:

- Pruebas cubren 401/403 y acceso cruzado.
- No hay endpoints administrativos expuestos sin rol adecuado.

## Observabilidad

Tareas:

1. Request id en backend y frontend.
2. Logs estructurados con userId, storeId, module, action.
3. Error logs con correlacion entre React/Flutter/backend.
4. Dashboard de sync: pendientes, fallidos, duplicados, ultimo error.
5. Monitoreo de queries lentas con umbral configurable.
6. Retencion de logs por periodo.

Criterio de cierre:

- Un error de usuario se puede rastrear de UI a backend y base de datos.

## DevOps

Tareas:

1. Documentar versiones de Node, NPM, Flutter y PostgreSQL.
2. Usar `npm ci` en build web/backend.
3. Separar variables por ambiente.
4. Script de migraciones idempotente y obligatorio.
5. Backup antes de migraciones productivas.
6. Rollback documentado por release.
7. CI con backend build, web build, backend e2e y Flutter tests cuando exista CLI.

Criterio de cierre:

- Cada release tiene pasos repetibles y rollback claro.

## Evidencias a guardar por release

- Commit SHA.
- Fecha/hora.
- Resultado backend build.
- Resultado web build.
- Resultado pruebas backend.
- Resultado pruebas Flutter.
- Migraciones aplicadas.
- Backup realizado.
- Smoke test post deploy.
