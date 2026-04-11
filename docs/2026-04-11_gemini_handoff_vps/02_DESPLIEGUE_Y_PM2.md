# Despliegue y PM2

## Backend vivo

Proceso actual:

- nombre PM2: `pino-api-dev`
- script path: `/opt/apps/pino2/backend/dist/main.js`
- cwd: `/opt/apps/pino2/backend`
- puerto backend: `3035`

## Rutas públicas

- frontend: `https://www.rhclaroni.com/dev/`
- backend: `https://www.rhclaroni.com/api-dev/`

## Publicación web

- directorio publicado: `/var/www/dev`
- build de React sale de: `web/dist`

## Script manual recomendado

Usar desde la raíz del repo:

- `./manual_update.sh all`
- `./manual_update.sh backend`
- `./manual_update.sh web`
- `./manual_update.sh local-all`

## Comportamiento importante del script

`manual_update_dev.sh` ya no asume que `pm2` apunta a la carpeta correcta.

Si detecta que `pino-api-dev` sigue montado desde otra ruta:

- borra ese proceso de PM2
- lo recrea usando `/opt/apps/pino2/backend`

Eso evita que `pm2 restart pino-api-dev` siga levantando el repo viejo por accidente.

## Variables locales

Existe un `.env` local en:

- `/opt/apps/pino2/backend/.env`

Ese archivo es local del VPS y no está en git. Gemini no debe esperar verlo en GitHub.
