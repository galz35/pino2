# Informe de Estabilización y Despliegue - 15 de Abril 2026

Este documento detalla la configuración de producción para el sistema MultiTienda utilizando Firebase Hosting para el Frontend de React.

## 🚀 Detalles del Proyecto
- **Proyecto Firebase:** `pino-5fe44`
- **URL de Producción:** [https://pino-5fe44.web.app](https://pino-5fe44.web.app)
- **Repositorio:** `pino2` (GitHub)

## 🛠️ Configuración de Firebase Hosting
Para que el despliegue sea posible, se crearon los siguientes archivos en la carpeta `web/`:

1.  **`firebase.json`**:
    - Define `dist` como la carpeta pública.
    - Configura `rewrites` para que todas las rutas carguen `index.html` (necesario para React Router).
2.  **`.firebaserc`**:
    - Registra el alias del proyecto para que el comando `firebase deploy` sepa a dónde ir.
3.  **`src/lib/firebase.ts`**:
    - Inicializa el SDK de Firebase en la aplicación con las credenciales del proyecto `pino-5fe44`.

## 🤖 Automatización: Script `deploy.ps1`
Se creó un script de PowerShell para facilitar las actualizaciones en vivo sin necesidad de comandos manuales complejos.

**Uso:**
```powershell
.\deploy.ps1
```

**Proceso interno:**
1. Ejecuta `npm run build` para generar la carpeta `dist`.
2. Ejecuta `npx firebase-tools deploy` usando un token de autenticación centralizado.

## 🔐 Seguridad y Conectividad (CORS)
Se solucionó el error de "Blocked by CORS policy" realizando dos cambios:
- **Backend:** En `backend/src/main.ts`, se agregó el dominio de Firebase a la lista blanca de orígenes permitidos.
- **Frontend:** En `web/.env.production`, se corrigió la URL del API para que coincida exactamente con la exposición del VPS.

## 📦 Entrega a Git
Se realizó un `push` a la rama `main` del repositorio `pino2`. 
- **Nota:** Por seguridad de GitHub, el token de acceso fue removido del código subido, el script ahora lo toma de variables de entorno o de la sesión local.

---
*Documento generado por Antigravity AI para la estabilización del ambiente de producción.*
