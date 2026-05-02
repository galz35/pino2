# Guía de Despliegue - Pino2

Esta guía detalla los pasos para realizar un despliegue completo del sistema Pino2, incluyendo el backend, frontend web y aplicación móvil (Flutter).

## 1. Consideraciones Previas

Asegúrate de que todas las pruebas pasen correctamente antes de iniciar un despliegue a producción.

```bash
# Validar tipado en frontend web
cd web && npx tsc --noEmit

# Ejecutar tests E2E del backend
cd backend && npm run test:e2e
```

## 2. Migraciones de Base de Datos

Si hay cambios en la base de datos (nuevas tablas, columnas, etc.), asegúrate de que exista el archivo SQL correspondiente en `backend/migrations/`.

El sistema incluye un script automatizado para ejecutar las migraciones pendientes:
```bash
cd backend
npm run db:migrate
```
Este comando aplica ordenadamente cada script `.sql` que no se haya registrado en la tabla `schema_migrations`.

## 3. Despliegue del Backend (NestJS / Fastify)

Actualmente, el backend requiere estar ejecutándose en un entorno con Node.js (v18+) accesible externamente.

```bash
cd backend
npm ci
npm run build
# Iniciar en producción (usando PM2 u otro gestor)
pm2 start dist/main.js --name "pino2-backend"
```
Asegúrate de configurar las variables en el `.env` (puerto, base de datos, secretos JWT).

## 4. Despliegue del Frontend Web (React / Firebase)

El frontend web se compila y se despliega como una Progressive Web App (PWA) usando Firebase Hosting.

```bash
cd web
npm ci
npm run build
firebase deploy --only hosting
```
El build generará un Service Worker actualizado para que los clientes descarguen la nueva versión.

## 5. Compilación Móvil (Flutter)

La aplicación para repartidores, almacén y preventa debe ser compilada y distribuida manual o automáticamente (MDM).

```bash
cd flutter
flutter clean
flutter pub get
# Para Android APK
flutter build apk --release
# Para AppBundle (Google Play)
flutter build appbundle --release
```
El APK se generará en `build/app/outputs/flutter-apk/app-release.apk`.

## 6. Sincronización (Git)

Es importante mantener el repositorio central actualizado:
```bash
git add .
git commit -m "chore: release version X.Y.Z"
git push origin main
```
