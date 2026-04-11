# Escenario 6: Emergencias y Reversos - Clientes Enojados y Devoluciones Físicas

## Perfil del Usuario Humano Combinado
1. **El Cliente Enojado** (Físico en Tienda)
2. **María "La Cajera"** (Rol: `Cashier`)
3. **Carlos "El Administrador"** (Rol: `Store-admin`)

**Objetivo**: Resolver escenarios financieros críticos donde fluye el dinero de regreso al cliente, garantizando la cuadratura contable y el retorno del inventario limpio.

## Paso a Paso Simulado (Flujo de Contención Humana)

### Fase 1: El Retorno del Cliente (11:00 AM)
1. "Don Toño" del Restaurante regresa enfurecido a "Los Pinos Norte". Una de las cajas del *Aceite Premium 5L* que compró a las 10:15 AM y pagó (Escenario 3) tiene la boquilla rota y el aceite se derrama.
2. Exige la devolución agresiva de su dinero. Ni un intercambio ni crédito. ¡Efectivo en mano devolutivo!
3. María, la Cajera, mantiene la calma y solicita la Factura: Ticket T-003. 

### Fase 2: Ejecutando el Módulo de Devoluciones Físicas (11:05 AM)
1. María sabe que no puede simplemente abrir el candado de la gaveta de dinero y entregarle $15 en efectivo, el Sistema le registraría una pérdida inexcusable y desajuste en el Cierre Z.
2. María entra en la caja al panel de **"Buscar Ticket / Ventas Realizadas"**.
3. Encuentra la venta de inmediato usando la lupa. En el menú desplegable táctil selecciona **"Generar Devolución Total (Refund)"**.
4. El sistema pide validación por motivos de fraude: **Requiere Pin o Autorización del Administrador**.
5. Don Carlos (El Administrador de Tienda) voltea, corrobora la mala calidad del producto en el mostrador, y escanea su tarjeta digital / Pone su PIN como `Store-Admin`. *Autorizado.*

### Fase 3: Restitución de la Ecuación Contable y Física (11:06 AM)
Al darle 'Confirmar Reembolso en Efectivo por Defecto':
1. La Gaveta Electrónica dispara la apertura con un sonido agudo (¡CLACK!).
2. María saca \$15 dólares de su efectivo y sella la disculpa entregando el dinero a Don Toño de la mano.
3. Internamente, el Servidor ha hecho 3 cosas que salvan el pellejo tributario y analítico a la tienda:
   * **Dinero**: A la caja de María (Cash Shift) que tenía $415.00, se le ha procesado un egreso `- $15.00 (Devolución Ticket #T003)`. Ahora su caja real refleja perfectamente de vuelta los $400.00.
   * **Inventario Positivo Fantasma**: Esa unidad "Rota" volvió a la Existencia Lógica temporalmente (Stock +1)... Pero Carlos de inmediato (en ese mismo minuto) abre su Tablet e invoca el **Escenario 2 de Bodega (MERMA)** y saca el aceite para botarlo a la basura mediante una orden de *Merma por Devolución Fallida*. El Kardex y los dólares quedan 100% legales, justificados, perfectos.

### Fase 4: Sincronización Fallida del Camión de Pepe (19:00 PM)
*¿Qué pasa si ocurre lo impensable con la conectividad móvil?*
1. Pasando la tarde, Pepe "El Rutero" intentó devolver sus offline-tickets, pero un fallo gravísimo con la red 4G tronchó la subida de internet al apenas 50%.
2. Pepe se asusta, la aplicación de Flutter muestra "**Sincronización Fallida. Reintentando.**".
3. Lejos de entrar en pánico, Pepe descansa en el diseño "Offline-First". Los tickets que *SÍ* subieron se marcan de Verde en la App. Los que perdieron el paquete por caída red, se marcan en Amarillo y la base de datos de su Tablet mantiene los recibos criptográficos.
4. Al día siguiente que entra a la central de conectividad potente, Flutter empuja exactamente las copias en Amarillo y las sella en Verde en la BD General sin duplicar ni un centavo cobrado, protegiéndole su liquidación. Todo en paz.
