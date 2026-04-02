# Testing Index

## Activo por defecto

- `test/active/app.e2e-spec.ts`
- `test/active/auth-sync.e2e-spec.ts`

Estas pruebas son el frente seguro por defecto para `npm run test:e2e`.
No deben alterar esquema, no deben borrar tablas y no deben depender de reportes manuales.

## Archivado como legado

- `test/legacy/destructive/*`
- `test/legacy/manual-scripts/*`
- `test/legacy/reports/*`
- `test/legacy/docs/*`

Este material se conserva por referencia histórica, pero no es la suite activa.

## Reglas operativas

- No ejecutar pruebas que hagan `DROP TABLE`, `CREATE TABLE` o `ALTER TABLE` sobre la base compartida.
- No dejar credenciales ni passwords reales en scripts versionados.
- Si una prueba requiere datos, debe crear datos aislados y limpiarlos al final.
- Los reportes manuales no sustituyen una prueba reproducible.

## Comandos

```bash
npm run test:e2e
npm run test:e2e:legacy
```
