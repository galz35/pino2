# Escenario 10: Caos de Auditoría y Conteo Físico Dominical

## Perfil del Usuario Humano Combinado
**Implicados**: 
1. **Antonio y Equipo** (Bodegueros) Rol: `inventory`
2. **Carlos** (Administrador de Tienda) Rol: `store-admin`

**Objetivo**: Simular el desgastante proceso de cierre de mes o el domingo "de inventario general" y cómo el sistema evita el uso de Excel y minimiza tiempos muertos de cierre.

## Paso a Paso Simulado (Flujo de Cierre Financiero Físico)

### Fase 1: Frenando el Mundo (Domingo 07:00 AM)
1. Es el famoso domingo de fin de mes de inventarios. Las puertas de la sucursal están cerradas al público. Todas las cajas están cerradas.
2. Carlos asiste a su consola, y declara la pre-auditoría, congelando lógicamente ciertas opciones.
3. Se despliega al personal a los pasillos con tablets, escáneres bluetooh y portapapeles.

### Fase 2: Ejecución Relámpago Aterrizada al Piso (08:00 AM - 12:00 PM)
1. Antonio va al pasillo A. En the app/web de **Ajustes y Entradas (Módulo de Ajustes de Stock)**.
2. Pone su escaner para que dispare luces láser contra las cajas, en vez de usar papel.
3. ***¡Piip!*** Lee Cereal marca X. El escáner pega un "Enter" virtual, lo cual preselecciona el Cereal en el portal web al instante en Búsqueda Predictiva Rápida.
4. Antonio cuenta: 124 cajas físicas. 
5. Clica: Ajuste de Conteo Físico. Monto Real Encontrado: `124`. Guarda. 
6. El sistema detecta: "Uauh, según la base de datos debían existir 130. Hay una merma invisible de 6, por lo que el sistema automáticamente procesa un egreso INVISIBLE OUT x 6" a nombre de Auditoría.
7. Antonio corre hacia los galones químicos. Escanea de la misma forma, cuenta 40. El sistema esperaba 38. Se ejecuta automáticamente la entrada INVISIBLE IN x 2 a nombre de Auditoría. No hay que sumar con calculadoras Texas Instuments.

### Fase 3: La Revisión Administrativa (14:00 PM)
1. Han contado los 2,000 SKUs de la tienda.
2. Carlos revisa el reporte del módulo **Reportes Consolidados de Movimiento / Auditoría de Inventario**.
3. El sistema tira un archivo Excel/CSV inmaculado o una gráfica de calor.
4. Le marca a Carlos explícitamente y en un resumen global cuánto dinero le costó el desvío.
   Ejemplo: "Hoy se corrigieron Desviaciones de 450 items, generando una Mermas Financieras de Faltante x $30.00 y Recuperación por Sobrantes de $15.00. Su diferencia neta ajustada es de -$15.00 dólares a pérdida final". 
5. Carlos firma, sonríe porque el conteo duró 4 horas en vez de 3 días, y abre las puertas del local al público al día siguiente a las 7 AM con un catálogo perfecto e infalible, cero cruces de mercancía.
