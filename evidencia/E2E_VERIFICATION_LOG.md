[2026-04-11T02:40:52.028Z] # 🧪 Inicio de Auditoría E2E Autónoma - MultiTienda Los Pinos
[2026-04-11T02:40:52.029Z] > Validando los flujos de Administración, Bodega, Ventas Locales y Móviles.
[2026-04-11T02:40:52.029Z] 
## 1) 👑 Perfil: Administrador (admin_test@lospinos.com)
[2026-04-11T02:40:52.902Z] ✅ Login exitoso. JWT obtenido.
[2026-04-11T02:40:53.016Z] ✅ Tiendas cargadas. Origen: 9321856d-19ba-42b8-ba47-cf35c0d133dd, Destino: 1a13bda2-e725-4fe3-8d4f-ba6683e98c72
[2026-04-11T02:40:53.115Z] ✅ Producto detectado: Aceite Patrona 1L (Stock: 268)
[2026-04-11T02:40:53.115Z] >> Ejecutando Entrada Rápida (+50 unidades)...
[2026-04-11T02:40:53.593Z]   -> ✅ Entrada registrada en Kardex.
[2026-04-11T02:40:53.593Z] >> Ejecutando Traslado hacia Los Pinos - Norte (5 unidades)...
[2026-04-11T02:40:54.379Z]   -> ✅ Traslado exitoso! Clonación de producto y deducción bidireccional superada.
[2026-04-11T02:40:54.379Z] 
## 2) 🛒 Perfil: Vendedor/Cajero (vender@lospinos.com)
[2026-04-11T02:40:54.723Z] ✅ Login Cajero exitoso. JWT obtenido.
[2026-04-11T02:40:54.723Z] >> Verificando / Abriendo Caja chica...
[2026-04-11T02:40:54.831Z]   -> ✅ Caja pre-existente detectada (Fondo: $150).
[2026-04-11T02:40:54.931Z] >> Procesando Ticket de Venta para articulo: Aceite Patrona 1L
[2026-04-11T02:40:55.797Z]   -> ✅ Ticket emitido. El Kardex ahora marca SALIDA.
[2026-04-11T02:40:55.797Z] 
## 3) 🚚 Perfil: Gestor Ventas / Despacho (gestor@lospinos.com)
[2026-04-11T02:40:56.156Z] ✅ Login Gestor exitoso. JWT obtenido.
[2026-04-11T02:40:56.156Z] >> Consultando listado de rutas logísticas y clientes map...
[2026-04-11T02:40:56.253Z]   -> ✅ Accesos al API de rutas permitidos por Rol. Todo consistente.
[2026-04-11T02:40:56.253Z] 
## 4) 📦 Perfil: Bodeguero (bodeg@lospinos.com)
[2026-04-11T02:40:56.595Z] ✅ Login Bodeguero exitoso. JWT obtenido.
[2026-04-11T02:40:56.595Z] >> Validando restricciones: El Bodeguero intenta emitir una venta...
[2026-04-11T02:40:56.883Z]   -> ✅ Correcto. Acceso bloqueado. El Bodeguero NO TIENE PERMISOS de venta. El guardián está activo.
[2026-04-11T02:40:56.883Z] >> Bodeguero ejecuta Merma de Mercancía Dañada (-2 unidades) para Aceite Patrona 1L...
[2026-04-11T02:40:57.374Z]   -> ✅ Merma registrada exitosamente en Kardex.
[2026-04-11T02:40:57.374Z] >> Bodeguero ejecuta Ajuste Positivo (+1 unidad) por conteo...
[2026-04-11T02:40:57.850Z]   -> ✅ Ajuste Positivo (AJUSTE_IN) asentado correctamente en el Kardex.
[2026-04-11T02:40:57.850Z] 
🎉 AUDITORÍA COMPLETA. EL SISTEMA ES TRANSACCIONALMENTE SEGURO.