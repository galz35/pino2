# Escenario 1: El Administrador (Don Carlos) - Apertura, Gestión y Control Total

## Perfil del Usuario Humano
**Nombre**: Carlos "El Jefe"
**Rol**: `store-admin` (Administrador de Tienda)
**Objetivo**: Asegurarse de que la sucursal "Los Pinos - Norte" esté lista para operar, tenga mercancía en el sistema, y su personal se encuentre asignado.

## Paso a Paso Simulado (Flujo Completo)

### Fase 1: Llegada y Monitoreo (07:30 AM)
1. Carlos enciende su computadora en la oficina administrativa de la sucursal.
2. Abre Google Chrome y digita la URL de la intranet de Los Pinos.
3. Es recibido por la pantalla de **Login**. Ingresa su correo `admin_test@lospinos.com` y su clave.
4. Al loguearse, el sistema lo redirecciona automáticamente al **Panel Global (Dashboard)**.
5. Observa las gráficas de ingresos y salidas del mes anterior. Puede ver advertencias de productos que tienen bajo stock. Todo carga ágilmente.

### Fase 2: Configurando Productos para el Nuevo Día (08:00 AM)
1. El camión descargó anoche un nuevo tipo de "Aceite Premium 5L" que no estaba en el catálogo.
2. Carlos se dirige al menú izquierdo y hace clic en **Catálogo > Productos**.
3. Hace clic en el botón superior derecho **+ Nuevo Producto**.
4. Llena el formulario: 
   - **Nombre**: Aceite Premium 5L.
   - **Código Universal (SKU)**: 789456123.
   - **Precio de Costo**: $12.00
   - **Precio de Venta**: $15.00
   - **Maneja Inventario**: SÍ (marca la casilla).
   - **Unidades por Caja**: 4.
5. Guarda el producto. Una alerta verde confirma: "Producto creado exitosamente".

### Fase 3: Delegando el Conteo Inicial (08:15 AM)
1. Carlos sabe que el producto ya existe en la base de datos, pero el inventario dice "Cero". Él no lo cuenta personalmente, así que llama por radio a Antonio (el Bodeguero) para que proceda con el Conteo y Entrada (ver Escenario 2).

### Fase 4: Auditoría del Mediodía (13:00 PM)
1. Carlos regresa después de almorzar, quiere ver cómo le fue a Caja.
2. Abre el menú izquierdo y selecciona **Tiendas**, entra a la vista profunda de **Los Pinos - Norte**.
3. Navega al módulo **Cierres de Caja (Corte Z)**.
4. Da clic en "Cajas Activas". Ve que la Cajera (María) ha acumulado $450.00 dólares en ventas en la mañana.
5. Se dirige a **Inventario > Historial**. Revisa y audita que todas las salidas de ese día empatan con el número del Ticket generado por María.

### Fase 5: Traslado de Rescate (15:00 PM)
1. Suena el teléfono celular. Es el gerente de la sucursal "Los Pinos - Sur", lamentándose que se les acabó el Papel Higiénico industrial y tienen a un gran cliente esperando.
2. Carlos se dirige a **Inventario > Almacén Múltiple**.
3. Selecciona **Nuevo Traslado**.
4. **Origen**: "Los Pinos - Norte".
5. **Destino**: "Los Pinos - Sur".
6. **Producto**: Papel Industrial (escoge del buscador predictivo que se autocompleta).
7. **Cantidad**: 100 unidades.
8. **Referencia**: "Apoyo de emergencia a sucursal Sur, recoge chofer Mario".
9. Al confirmar, el sistema automáticamente:
   - Resta 100 unidades de su tienda (Norte).
   - Crea un movimiento fantasma virtual en tránsito, y le suma 100 unidades a la tienda Sur de manera bidireccional.
10. Carlos suspira tranquilo, su trabajo administrativo fluye de maravilla a través de su navegador web sin necesidad de escribir en papeles o Excels propensos a dañarse.
