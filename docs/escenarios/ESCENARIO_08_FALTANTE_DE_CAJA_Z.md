# Escenario 8: Faltante de Dinero en Caja - Cierre Conflictivo

## Perfil del Usuario Humano
**Nombre**: María "La Cajera" (Rol: `Cashier`) y Carlos (Rol: `Store-admin`)
**Objetivo**: Realizar el Cierre Z ("Daily Closing") cuando algo sale mal a lo largo del día y se extravía un billete de $20, asegurándose de que la base de datos cuadre la realidad matemática.

## Paso a Paso Simulado (Flujo Completo)

### Fase 1: El Error Humano (14:30 PM)
1. Durante una hora pico sumamente estresante en caja con 6 clientes haciendo cola.
2. Un señor entrega un billete de $100 por una compra de $15. 
3. María, aturdida por el ruido, le da al cliente su vuelto: le entrega $105 en físico por error mental (un billete extra de $20 metido entre los de a diez).
4. El cliente asiente tranquilamente y se marcha rápidamente de la tienda sin mencionar el exceso. Todo queda consumado físicamente, pero el sistema grabó que la venta fue perfecta $15.00 con un vuelto exacto de \$85. En el cajón ahora hay $20 físicos *de menos*.

### Fase 2: La Hora de la Verdad, Cierre Z (18:00 PM)
1. Fin de jornada, se cierra la cortina metálica del local.
2. María saca todas las gavetas de billetes y monedas, y tira todo en la contadora automática del backoffice. 
3. Abre el sistema en su navegador. Se dirige a **Cierres de Caja (Corte Z)** y presiona "Cerrar Caja #CJA-021".
4. El sistema indica con frialdad contable:
   *Fondo Original Físico: $100.00*
   *Efectivo Acumulado por Ventas Registradas: $415.00*
   **Total Efectivo Físco Esperado: $515.00**

### Fase 3: Confesión en Sistema (18:15 PM)
1. María ha limpiado a fondo su gaveta, hasta de las esquinas... y la máquina sumadora arroja obstinadamente un total Físico de: **$495.00**.
2. Sudando ligeramente, María mete en el campo del sistema que dice *"Efectivo Real Cortado"* la cifra `$495.00`.
3. Automáticamente, el sistema pinta el renglón de rojo y lanza la etiqueta: **Diferencia Calculada: - $20.00 (Faltante)**.
4. Para poder darle "Confirmar Cierre", el sistema hace obligatorio el campo de Justificación.
5. María escribe temblando el teclado: *"Faltante de $20. Posible billete mal entregado en vuelto a cliente de camisa verde a horas 14:30 durante fila extensa"*.
6. Clickea en el botón **Asentar Cierre con Faltante**.

### Fase 4: Auditoría del Administrador (Día Siguiente 08:00 AM)
1. Carlos abre su computadora y revisa en su Dashboard "Cajas Cerradas Ayer".
2. Ve la alerta naranja/roja en el turno de María. Clickea el registro.
3. Lee la justificación. Carlos entiende la situación, va a la caja registradora, verifica la constancia en video de la cámara en esa hora y confirma que efectivamente fue un error accidental.
4. Contablemente el sistema Los Pinos ha blindado a la empresa: el efectivo fue "cerrado" netamente con 495, cortando la fuga matemáticamente a partir del siguiente día. Los $20 faltantes pasan a un reporte especial de Nómina de "Descuentos a Personal" para descontarle al salario quincenal de María, manteniendo el P&L de la tienda ileso.
