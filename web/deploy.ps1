# Script de Despliegue MultiTienda
# Para que este script funcione, debes tener configurada la variable de entorno FIREBASE_TOKEN
# o haber corrido 'firebase login' previamente.

Write-Host "--- Paso 1: Generando Build ---" -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo en la construccion." -ForegroundColor Red
    exit 1
}

Write-Host "--- Paso 2: Subiendo a Firebase ---" -ForegroundColor Cyan
# Si existe el token en el entorno lo usamos, si no, npx intentara usar la sesion local
if ($env:FIREBASE_TOKEN) {
    npx firebase-tools deploy --only hosting --token $env:FIREBASE_TOKEN
} else {
    npx firebase-tools deploy --only hosting
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo en el despliegue." -ForegroundColor Red
    exit 1
}

Write-Host "SISTEMA ACTUALIZADO EXITOSAMENTE" -ForegroundColor Green
