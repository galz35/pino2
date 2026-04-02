# Auditoria de Diseno React

Fecha de corte: 2026-04-02

## Veredicto general

El frontend React quedó fuerte tanto en funcionalidad como en operación visual para el alcance actual.

La auditoría inicial sí detectó cuatro puntos flojos reales:

- dashboard muy pobre
- cobranza en ruta demasiado tabular
- venta rápida todavía muy de “panel web”
- navegación lateral con demasiadas opciones al mismo nivel

Ese bloque ya fue corregido en código. Lo que queda pendiente ya no es fricción fuerte de uso, sino refinamiento visual global.

## Hallazgos iniciales ya corregidos

### 1. Dashboard de tienda

Archivo:

- `web/src/pages/store-admin/dashboard/dashboard-page.tsx`

Problema original:

- carga simple y fría
- sin jerarquía operativa
- sin entrada directa a acciones clave

Estado actual:

- hero operativo fuerte
- resumen visual de estado
- accesos rápidos a caja, bodega, despacho y cobranza
- carga con esqueletos visuales en vez de texto pobre

Resultado:

- la pantalla ya sirve como puerta de entrada real para operación

### 2. Cobranza en ruta

Archivo:

- `web/src/pages/store-admin/vendors/vendor-collections-page.tsx`

Problema original:

- tabla fría
- acción principal pequeña
- poca prioridad visual al monto y al siguiente paso

Estado actual:

- vista por tarjetas
- orden por saldo más alto
- búsqueda simple arriba
- modal de cobro directo con atajos de monto

Resultado:

- la pantalla ya acompaña mejor al usuario de calle y reduce lectura innecesaria

### 3. Venta rápida de vendedor

Archivo:

- `web/src/pages/store-admin/vendors/vendor-quick-sale-page.tsx`

Problema original:

- demasiada densidad visual
- cliente, productos y cierre compitiendo entre sí
- carrito demasiado tabular

Estado actual:

- encabezado operativo claro
- bloque de cliente separado y visible
- buscador y resultados con acción directa
- resumen de pedido más dominante
- cierre de venta más corto y evidente

Resultado:

- el flujo ya va más con el ritmo del vendedor y menos con una lógica de backoffice

### 4. Sidebar y navegación general

Archivos:

- `web/src/components/app-layout.tsx`
- `web/src/components/app-header.tsx`

Problema original:

- navegación plana con demasiadas entradas iguales
- mezcla de operación, compras, administración y soporte sin contexto

Estado actual:

- navegación agrupada por secciones
- mobile nav alineado con la misma estructura
- menor carga cognitiva para usuarios operativos

Resultado:

- ya no se siente como lista larga sin orden

## Lo mejor resuelto hoy

### Bodega

Archivo:

- `web/src/pages/store-admin/warehouse/warehouse-dashboard-page.tsx`

Sigue siendo la mejor referencia del producto para módulos operativos:

- columnas claras por estado
- acciones directas
- modal de picking entendible
- colores por etapa
- foco en tarea antes que en administración

### Módulos operativos ya alineados con esa dirección

- `dashboard-page`
- `vendor-collections-page`
- `vendor-quick-sale-page`

## Deuda visual menor que sí queda

### 1. Identidad visual global aún puede subir

Archivo base:

- `web/src/index.css`

Situación:

- los tokens y el look general están limpios
- pero todavía hay espacio para separar más fuerte comercial, bodega y ruta por atmósfera visual

Impacto:

- no bloquea operación
- sí podría mejorar percepción de producto y orientación por contexto

### 2. Conviene estandarizar headers operativos en más módulos

Situación:

- varios módulos fuertes ya tienen hero y lectura rápida
- todavía no todos usan exactamente el mismo patrón operativo

Impacto:

- no rompe UX
- pero la consistencia puede subir más

## Regla de diseño que queda fijada

Si una pantalla es para operación:

- una acción primaria dominante
- menos tabla, más tarjeta o fila operativa
- menos lectura, más decisión evidente
- menos menú, más contexto
- menos administración visual, más ritmo de trabajo
