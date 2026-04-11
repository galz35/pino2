# Validación Real

## Backend

Pruebas ejecutadas:

- `npm run build` en `backend`: OK
- montaje real en `pm2`: OK
- smoke test directo a `http://127.0.0.1:3035/api/auth/login`: llega
- smoke test por `nginx` a `https://127.0.0.1/api-dev/auth/login` con `Host: www.rhclaroni.com`: llega

Hallazgo corregido:

- el login devolvía `500`
- la causa no era base de datos ni despliegue
- la causa era un debug residual en `AuthService` que intentaba escribir en `d:/pino/login_err.txt`
- eso ya fue reemplazado por `Logger` de Nest

Estado final del login:

- ahora responde `401 Unauthorized` cuando la credencial no es válida
- eso es correcto y confirma que el backend nuevo está respondiendo

## Web

Pruebas ejecutadas:

- `npm install` en `web`: OK
- `npm run build` en `web`: OK
- `./manual_update.sh local-all`: OK
- `curl -skI https://127.0.0.1/dev/ -H 'Host: www.rhclaroni.com'`: `200`

## Flutter

Pruebas ejecutadas:

- `flutter analyze`: OK
- `flutter test`: OK

Cambios UX validados:

- login sin detalles técnicos
- splash sin hablar de backend/bootstrap
- home sin exponer `API`, `Socket`, `Namespace`, `method` o `endpoint`
- mensajes offline traducidos a lenguaje operativo

Nota real:

- hay 2 tests SQLite que siguen en `skip` por límite de `GLIBC` del Ubuntu 20.04 del VPS
- eso ya estaba documentado previamente y no bloquea este corte
