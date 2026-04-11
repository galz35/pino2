# Manual de Usuario: Bodeguero

## Rol y Permisos
- **Email:** `bodeg@lospinos.com`
- **Contraseña:** `bodega123`
- **Responsabilidades:** Control de Stock, Movimientos de almacén, Kárdex, Despachos físicos.
- **Acceso Restringido:** No tiene acceso a Facturación, Cierre de Caja ni configuraciones del sistema.

## Tareas Diarias Simuladas (Prueba Exitosa)
1. **Control de Inventario:**
   - Ingreso a la pestaña "Kárdex" para agregar el stock que ingresa por compras a proveedores.
   - Realización de "Ajustes de Inventario" por mermas o productos dañados.
2. **Despacho a Ruteros:**
   - Asignación de stock a los inventarios vehiculares de cada Rutero utilizando el "Módulo de Vendedores > Inventario de Vendedor".
3. **Preparación de Pedidos (Picking):**
   - Revisión de pedidos aprobados (Módulo de Pedidos) para armar bultos y dejarlos listos para ruta.

## Criterios Validados en Navegador
- [x] Login Exitoso redirigiendo exclusivamente a sus módulos permitidos.
- [x] Historial de Kárdex muestra correctamente ingresos y egresos.
- [x] Visibilidad bloqueada para ventas financieras manteniendo seguridad de los datos.
