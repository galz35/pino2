# Manual de Usuario: Rutero (Ventas al Detalle / Transporte)

## Rol y Permisos
- **Email:** `rute@lospinos.com`
- **Contraseña:** `ruta123`
- **Responsabilidades:** Venta al detalle directo en camión, validación de clientes de ruta, cobro en campo.
- **Acceso Visual UI:** Módulo simplificado de Venta Rápida (Quick Sale) pensado para touch/móvil o tablet desde el navegador.

## Tareas Diarias Simuladas (Prueba Exitosa)
1. **Revisión de Inventario de Camión:**
   - Visualización de "Mi Inventario" cargado previamente por el Bodeguero.
2. **Registro de la Ruta:**
   - Creación de un pedido en la vista "Venta Rápida" directamente en la locación del cliente.
   - Sincronización transparente de la venta al servidor (o encolado si falla red).
3. **Cobro y Devolución Corta:**
   - Emisión de facturas por cobro en el sitio de entrega.

## Criterios Validados en Navegador
- [x] Módulo Venta Rápida (/vendors/quick-sale) es funcional con búsqueda y grilla optimizada.
- [x] Sistema valida correctamente que un Rutero solo venda de lo asignado a él, y no del Kárdex de la Tienda principal.
