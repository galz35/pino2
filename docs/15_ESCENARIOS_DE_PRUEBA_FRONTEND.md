# Escenarios de Prueba Detallados - Frontend React (Vía Clics)

Este documento contiene los flujos paso a paso para certificar manualmente que el sistema React web cumple con todos los requerimientos mapeados. Asumimos que tienes los servidores en ejecución local (`localhost:5173` y `localhost:3010`).

---

## ESCENARIO 1: Flujo Retail (Bodega -> Caja -> Venta -> Cierre)
**Objetivo:** Probar el ciclo completo B2B desde que entra mercancía hasta que se vende y se arquea la caja.

### 1.1 Recepción de Mercancía
* **Rol sugerido:** Store Admin o Inventory.
* **Dónde ir:** En el Sidebar, navega a `Inventario` -> `Compras/Facturas Proveedor` (`/store/:id/suppliers/invoice`).
* **Qué hacer (Clics):**
  1. Haz clic en el botón superior derecho **"Nueva Factura"**.
  2. Selecciona un Proveedor (o crea uno rápido con el botón `+`).
  3. Añade al menos 2 productos al carrito usando el buscador "Buscar producto...".
  4. Ingresa un número de factura (ej. `FCT-9901`).
  5. En "Tipo de Pago", selecciona **CONTADO**.
  6. Haz clic en **"Guardar Factura"**.
* **Qué verificar:** Debe aparecer un mensaje verde ("Guardado Exitoso"). Ve a `Productos` y verifica que el `Stock` de esos 2 productos subió acorde a lo comprado.

### 1.2 Apertura de Turno de Caja
* **Rol sugerido:** Cashier o Store Admin.
* **Dónde ir:** En el Sidebar, navega a `Caja` -> `Control de Caja` (`/store/:id/cash-register`).
* **Qué hacer:**
  1. Si dice "Caja Inactiva", haz clic en el botón grande azul **"Abrir Caja Ahora"**.
  2. En "Fondo de Caja (NIO)", escribe `1500`.
  3. Haz clic en **"Confirmar Apertura"**.
* **Qué verificar:** La pantalla debe cambiar a mostrar 3 cuadros principales: Turno Abierto, Ventas Efectivo (en 0), y Efectivo Estimado (1500).

### 1.3 Facturación Rápida (Punto de Venta)
* **Dónde ir:** Navega en el Sidebar a `Caja` -> `Facturación POS` (`/store/:id/billing`).
* **Qué hacer:**
  1. Utiliza la barra "Buscar producto para la venta...". Escribe el nombre del producto que recibiste de proveedor en el Paso 1.1 y hazle clic.
  2. En Cliente, déjalo como "Cliente Genérico".
  3. Fíjate en el bloque "Total a Pagar" (ej. 350.00).
  4. Haz clic en el botón gigante verde/azul **"Cobrar"**.
  5. En el modal "Finalizar Venta", en "Monto Recibido", pon `500`. (Verás que calcula el cambio solo).
  6. Haz clic en el botón **"Efectivo"**.
* **Qué verificar:** Una notificación de "Venta Completada". El carrito se limpia solo.

### 1.4 Cierre y Arqueo (Z)
* **Dónde ir:** Vuelve a `Caja` -> `Control de Caja` (`/store/:id/cash-register`).
* **Qué hacer:**
  1. Selecciona el botón rojo **"Finalizar Turno Actual"** (bajo Cierre de Operaciones).
  2. Saldrá un "Cuadre y Cierre". Verás que el "Monto Esperado" ya incluye los 1500 + la venta.
  3. En "Efectivo Físico", a propósito escribe `50` pesos *menos* de lo esperado (ej. 1450).
  4. Notarás un cartel amarillo o rojo: `Diferencia: C$ -50.00`.
  5. Haz clic en **"Finalizar y Generar Z"**.
* **Qué verificar:** Turno cerrado exitosamente y regresa a "Caja Inactiva".

---

## ESCENARIO 2: Ventas a Crédito B2B y Cuentas por Cobrar
**Objetivo:** Probar el manejo de la deuda empresarial y las pantallas de recaudo contable.

### 2.1 Facturar a Crédito
* **Rol sugerido:** Store Admin / Sales Manager.
* **Dónde ir:** `Caja` -> `Facturación POS` (`/store/:id/billing`).
* **Qué hacer:**
  1. Abre turno de caja si no hay uno activo.
  2. Busca un producto para vender (*Asegúrate que cueste más de C$ 1,000*).
  3. **¡Crucial!** Cambia del "Cliente Genérico" a un cliente corporativo pulsando "Buscar o seleccionar cliente" y escogiendo uno de la lista.
  4. Haz clic en **"Cobrar"**.
  5. Aunque estés en el panel de Cobros, fíjate si la BD permite asentar a crédito. *(Nota: El POS de caja por defecto cobra al contado. Para asentar un pedido a crédito, la venta debe generarse desde el módulo de "Pedidos comerciales / Sales").* 
  *(Alternativa:* Si estás en Cashier, factura a 0 efectivo y pon "Tarjeta", simulando un pago mixto. Para un crédito real, usa el escenario 3 de pedidos).*

### 2.2 Pago de Cartera ("Cuentas por Cobrar")
* **Dónde ir:** En el Sidebar, ve a `Reportes y Finanzas` -> `Cuentas por Cobrar` (`/store/:id/finance/receivables`) *o usa la ruta de Colecciones*.
* **Qué hacer:**
  1. En la lista, busca una factura que tenga estatus `PENDING` o `PARTIAL` y dale clic.
  2. Haz clic en **"Registrar Abono"** o "Pay".
  3. Introduce el **monto a abonar** (por ejemplo la mitad de la deuda). Selecciona "CASH" o "TRANSFER".
  4. Agrega un "Número de Referencia" si es transferencia.
  5. **"Guardar"**.
* **Qué verificar:** El saldo total disminuye en vivo. El estatus de la factura pasa a "Pagado Parcial".

---

## ESCENARIO 3: Logística de Patio y Ruteo
**Objetivo:** Confirmar el tablero Kanban de bodega para despachos pesados.

### 3.1 Registrar Pedido Pendiente (Preventa)
* **Rol sugerido:** Store Admin / Vendedor (`vendor-sales-page`).
* **Dónde ir:** En el Sidebar (bajo módulo Comercial): `Equipo de Ventas` -> `Levantar Pedido` (`/store/:id/vendors/sales`).
* **Qué hacer:**
  1. Llena el carrito comercial como en el POS.
  2. Selecciona Cliente obligatoriamente.
  3. En Tipo de Pago selecciona `CREDITO`.
  4. Guarda el pedido. (Esto genera el comprobante, pero **no descuenta stock del piso todavía** sino que genera un `Pending Order`).

### 3.2 Alistamiento de Bodega (Tablet / Torre de Control)
* **Dónde ir:** Navega a `Logística` -> `Tablero de Alistamiento` (`/store/:id/warehouse`).
* **Qué hacer:**
  1. Verás el pedido en la columna gris (PENDING).
  2. Arrastra y suelta la tarjeta hacia la columna amarilla **PREPARING** (o usa el menú del botón ⋮ -> "Mover a Preparación").
  3. Vuelve a arrastrar a la columna azul **READY** / Alistado.
* **Qué verificar:** La interfaz se actualiza rápido, reflejando el nuevo estatus en base de datos. 

### 3.3 Consola de Despacho Logístico (Dispatcher)
* **Dónde ir:** `Logística` -> `Despachador` (`/store/:id/dispatcher`).
* **Qué hacer:**
  1. Verás la lista de pedidos en estado "READY". 
  2. Selecciona 1 o más cajas de verificación (checkboxes) junto a los pedidos.
  3. Arriba a la derecha, haz clic en **"Asignar Ruta / Vehículo"**.
  4. Selecciona un *Rutero/Chofer* del desplegable y dale a Guardar.
* **Qué verificar:** El pedido desaparece del pool de Despachador porque ahora pertenece al chofer.

### 3.4 Entrega en Tránsito (App Rutero)
* **Dónde ir:** Loguéate como Rutero o ve a `Logística` -> `Mis Entregas / Ruta` (`/store/:id/delivery-route`).
* **Qué hacer:**
  1. Entra a "Paradas de Hoy" o a la zona que te asignaron.
  2. Haz clic en el Pedido correspondiente.
  3. Pulsa el botón verde de **"Confirmar Entrega Completa"**.
* **Qué verificar:** El pedido cambia a "DELIVERED" y el stock ahora se resta contablemente como ingreso / venta concluida.

---

## ESCENARIO 4: Vendedores Autoventa (Quick Sale Camión)
**Objetivo:** Comprobar la lógica del inventario paralelo (Módulo Vendor).

### 4.1 "Cargar" el Vehículo del Vendedor
* **Rol Sugerido:** Store Admin / Sales Manager.
* **Dónde ir:** `Equipo comercial` -> `Inventario Vendores` (`/store/:id/vendors/inventory`).
* **Qué hacer:**
  1. Arriba haz clic en "Asignar Inventario" (o el diálogo principal).
  2. Selecciona al Vendedor Juan Pérez.
  3. Busca "Coca Cola 3L" y pásale 50 unidades desde "Bodega Principal" a "Juan Pérez".
  4. "Confirmar Asignación".

### 4.2 Efectuar Venta Rápida "En la Calle"
* **Dónde ir:** `Equipo comercial` -> `Venta Automóvil` (`/store/:id/vendors/quick-sale`).
* **Qué hacer:**
  1. Busca "Coca Cola 3L".
  2. Verás que en stock disponible no dice el 1,000 de la tienda, sino "50" (lo que le prestaste al vehículo).
  3. Cobra de forma normal igual que en la caja del Escenario 1.
* **Qué verificar:** Si Juan Pérez ahora revisa su stock (`/vendors/inventory` de nuevo filtrando por él), tendrá 49.

---

## 💥 Pruebas de Resiliencia / Websocket
En cualquier momento, **abre una segunda ventana de incógnito**.
1. En Incógnito, ve al *Control de Caja* (Escenario 1) y **abre o cierra una caja**.
2. En tu pantalla normal (donde tienes abierto el Dashboard `master-admin/dashboard` o `store/:id/dashboard`), vas a presenciar una notificación "Toast" nativa indicando *Nuevos Movimientos* y gráficas actualizándose *(Requerimiento Real-Time Events cruzado exitosamente).*
