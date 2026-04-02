# PDF móvil y dispositivos de baja gama

Fecha de corte: 2026-04-02

## 1. Veredicto corto

Sí, Flutter puede generar factura o comprobante PDF.

Pero para `pino` no conviene hacerlo con una solución pesada por defecto.

La recomendación correcta para este proyecto es:

- generación PDF **opcional**
- documento corto
- sin preview embebido pesado
- sin imágenes grandes
- sin fuentes pesadas si no hacen falta
- compartir o guardar el archivo, no renderizar un visor complejo dentro de la app como flujo principal

## 2. Librería recomendada para este proyecto

### Opción recomendada

- `pdf`

Uso recomendado:

- generar el PDF en memoria
- guardar archivo local temporal
- compartirlo o abrirlo externamente solo si el usuario lo pide

### Librería complementaria recomendada

- `share_plus`

Uso recomendado:

- compartir el PDF generado por WhatsApp, correo o apps del teléfono

## 3. Librería que no pondría como primera opción

### `printing`

No la descarto, pero no la pondría como base del flujo principal en teléfonos modestos.

Razón:

- añade más complejidad de plataforma
- invita a usar `PdfPreview`, que para operación de calle no es lo más rápido
- para este producto la prioridad no es “preview bonito”; la prioridad es vender, cobrar o despachar y seguir

Si en una fase futura se necesita impresión o preview real, puede entrar después como extra.

## 4. Opción potente pero no recomendada como primera decisión

### `syncfusion_flutter_pdf`

Tiene muy buena capacidad y se presenta como librería de alto rendimiento, pero para `pino` no es la primera decisión por:

- licencia comercial/community a revisar
- mayor peso conceptual
- mucha más capacidad de la que hoy necesitas para una factura móvil operativa

Sirve si en el futuro pides:

- firma digital
- formularios PDF
- edición avanzada
- PDF corporativo complejo

Hoy sería demasiado para el objetivo actual.

## 5. Qué haría en `pino`

### Regla de producto

No generar PDF como paso obligatorio del flujo de venta o cobro.

Sí permitir:

- `Guardar pedido`
- `Guardar cobro`
- `Generar PDF` como acción opcional

Eso protege el ritmo del usuario de calle.

### Regla técnica

Para baja gama:

- PDF de 1 página o pocas páginas
- sin logos pesados
- sin fotos grandes
- sin tipografías custom si no son imprescindibles
- preferir fuentes estándar del motor PDF
- generar fuera del frame crítico de la UI

### Regla de UX

No abrir visor PDF dentro de la app como primera acción.

Mejor:

1. generar
2. guardar temporalmente
3. compartir o abrir externamente

## 6. Relación con mala señal y offline

PDF y offline no son lo mismo.

El PDF sí se puede generar sin internet si los datos ya están locales.

Pero hoy en `pino` móvil todavía no existe cache completo de:

- catálogo
- clientes
- pedidos
- cobros
- devoluciones

Por eso el bloqueo real no es la librería PDF.

El bloqueo real para operación sin señal es:

- persistencia local completa
- cola offline real
- reconciliación con backend

## 7. Estado real hoy en Flutter

La app móvil sí tiene base local SQLite con `drift`.

Hoy guarda:

- tiendas asignadas
- bitácora de eventos realtime
- cola offline base

Eso ayuda, pero todavía no alcanza para decir:

- “la app trabaja completa sin internet”

Lo correcto hoy es decir:

- hay base local real
- hay cimientos offline
- todavía falta offline-first operativo completo

## 8. Decisión recomendada

Para el siguiente paso móvil:

### Sí

- agregar `pdf`
- agregar `share_plus`
- crear servicio pequeño de comprobante/factura
- usarlo solo como acción opcional

### No todavía

- `PdfPreview` como flujo base
- visor embebido pesado
- generación automática en toda venta
- plantillas visualmente complejas

## 9. Fuentes revisadas

- Flutter offline-first:
  - https://docs.flutter.dev/app-architecture/design-patterns/offline-first
- Flutter websockets:
  - https://docs.flutter.dev/cookbook/networking/web-sockets
- `pdf` package:
  - https://pub.dev/packages/pdf
- `printing` package:
  - https://pub.dev/packages/printing
- `share_plus` package:
  - https://pub.dev/packages/share_plus
- `syncfusion_flutter_pdf` package:
  - https://pub.dev/packages/syncfusion_flutter_pdf
