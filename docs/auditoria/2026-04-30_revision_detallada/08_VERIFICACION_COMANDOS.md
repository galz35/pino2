# Verificacion ejecutada

Fecha: 2026-04-30

## Estado git inicial

Comando:

```bash
git -C /opt/apps/pino2 status --short --branch
```

Resultado:

```text
## main...origin/main
```

Interpretacion:

- El arbol estaba limpio antes de crear esta documentacion.
- La rama local estaba alineada con `origin/main`.

## Backend build

Comando:

```bash
npm run build
```

Directorio:

```text
/opt/apps/pino2/backend
```

Resultado:

```text
backend@0.0.1 build
nest build
```

Interpretacion:

- Build backend finalizo con codigo 0.
- No se detectaron errores de compilacion TypeScript/Nest en esta revision.

## Web build

Comando:

```bash
npm run build
```

Directorio:

```text
/opt/apps/pino2/web
```

Resultado resumido:

```text
failed to load config from /opt/apps/pino2/web/vite.config.ts
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite-plugin-pwa'
```

Verificaciones adicionales:

```bash
npm ls vite-plugin-pwa
```

Resultado:

```text
web@0.0.0 /opt/apps/pino2/web
└── (empty)
```

Se verifico tambien:

- `web/package.json` declara `vite-plugin-pwa`.
- `web/package-lock.json` contiene `node_modules/vite-plugin-pwa`.
- `web/node_modules/vite-plugin-pwa` no existe.

Interpretacion:

- El lock parece correcto, pero `node_modules` local esta incompleto o desactualizado.
- Accion recomendada: ejecutar `npm ci` en `/opt/apps/pino2/web` y repetir `npm run build`.

## Flutter tests

Comando:

```bash
flutter test
```

Directorio:

```text
/opt/apps/pino2/flutter
```

Resultado:

```text
/bin/bash: flutter: command not found
```

Interpretacion:

- No se pudo verificar Flutter por entorno.
- No es evidencia de fallo de codigo movil; falta Flutter SDK/CLI en el PATH del VPS.

## Busquedas tecnicas relevantes

Se buscaron rutas, controladores, tablas y deuda tecnica con:

```bash
find /opt/apps/pino2/web/src/pages -type f
rg -n "<Route path=|allowedRoles|requireStoreAccess" /opt/apps/pino2/web/src/App.tsx
rg -n "@(Controller|Get|Post|Patch|Put|Delete)\\(" /opt/apps/pino2/backend/src
rg -n "CREATE TABLE|ALTER TABLE|CREATE INDEX" /opt/apps/pino2/backend/src/database/schema.sql /opt/apps/pino2/backend/migrations
rg -n "TODO|FIXME|mock|demo|as any|: any|@Body\\(\\) dto: any" /opt/apps/pino2/web/src /opt/apps/pino2/backend/src /opt/apps/pino2/flutter/lib
```

Hallazgos confirmados:

- `sync_idempotency_log` se referencia en codigo, pero no se encontro `CREATE TABLE` en DDL revisado.
- `product_barcodes` se usa y la migracion `2026-04-21_barcode_refactor.sql` lo indexa/puebla, pero no se encontro `CREATE TABLE`.
- Hay uso amplio de `any` y DTOs incompletos.
- No se encontro suite dedicada de tests React.
