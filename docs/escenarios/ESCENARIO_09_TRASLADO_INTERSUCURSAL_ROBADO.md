# Escenario 9: Traslado Intersucursal - El Coche de Carga Robado o Accidentado

## Perfil del Usuario Humano Combinado
**Implicados**: 
1. **Andrés** (Bodega Origen "Los Pinos Norte") Rol: `inventory`
2. **Pedro** (Bodega Destino "Los Pinos Este") Rol: `inventory`
3. **Fernando** (Dueño Global) Rol: `master-admin`

**Objetivo**: Entender cómo se resuelve y ampara contablemente un traslado de miles de dólares en mercancía de una tienda a otra, cuando el camión físico desaparece, choca, o es asaltado a medio camino.

## Paso a Paso Simulado (Flujo de Contención Logística)

### Fase 1: La Solicitud y Origen (13:00 PM)
1. "Los Pinos Norte" es la bodega central. "Los Pinos Este" los llama solicitando **50 Cajas de Detergente Costoso**.
2. Andrés, el Bodeguero Norte, va al sistema y entra al panel de **Almacén > Inventario Interno**. 
3. Da clic a "Realizar Traslado". Elige las 50 Cajas de Detergente, especifica que van como Destino hacia "Los Pinos Este" y anota al Chofer "Ramón" como Referencia, junto a las placas de la Van (ABC-123).
4. El sistema reacciona y de inmediato descuenta (-50) cajas de la Bodega Norte, con el movimiento de salida documentado por un ticket de traslado interno.
5. El camión pisa el acelerador y se va en viaje hacia "El Este".

### Fase 2: Incertidumbre y la Lista de Recibo (15:00 PM)
1. En "Los Pinos Este", el bodeguero Pedro ingresa tranquilamente a **Traslados > Tránsitos Entrantes**.
2. En su pantalla parpadea un movimiento entrante número #TRA-9400. Se indica que están en "Tránsito/Espera" 50 Cajas de Detergente.
3. El reloj avanza. Son las 5 de la tarde. El camión de Ramón debió llegar hace 2 horas. El botón para darle "Ingreso Total a Kardex" sigue intacto, porque nadie ha validado la llegada física.
4. Entra una llamada de emergencia local. Ramón sufrió un asalto en la periferia de la ciudad y se llevaron las 50 cajas. Ramón está ileso, pero la mercancía ya no existe.

### Fase 3: La Autoridad y Limpieza Contable (Al siguiente día)
1. El camión nunca llegó, por lo tanto, el bodeguero receptor Destino **(Pedro)** jamás apretó el botón de "Asentar Entrada de Traslado". El Kardex de la tienda Este sigue matemáticamente en Cero Detergentes, de modo que ningún cajero intentará venderlos y equivocarse.
2. Contablemente, la mercancía se quedó colgando en el "Limbo" Transitorio (Tránsito Pendiente) dentro del software "Los Pinos".
3. Dado que estas 50 Cajas costaban miles de dólares y la pérdida es gravísima, ni los bodegueros pueden simplemente "limpiar" el tránsito con una merma menor. Eleva el caso.
4. Don Fernando (`master-admin`, El Dueño / Aseguradora) ingresa al sistema corporativo de control de toda la cadena general.
5. Busca el traslado pendiente original. Selecciona **Rechazar Traslado o Convertir a Pérdida/Merma Total Extrema**. Acompaña un archivo digital policial como referencia legal de Pérdida en Ruta ABC-123.
6. El inventario en tránsito se vaporiza del sistema corporativo en "Cerillo Contable Fiscal por Robo", manteniendo el Inventario Local de la Tienda Norte cuadrado (sacó las 50 cajas legalmente) y el Inventario Local del Este cuadrado (jamás le ingresaron). Flujo Limpio.
