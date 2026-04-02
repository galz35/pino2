# Auditoria de la Suite Backend

## Resumen

La carpeta de pruebas del backend mezclaba cuatro tipos de material:

- pruebas E2E activas
- pruebas destructivas que alteraban esquema
- scripts manuales de smoke testing
- reportes `.txt` y notas historicas

El objetivo de esta reorganizacion fue dejar una suite segura por defecto y archivar el resto sin perder evidencia.

## Activo

- `test/active/app.e2e-spec.ts`
- `test/active/auth-sync.e2e-spec.ts`

Validacion actual:

- `npm run test:e2e` pasa
- `npx jest --config ./test/jest-e2e.json --detectOpenHandles --runInBand` pasa

## Legado destructivo

Se movio a `test/legacy/destructive/`:

- `full-coverage.e2e-spec.ts`
- `migration.e2e-spec.ts`
- `report.e2e-spec.ts`
- `table-discovery.e2e-spec.ts`

Motivos:

- hacen `DROP TABLE`, `CREATE TABLE` o `ALTER TABLE`
- no son seguros contra una base compartida
- mezclan testing con mutacion de esquema y reportes manuales

## Scripts manuales

Se movio a `test/legacy/manual-scripts/`:

- `test_e2e_pg.js`
- `test_real_life_logistics.js`
- `test_sync_batch.js`
- `test_full_coverage.js`
- `debug_test.js`
- `create_test_users.js`

Motivos:

- usan endpoints desalineados con el backend actual
- varios hardcodean credenciales o usuarios
- sirven como referencia historica, no como suite confiable

## Reportes historicos

Se movio a `test/legacy/reports/` todo el material `.txt` de fallos, diagnosticos y salidas previas.

Eso evita ruido en la raiz de `backend/` y deja claro que no son pruebas ejecutables.

## Riesgos detectados

- `create_test_users.js` contiene credenciales y passwords en claro; no debe usarse como herramienta operativa moderna.
- `STABILIZATION_CHANGELOG.md` describe modulos que no existen en el codigo actual (`expenses`, `payments`), asi que no debe tomarse como estado vigente del sistema.
- El material remoto `tests/reporte_auditoria_errores.md` no es una suite real ni tiene suficiente evidencia tecnica para reproducir fallos.

## Regla nueva

La suite por defecto debe cumplir esto:

- no tocar esquema
- no depender de datos manuales fuera de la prueba
- crear datos aislados y limpiarlos al final cuando aplique
- validar contratos reales del backend actual
