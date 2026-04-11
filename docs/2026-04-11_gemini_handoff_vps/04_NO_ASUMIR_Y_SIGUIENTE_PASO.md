# No Asumir y Siguiente Paso

## No asumir

- no asumir que `pino` y `pino2` son lo mismo
- no asumir que el backend vivo sale de `/opt/apps/pino`; ahora sale de `/opt/apps/pino2`
- no asumir que un `401` significa backend roto; en este corte el login de prueba devolvió `401` porque la credencial usada no fue válida
- no asumir que el `.env` del backend está en git
- no asumir que Flutter está en scaffold; hay código real en `flutter/`

## Si Gemini retoma trabajo

Orden corto sugerido:

1. leer `docs/00_INDEX.md`
2. leer esta carpeta completa
3. validar `pm2 describe pino-api-dev`
4. validar `./manual_update.sh local-all`
5. recién después tocar código

## Focos razonables después de este corte

- pruebas funcionales con usuarios reales válidos
- endurecer seguridad/privacidad si `/dev/` debe quedar solo para el dueño
- seguir refinando UX móvil según operación de calle
- ampliar documentación de credenciales de prueba solo si se hace de forma segura y no en texto plano

## Resumen de una línea

Al cierre de este corte, `pino2` ya quedó como repo correcto, backend correcto en `pm2`, frontend publicado y Flutter limpiado para uso real no técnico.
