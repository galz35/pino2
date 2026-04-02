# Flutter: Principios UX Para Campo y Bodega

Fecha de corte: 2026-04-02

## 1. Regla principal

El móvil de `pino` no se diseña para un usuario técnico sentado frente a una pantalla.

Se diseña para:

- vendedor en calle
- rutero en movimiento
- bodega en operación
- despacho bajo presión

Ese usuario trabaja rápido, habla rápido y decide rápido.

La app tiene que ir de la mano con ese ritmo.

## 2. Regla operativa de diseño

Cada flujo móvil debe responder estas preguntas:

1. ¿se puede iniciar la tarea principal en 1 toque?
2. ¿se puede completar en pocos pasos visibles?
3. ¿el usuario entiende qué hacer sin leer demasiado?
4. ¿la pantalla muestra solo lo esencial para esa acción?
5. ¿la app evita cambiarlo de pantalla innecesariamente?

Si la respuesta es no, el flujo todavía no está bien.

## 3. Qué significa esto en `pino`

### 3.1 Preventa

El vendedor no quiere:

- navegar catálogo, luego clientes, luego carrito, luego confirmación

Quiere:

- abrir una vista
- elegir cliente
- buscar producto
- sumar cantidades
- guardar pedido

Por eso se implementó `Preventa rápida` en una sola vista.

### 3.2 Ruta

El rutero no quiere:

- abrir manifiesto
- luego abrir otra pantalla de cliente
- luego otra para dirección
- luego otra para revisar estado

Quiere:

- ver de una vez qué tiene pendiente
- ver dirección
- ver estado
- ver lo que va cobrando o entregando

Por eso `Ruta y entregas` se concentra en una sola vista móvil.

### 3.3 Bodega

Bodega no necesita decoración primero.

Necesita:

- ver qué sale hoy
- ver cantidad
- ver presentación
- confirmar rápido

La futura pantalla especializada de bodega debe seguir exactamente esa lógica.

## 4. Reglas visuales

- acciones primarias grandes
- textos cortos
- estados claros
- contraste alto
- evitar tablas complejas
- evitar menús profundos
- evitar pantallas vacías con exceso de navegación
- usar tarjetas operativas y botones directos

## 5. Regla de arquitectura

La arquitectura Flutter debe servir al flujo, no al revés.

Eso implica:

- primero pantalla útil
- luego refinamiento visual
- primero operación rápida
- luego opciones secundarias
- primero online estable
- luego offline avanzado

## 6. Traducción a módulos actuales

El corte actual queda priorizado así:

- `Preventa rápida`
- `Ruta y entregas`
- `Catálogo operativo`
- `Clientes`

Y deja para después:

- cobros móviles completos
- devoluciones
- bodega especializada
- sync offline completo

## 7. Fuente de verdad

Cuando se siga Flutter, esta regla UX debe prevalecer sobre cualquier diseño más bonito pero más lento.
