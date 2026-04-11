# Manual de Usuario: Vendedor de Piso (Punto de Venta)

## Rol y Permisos
- **Email:** `vender@lospinos.com`
- **Contraseña:** `ventas123`
- **Responsabilidades:** Facturación directa a cliente, Catálogo, creación de perfiles de clientes.
- **Acceso Restringido:** Solo interactúa con el carrito, listado de clientes y sus propios turnos de caja.

## Tareas Diarias Simuladas (Prueba Exitosa)
1. **Apertura de Caja Personal:**
   - Comprobación de que el turno esté abierto, sino, ingresar el fondo chico base.
2. **Atención a Clientes:**
   - Creación de perfiles de cliente (Nombre, Teléfono) desde el diálogo rápido en Facturación.
   - Búsqueda veloz de productos mediante código de barras o nombre.
3. **Cobro:**
   - Selección de metodos de pago (Efectivo/Tarjeta).
   - Generación de comprobante/ticket en UI temporal (cola de impresión).

## Criterios Validados en Navegador
- [x] Login Exitoso cargando directamente la vista de Caja o Facturación.
- [x] Interfaz "limpia" sin distractores de configuraciones avanzadas.
- [x] Carga del carrito con productos dinámicos 100% libre del error 500.
