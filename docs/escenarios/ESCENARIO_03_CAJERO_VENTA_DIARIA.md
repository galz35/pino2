# Escenario 3: La Cajera María - Agilidad en Tiempos de Clientes Impacientes

## Perfil del Usuario Humano
**Nombre**: María "La Rápida"
**Rol**: `cashier` (Vendedor de Tienda / Cajero)
**Objetivo**: Realizar la recepción de pagos de contado en mostrador de tienda frente a los clientes que llegan. Administrar bien la apertura del cajón y el cobro fidedigno antes de ir a su casa.

## Paso a Paso Simulado (Flujo Completo)

### Fase 1: Llegada e Inicio de Turno de Monstruo (09:00 AM)
1. María llega al mostrador frontal de la tienda y prende la PC de escritorio ("La Caja 1").
2. Abre la URL en el navegador Chrome. Se loguea como `vender@lospinos.com`.
3. Al loguearse, como su rol es netamente de Cajero, su menú no tiene acceso a crear o editar productos. Ella solo ve la pantalla de **Corte y Operaciones de Caja**.
4. Saca un billete de \$50, un billete de \$100, y su cambio en monedas (\$50) de la bóveda pequeña de seguridad, sumando en total \$200.00 en efectivo físico para arrancar el día.
5. Usa la pantalla del sistema y hace clic en **"Abrir Nueva Caja"**. En el campo de *"Monto Inicial/Fondo"*, escribe `$200.00`.
6. El sistema guarda la Bitácora (El *Shift* o turno se encuentra `OPEN`). La gaveta electrónica está lista para cobrar.

### Fase 2: El Primer Cliente (10:15 AM)
1. Entra Doña Florinda, pidiendo urgente el nuevo "Aceite Premium 5L" que acaba de recibir Bodega.
2. María va al sistema, hace clic en **Ventas y Facturación**.
3. Pone el lector de código de barras en el SKU o teclea rápidamente "Aceite Pre...".
4. El sistema arroja resultados ultra-rápidos: Aparece en pantalla "Aceite Premium 5L - Precio: $15.00 - Bodega: Disponible (200)". María le da clic para añadirlo al Carrito de Ventas.
5. El sistema marca: Subtotal $15.00.
6. Doña Florinda pone un billete de $20 en la mesa.
7. María selecciona **Método de Pago: "Efectivo"** (CASH) y emite el "Imprimir Cobro".
8. Inmediatamente el sistema:
   - Envía el recibo a la impresora térmica por socket local.
   - Suma \$15.00 dólares a su `cash_shift_record`. Su Caja Virtual ahora dice que tiene \$215.00 en gaveta.
   - Manda una orden silenciosa al servidor para ir a la Base de Datos y hacer un `"UPDATE products SET current_stock = 199"`.
   - Crea un registro contable de "Movement OUT: -1" atado al `Ticket: #T-001`.
   Todo ocurre en 0.2 segundos.

### Fase 3: La Tarjeta de Crédito (14:15 PM)
1. Ingresa el dueño de un restaurante, Don Toño. Lleva 20 litros de Aceite Premium 5L y 5 litros de otro proveedor, en total \$400.
2. Don Toño presenta una Tarjeta de Crédito Visa y requiere Facilidad Facturaria y Recibo en papel.
3. María añade los ítems a la cuenta pos. Total \$400.
4. Selecciona **Método de Pago: "Tarjeta de Crédito"**.
5. Cierra la orden. El sistema vuelve a imprimir.
6. **Mágico:** El sistema sabe que este dinero fue por Datafono financiero. Por ende, la venta entra en los "Ingresos Globales", pero el `actual_cash` de María *SE MANTIENE en \$215.00*. El sistema es a prueba de errores humanos.

### Fase 4: Cierre de Turno y Cuadre (18:00 PM)
1. María ha llegado al fin de su jornada, está cansada. Es hora del "Corte Z".
2. Acude a **Cierres de Caja (Daily Closing)** en la pantalla.
3. Ingresa a su Shift Activo para ejecutar **Cerrar Turno**.
4. La pantalla le resume el día:
   * Ventas Totales Facturadas: \$415.00
   * Pagos por Tarjeta: \$400.00
   * Efectivo Registrado Hoy: \$15.00
   * Fondo Original: \$200.00
   * **Efectivo Físico Esperado en Cajón: $215.00**
5. María saca la gaveta y usa sus manos: cuenta los dos billetes iniciales, y todo lo demás. ¡Sí, son $215.00 clavados!
6. Declara "Efectivo Físico Encontrado: 215.00" en el sistema.
7. El sistema marca el estatus final: **"DIFERENCIA: 0.00 - CUADRE PERFECTO"**.
8. Cierra sesión y de camino a casa sonríe; no debe poner un solo centavo de su bolsillo, y le tomará un segundo al gerente revisar mañana.
