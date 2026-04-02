# 13 - Mapa Real de React, Flutter y Uso de Radix

**Fecha:** 2026-04-01  
**Proyecto:** `pino`

## 1. Resumen corto

- `React web` sí existe como aplicación real y ya tiene bastante negocio implementado.
- `Flutter` sí existe como código real y ya cubre el alcance móvil actual.
- El frontend usa `Radix UI` porque fue montado con base `shadcn/ui`: Radix pone la lógica accesible de componentes y Tailwind define el look.

## 2. Estado real de React

### 2.1 Qué existe hoy

El frontend real está en [web/src](/opt/apps/pino/web/src) y tiene esta base:

- páginas totales: **50**
- páginas `master-admin`: **14**
- páginas `store-admin`: **34**
- páginas globales: **2**
  - `login-page.tsx`
  - `pos-page.tsx`

### 2.2 Módulos React ya presentes

#### Global

- login
- redirección inicial por rol

#### Master Admin

- dashboard
- tiendas
- cadenas
- usuarios
- licencias
- monitor
- configuración global
- zonas
- sub-zonas
- monitor de sync
- ayuda

#### Store Admin / Operación

- dashboard
- facturación / POS web
- caja
- productos
- departamentos
- sub-departamentos
- inventario movimientos
- inventario ajustes
- pedidos pendientes
- despacho
- torre de control
- ruta de entrega
- reportes
- configuración
- usuarios
- proveedores
- autorizaciones
- ayuda

#### Vendors / Ruta visto desde web

- lista de personal de ruta
- dashboard vendedor
- clientes
- cobros
- inventario vendedor
- venta rápida
- ventas
- rutas
- asignar ruta
- zonas

### 2.3 Qué ya quedó mejorado en esta tanda

- despliegue bajo `/dev/`
- API por entorno en `/api-dev`
- socket por entorno en `/api-dev/socket.io`
- normalización de roles para redirects y layout
- eliminación de dependencia muerta a `firebase` en impresión de ticket
- compatibilidad con `Vite 8 / Rolldown`
- eliminación de `xlsx` por seguridad
- importación masiva dejada solo en `CSV`

### 2.4 Qué sigue faltando en React

React ya no está verde, pero todavía no está cerrado al `100%`. Falta:

- validación manual de flujo real en navegador
- ajuste fino de UX después de esa primera pasada
- validación real del websocket
- algunas pantallas operativas que siguen en plan y no en código:
  - preparación de pedidos
  - alistamiento / requisa
  - estado consolidado de pedidos
  - cuentas por cobrar como módulo web dedicado
  - cuentas por pagar como módulo web dedicado
  - devoluciones de bodega como pantalla web dedicada

## 3. Estado real de Flutter

### 3.1 Qué existe hoy

En el repo actual sí existe una app Flutter real en [flutter](/opt/apps/pino/flutter) con:

- `pubspec.yaml`
- `lib/main.dart`
- `lib/app`
- `lib/core`
- `lib/features`
- sesión real y router
- preventa, catálogo, clientes, ruta, cobros, devoluciones y bodega

### 3.2 Qué significa eso

Flutter en este repo ya está en estado de **implementación operativa** dentro del alcance actual.

La referencia correcta ahora es:

- [00_INDEX.md](/opt/apps/pino/flutter/docs/00_INDEX.md)
- [02_MAPA_MODULOS_Y_FLUJOS.md](/opt/apps/pino/flutter/docs/02_MAPA_MODULOS_Y_FLUJOS.md)
- [03_MAPA_API_MOVIL.md](/opt/apps/pino/flutter/docs/03_MAPA_API_MOVIL.md)

### 3.3 Conclusión sobre Flutter

Hoy Flutter sí se puede analizar a nivel de código y ya forma parte de la fuente de verdad del proyecto para el frente móvil.

## 4. Por qué usa Radix

### 4.1 Evidencia en el repo

El frontend está armado con patrón `shadcn/ui` sobre `Radix`:

- [components.json](/opt/apps/pino/web/components.json) usa esquema `ui.shadcn.com`
- [package.json](/opt/apps/pino/web/package.json) declara múltiples paquetes `@radix-ui/react-*`
- [components/ui](/opt/apps/pino/web/src/components/ui) contiene wrappers reutilizables como:
  - `dialog.tsx`
  - `select.tsx`
  - `dropdown-menu.tsx`
  - `popover.tsx`
  - `tabs.tsx`
  - `tooltip.tsx`
  - `toast.tsx`
  - `accordion.tsx`

### 4.2 Qué aporta Radix aquí

Radix no es “el diseño visual” del sistema.  
Radix aporta la **lógica de interacción accesible**:

- manejo de foco
- navegación por teclado
- estados abiertos/cerrados
- roles y atributos ARIA
- comportamiento consistente en diálogos, menús, selects, tooltips, tabs y popovers

### 4.3 Qué pone el look real

El look real sale de la combinación:

- `Radix` para comportamiento
- `Tailwind CSS` para estilos
- `class-variance-authority` para variantes
- `lucide-react` para iconos
- componentes `ui/` como capa reusable del proyecto

O sea:

- `Radix` = comportamiento base
- `Tailwind` = apariencia
- `shadcn/ui` = forma práctica de organizarlos dentro del repo

### 4.4 Por qué tiene sentido en este proyecto

Para este tipo de sistema, Radix tiene sentido porque hay muchas piezas de UI que deben ser estables:

- POS con diálogos y flujos rápidos
- selects y filtros administrativos
- menús y navegación compleja
- tooltips, alerts, sheets, tabs
- componentes reutilizables entre admin, caja y ruta

Eso reduce trabajo de rehacer componentes complejos desde cero.

### 4.5 Costos y tradeoff

Usar Radix también tiene costo:

- más dependencias
- más wrappers internos
- algo más de peso mental al leer el árbol de UI

Pero en este proyecto el beneficio fue mayor que el costo, porque aceleró la base del panel administrativo y del POS.

## 5. Lectura final

- `React` ya es un producto real y sí vale la pena seguirlo endureciendo.
- `Flutter` ya es código real y ya tiene un alcance móvil operativo.
- `Radix` está aquí porque esta base fue levantada como stack `shadcn/ui + Tailwind + Radix`, que es una forma rápida y bastante sólida de construir un panel rico en componentes sin inventar toda la accesibilidad desde cero.
