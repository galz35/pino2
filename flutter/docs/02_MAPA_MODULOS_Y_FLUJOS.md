# Mapa de Modulos y Flujos Moviles

Fecha de corte: 2026-04-02

## 1. Objetivo del móvil

La app Flutter actual está pensada para operación rápida:

- vendedor en calle
- rutero en movimiento
- bodega bajo presión
- personal no técnico

La regla es simple:

- tocar
- resolver
- seguir trabajando

## 2. Estructura activa

### App

- `lib/app/app.dart`
- `lib/app/router/app_router.dart`
- `lib/app/theme/app_theme.dart`

### Core

- `lib/core/config`
- `lib/core/network`
- `lib/core/storage`
- `lib/core/database`
- `lib/core/realtime`
- `lib/core/utils`

### Features

- `auth`
  - login, perfil y sesión
- `home`
  - selector de tienda y accesos rápidos por rol
- `catalog`
  - catálogo operativo con stock y presentación
- `clients`
  - cartera móvil de clientes
- `orders`
  - preventa rápida en una sola pantalla
- `deliveries`
  - ruta y entregas
- `collections`
  - cobranza rápida desde cartera pendiente
- `returns`
  - devolución por ticket
- `warehouse`
  - flujo de bodega: recibido → preparación → alistado → cargado
- `documents`
  - servicio PDF liviano para comprobante opcional
- `startup`
  - splash y bootstrap

## 3. Flujos principales por rol

### Vendedor / Gestor de ventas

1. entra
2. selecciona tienda
3. abre `Preventa`
4. elige cliente
5. busca producto
6. ajusta cantidades
7. guarda pedido

Apoyo:

- clientes
- catálogo
- devoluciones rápidas
- comprobante PDF opcional después de guardar
- si falla la red al guardar, el pedido entra a cola local
- cuando vuelve la red, la cola intenta sincronizarse automáticamente

### Rutero

1. entra
2. abre `Ruta y entrega`
3. ve paradas y pedidos pendientes
4. salta a `Cobros` si el cliente paga
5. salta a `Devoluciones` si regresa producto

Apoyo:

- clientes
- si falla la red al cobrar, el cobro entra a cola local
- cuando vuelve la red, la cola intenta sincronizarse automáticamente

### Inventario / Bodega

1. entra
2. abre `Bodega`
3. ve pedidos por estado
4. mueve pedido con un toque por cada transición
5. al cargar camión selecciona responsable

Apoyo:

- catálogo
- ruta y entregas

### Store Admin / Master

Tiene acceso rápido a:

- preventa
- bodega
- cobros
- clientes
- ruta
- catálogo

## 4. Reglas UX aplicadas

- una acción primaria clara por rol
- evitar navegar por menús profundos
- usar tarjetas operativas y botones grandes
- reducir escritura manual cuando ya hay datos en backend
- usar `bottom sheets` para acciones cortas y confirmaciones
- el PDF no debe ser paso obligatorio del flujo
- si se usa PDF, debe compartirse sin preview pesado dentro de la app
- si la red cae en captura crítica, la app debe preferir cola local antes que perder el trabajo
- si la app abre sin red pero hay sesión válida cacheada, debe dejar entrar y seguir operando dentro del alcance disponible

## 5. Qué no entra en este alcance

- sync offline completo
- impresoras físicas
- escáner industrial
- flujos especializados por hardware
