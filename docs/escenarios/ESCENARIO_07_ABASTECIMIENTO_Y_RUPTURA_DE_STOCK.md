# Escenario 7: Ruptura de Stock y Alertas de Reabastecimiento

## Perfil del Usuario Humano
**Nombre**: Laura "La Compradora" / Carlos "El Administrador"
**Rol**: `store-admin`
**Objetivo**: Prevenir que la tienda se quede sin producto estrella (Ruptura de Stock) mediante el correcto manejo del flujo de compras y entradas.

## Paso a Paso Simulado (Flujo Completo)

### Fase 1: La Alerta Roja (Lunes 08:00 AM)
1. Inicia la semana. Carlos abre la página de **Panel Global (Dashboard)** de su tienda.
2. En la sección de "Métricas Críticas", parpadea una alerta roja: **"Productos con Stock Crítico (1)"**.
3. Carlos da clic y el sistema le indica que el "Arroz San Pedro 50lb" llegó a 5 sacos, estando por debajo del mínimo de seguridad que habían establecido (10 sacos).

### Fase 2: Ejecución de Abastecimiento Preventivo (08:15 AM)
1. Carlos sabe que el miércoles es quincena y habrá muchas ventas. No puede dejar que llegue a cero.
2. Descuelga el teléfono y habla con su Proveedor Mayorista exigiendo el envío de 40 sacos de Arroz.
3. El proveedor le envía la "Orden de Compra / Guía de Remisión" por correo en ese mismo instante.

### Fase 3: La Llegada e Ingreso (Martes 10:00 AM)
1. El martes pita un camión en reversa en la zona de carga de bodega. Es el Arroz.
2. El Bodeguero "Antonio" agarra su tableta y entra directamente a **Inventario > Entrada de Productos**.
3. Busca "Arroz San Pedro 50lb". Pone cantidad: 40. Escribe como Referencia: "Guía Prov-099234".
4. Presiona guardar. El Kardex registra entrada `IN` y la existencia ahora marca 45 sacos en tiempo real. 
5. Inmediatamente el sistema elimina la alerta roja del Panel Global de Carlos en la oficina del frente, indicando que la sucursal ha salido exitosamente del peligro de perder ventas (Ruptura de Stock prevenida).
