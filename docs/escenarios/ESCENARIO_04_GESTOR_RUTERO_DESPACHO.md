# Escenario 4: Gestor Múltiple y el Camionero Offline (Rutas Logísticas)

## Perfil del Usuario Humano Combinado

### 4A) El Jefe Logístico (Gestor de Ventas)
**Nombre**: Roberto "Rutas"
**Rol**: `sales-manager` (Gestor Ventas / Despachador)
**Objetivos**: Controlar desde aire acondicionado y un escritorio hacia dónde huyen los camiones ambulantes de reparto y liquidar sus maletines con dinero al volver. Asignar existencias virtualmente al inventario a "bordo" del vehículo.

### 4B) El Chofer Ambulante (Rutero)
**Nombre**: Pepe "El Volante"
**Rol**: `rutero` (Chofer/Vendedor Ambulante)
**Objetivo**: Realizar facturaciones fuera de la tienda (en la jungla de asfalto o tierra adentro donde no hay señal de Internet), cobrar dinero al vuelo y sobrevivir el final de la faena.

---

## Paso a Paso Simulado (Flujo Completo E2E)

### Fase 1: Planificación Madrugadora (Gestor en Tienda) (06:00 AM)
1. Es lunes por la mañana. Pepe (el chofer) aparca el camión logístico `PLACA-123` en el andén trasero de carga de la sucursal Norte de Los Pinos.
2. Roberto (El Gestor) se despierta temprano, se toma su café, y enciende la vista administrativa de **Punto de Venta Ambulante** en su ordenador. Entra como `gestor@lospinos.com`.
3. Ingresa a **Asignación de Inventario a Ruta**. Selecciona el perfil del empleado (Pepe) y asigna virtualmente "500 Libras de Azúcar", "50 Aceites de Cocina Grandes".
4. El sistema saca del stock estático de bodega esa mercancía, abriendo así una **Sub-bodega Móvil** para Pepe, el Rutero. Roberto hace clic en "Despachar y Confirmar".

### Fase 2: Pepe Inicia Viaje hacia la Alta Montaña (08:00 AM)
1. Pepe se sube al camión con su Dispositivo Tablet con la Aplicación **Flutter (App Móvil Autónoma)**.
2. Abre la tablet en el parqueadero donde aún llega la señal Wi-Fi de la tienda. Inicia sesión en la App, y la App le dice `[Sync] - Descargando Rutas e Inventarios del camión...`.
3. A Pepe se le marca todo en color verde. Ha descargado las 500 Libras de Azúcar virtuales para su facturación en camino.
4. Conduce 3 horas hacia la "Feria de Montaña". Al llegar allá, **No Hay Señal de Internet Móvil (Edge/3G muerta)**.

### Fase 3: Puntos de Venta Móvil Completamente Desconectados (11:00 AM)
1. Llega al mercado de abastos perdido. El Cliente #1 quiere 20 Libras de azúcar.
2. El sistema Flutter funciona a cabalidad (`Offline First`). 
3. Pepe usa la App: Abre una **Factura Rápida** -> Añade sus libras de azúcar offline -> Emite ticket desde su mini impresora térmica Bluetooth de cinto. 
4. El cliente le paga $30 en efectivo físico en denominaciones sueltas. Pepe lo embulsa. La aplicación móvile guarda un flag interno en su base local que dice: `transaction_pending_upload`.
5. Esto lo repite con 20 carniceros, panaderos y dueños de tiendas a lo largo de su jornada hasta las 4 PM. Su base de datos local en SQLite en la tablet está llena de tickets de venta. Su bolsa de recaudo tiene $2,500 en efectivo bruto.

### Fase 4: Retorno y Liquidación Magistral (18:00 PM)
1. Pepe cruza de nuevo los portones hacia la ciudad civilizada. Al llegar al patio donde el ruteador capta la red 4G y WiFI.
2. La Aplicación Flutter detecta red. Pepe toca el botón circular gigante que dice **`[Sincronizar a Servidor]`**.
3. *Magia Pura*: Todos los 20 tickets pendientes, la deducción del inventario móvil, los IDs de los movimientos y los pagos entran como misiles invisibles y atómicos por la red hacia el Servidor NodeJS (`/api/sales/process/bulk` ficticio o iterado).
4. El teléfono vibra confirmando "Subida Completa y Kardex Reconciliado".

### Fase 5: El Rendimiento de Cuentas frente al Gestor (18:30 PM)
1. Pepe se baja con su cartera gruesa a la oficina de Roberto.
2. Roberto (`gestor@lospinos.com`) accede a **Cierres de Ruteros** desde su navegador web.
3. El sistema le despliega en la pantalla grande la Liquidación y Rendición detectada para `RUTERO: PEPE`:
   * Inventario subido: 50 Aceites
   * Inventario Vendido Registrado: 45 Aceites
   * Mermas devueltas por baches de carretera reportados: 2 Aceites quebrados.
   * Inventario Devuelto Físicamente al piso en la tienda: 3 Aceites.
   * **Total a Recaudar Dinero Efectivo:** \$2,500.00
4. Pepe saca todo y la maquinita cuenta los billetes. Hay $2,500.00 exactos.
5. Roberto selecciona **Cerrar Liquidación con Cuadre**. Se firma.
6. Gracias a la aplicación de Los Pinos, la empresa no sufre desfalcos por choferes tramposos o cuentas a pulso perdidas. El stock móvil retorna al stock primario sin fugas. Misión Cumplida.
