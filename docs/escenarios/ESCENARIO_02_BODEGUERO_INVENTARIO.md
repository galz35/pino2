# Escenario 2: Antonio de Bodega - Entradas, Mermas y Cierres de Stock

## Perfil del Usuario Humano
**Nombre**: Antonio "Montacargas"
**Rol**: `inventory` (Gestor de Bodega)
**Objetivo**: Realizar la recepción física de la mercancía, ajustar el inventario por rupturas y certificar existencias, todo sin tocar (ni ver) opciones de facturación o dinero de caja.

## Paso a Paso Simulado (Flujo Completo)

### Fase 1: Llegada del Camión de Proveedores (08:30 AM)
1. Antonio se encuentra en la bodega (parte trasera de la tienda). Usa una Tablet blindada conectada al WiFi local.
2. Ingresa a la app mediante su navegador web en la tablet y se loguea como `bodeg@lospinos.com`.
3. Notará que la Interfaz es **mucho más limpia** que la de Carlos. No hay pestañas de reportes financieros; su barra lateral resalta únicamente el módulo **Almacén e Inventario**.
4. Llega el camión de la distribuidora mayorista con el pedido de "Aceite Premium 5L".
5. Antonio verifica físicamente las cajas con la factura física del proveedor en la mano. Todo coincide.
6. En la tablet, entra a **Inventario > Entrada Rápida**.
7. Escanea o teclea el producto "Aceite Premium 5L". 
8. Coloca **Cantidad**: 200.
9. En **Referencia/Factura** escribe "Factura Prov #99014 - Entrega Matutina".
10. Presiona el botón verde de "Asentar Entrada". En milisegundos, el Kardex sube a 200 y el producto pasa a estar disponible para la zona de ventas.

### Fase 2: Accidente en Bodega - Mermas (11:00 AM)
1. Durante la reestructuración de unas góndolas metálicas, a Antonio se le resbala una caja pequeña.
2. Tres unidades de una "Salsa de Tomate" de vidrio se hacen añicos en el suelo.
3. Lo limpia de inmediato pero debe cuadrar la contabilidad; de no hacerlo, faltará dinero en la auditoría general de fin de mes.
4. Antonio va a la Tablet, modulo **Inventario > Ajustes de Stock**.
5. Selecciona:
   - **Producto**: Salsa de Tomate.
   - **Cantidad Físico a Afectar**: 3.
   - **Tipo de Movimiento**: MERMA (Salida Excepcional).
   - **Referencia/Justificación**: "Producto roto durante maniobra en pasillo 4".
6. Clic en "Guardar". El sistema emite un movimiento `OUT` de tipo Merma. El stock de Salsa de Tomate disminuye de 50 a 47. De esta manera transparente nadie tendrá problemas al cobrar e intentar entregar algo inexistente.

### Fase 3: Conteo Ciclico / Ajuste Positivo (16:00 PM)
1. A las 4 PM, Antonio realiza un "Ruteo de Conteo" rutinario o Cíclico en el pasillo de Jabones.
2. Descubre que detrás de una estructura grande, había una caja con 12 Jabones de Ropa que el mes pasado se habían dado por perdidos.
3. El sistema marca que hay 0 Jabones de Ropa, pero él tiene 12 frente a sus ojos.
4. Vuelve a entrar a **Inventario > Ajustes de Stock**.
5. Selecciona:
   - **Producto**: Jabón de Ropa.
   - **Cantidad Físico a Afectar**: 12 (1 caja).
   - **Tipo de Movimiento**: AJUSTE_IN (Entrada Excepcional / Encuentro físico).
   - **Referencia/Justificación**: "Sobrante tras limpieza estructural en anaqueles B2".
6. Guarda el cambio. El Kardex sube mágicamente a 12 de forma limpia y transparente, restaurando la liquidez del bien a favor de la sucursal.
7. Antonio cierra su sesión (`Log out`), limpia su polvera y da por terminada su jornada con 0 diferencias operativas en su almacén.
