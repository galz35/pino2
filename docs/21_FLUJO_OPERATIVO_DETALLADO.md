# 🔄 FLUJO OPERATIVO Y REGLAS DE NEGOCIO DETALLADAS
**Fecha:** 10 de Abril, 2026  

---

## FLUJO 1: PREVENTA → ENTREGA → COBRO

```
                      ┌─────────────────────────────────────────────────┐
                      │            CICLO COMPLETO DEL PEDIDO            │
                      └─────────────────────────────────────────────────┘

  👤 VENDEDOR                  👨‍💼 GESTOR                    🚛 RUTERO
  ─────────                    ────────                      ────────
  1. Visita al cliente         4. Ve pedido pendiente        8. Ve pedido asignado
  2. Registra pedido           5. Selecciona rutero          9. Entrega al cliente
  3. Elige Contado/Crédito     6. Asigna ruta              10. Marca "Entregado"
                               7. Supervisa cobranza        11. Cobra (si aplica)

  ┌───────────┐   auto    ┌──────────────┐  manual   ┌─────────────┐
  │  orders   │ ────────▶ │  pending_    │ ────────▶ │  pending_   │
  │  (tabla)  │           │  deliveries  │           │  deliveries │
  │           │           │  status:     │           │  status:    │
  │  status:  │           │  "Pendiente" │           │  "Entregado"│
  │  PENDING  │           │  rutero: NULL│           │  rutero: ID │
  └───────────┘           └──────────────┘           └─────────────┘
```

### Paso a paso con tablas afectadas:

| Paso | Acción | Quién | Endpoint | Tablas Afectadas |
|---|---|---|---|---|
| 1 | Vendedor crea pedido | Vendedor | `POST /orders` | `orders`, `order_items` |
| 2 | Sistema crea entrega pendiente | Auto | (dentro del POST) | `pending_deliveries` |
| 3 | Si es crédito, crea cuenta | Auto | (dentro del POST) | `accounts_receivable` |
| 4 | Gestor ve pedidos sin asignar | Gestor | `GET /pending-deliveries?unassigned=true` | — |
| 5 | Gestor asigna rutero | Gestor | `POST /pending-deliveries/assign-route` | `pending_deliveries` |
| 6 | Rutero ve sus entregas | Rutero | `GET /pending-deliveries?ruteroId=X` | — |
| 7 | Rutero entrega | Rutero | `PATCH /pending-deliveries/:id` | `pending_deliveries` |
| 8 | Si es crédito, Rutero cobra | Rutero/Gestor | `POST /accounts-receivable/:id/payments` | `account_payments`, `accounts_receivable` |

---

## FLUJO 2: VENTA DIRECTA (VENDEDOR CON MERCANCÍA)

```
  👨‍💼 GESTOR asigna inventario → 👤 VENDEDOR vende directamente → 📦 Stock baja

  ┌──────────────────┐    ┌───────────────────┐    ┌──────────────┐
  │ vendor_inventories│    │    orders          │    │ vendor_      │
  │ assigned: +50     │───▶│    type:           │───▶│ inventories  │
  │ current: 50       │    │    "venta_directa" │    │ current: 40  │
  └──────────────────┘    └───────────────────┘    └──────────────┘
```

| Paso | Acción | Quién | Endpoint | Tablas |
|---|---|---|---|---|
| 1 | Asignar inventario al vendedor | Gestor | `POST /vendor-inventories/transaction` (type: assign) | `vendor_inventories`, `products` (stock baja), `movements` |
| 2 | Vendedor hace venta al contado | Vendedor | `POST /orders` (type: venta_directa) | `orders`, `order_items`, `pending_deliveries` |
| 3 | Vendedor devuelve lo no vendido | Vendedor | `POST /returns` (ruteroId: vendorId) | `returns`, `return_items`, `vendor_inventories`, `products` (stock sube), `movements` |

---

## FLUJO 3: BODEGA → DESPACHO → CAMIÓN

```
  🏭 BODEGUERO prepara pedido → 📦 Alista → 🚛 Carga al camión

  Estado del pedido:
  RECIBIDO → EN_PREPARACION → ALISTADO → CARGADO_CAMION → EN_ENTREGA → ENTREGADO

  Al cambiar a CARGADO_CAMION:
  ┌──────────┐                     ┌──────────────────┐
  │ products │  stock: -10         │ vendor_inventories│
  │ current: │ ──────────────────▶ │ current: +10     │
  │   90     │                     │ (del rutero)     │
  └──────────┘                     └──────────────────┘
  + Kardex: movements (OUT, ref: "Despacho pedido #xxx")
```

---

## FLUJO 4: DEVOLUCIÓN

```
  🚛 RUTERO devuelve mercancía → 🏭 BODEGA recibe de vuelta

  ┌──────────────────┐    ┌──────────┐    ┌──────────┐
  │ vendor_inventories│    │ returns  │    │ products │
  │ current: -5       │───▶│ total: X │───▶│ stock: +5│
  └──────────────────┘    └──────────┘    └──────────┘
  + Kardex: movements (IN, ref: "Devolución #xxx")
```

| Paso | Acción | Quién | Endpoint | Tablas |
|---|---|---|---|---|
| 1 | Registrar devolución | Rutero/Vendedor | `POST /returns` | `returns`, `return_items` |
| 2 | Descontar del inventario del vendedor | Auto | (transacción) | `vendor_inventories` |
| 3 | Regresar stock a bodega | Auto | (transacción) | `products` |
| 4 | Registrar en Kardex | Auto | (transacción) | `movements` (tipo IN) |

---

## FLUJO 5: COBRANZA

```
  Pedido a Crédito → accounts_receivable (nace automáticamente)
                         ↓
  Rutero/Gestor cobra → account_payments (abono parcial o total)
                         ↓
  Saldo restante → accounts_receivable.remaining_amount - pago
                         ↓
  Si remaining = 0 → status = 'PAID'
```

---

## FLUJO 6: FACTURACIÓN DE PROVEEDOR

```
  Proveedor entrega mercancía
         ↓
  Admin registra factura → invoices + invoice_items
         ↓
  Si pago al crédito → accounts_payable (nace automáticamente)
         ↓
  Admin paga → payable_payments (abono parcial o total)
         ↓
  Mercadería entra a stock → movements (IN) + products.current_stock++
```

---

## §19 — REGLAS DE NEGOCIO Y ESTÁNDARES (POST-MVP)

Dado que la especificación inicial carecía de profundidad operativa en ciertos módulos, el sistema ha sido arquitectado siguiendo estos estándares lógicos para cerrar las brechas (Fase 4.3):

### 19.3 Cierre de Caja
- **Estructura implementada:** El cierre de caja es descentralizado y específico por "agente" (Vendedor o Rutero), no por entidad única de empresa.
- **Acumuladores:** Captura tres orígenes de fondos: (a) Ventas de contado del día, (b) Cobros de cartera atrasada/créditos, (c) Resta devoluciones en efectivo o descuentos.
- **Cuadre:** Todo el efectivo en la billetera virtual del agente debe coincidir exactamente con el "entregado" a tesorería.

### 19.4 Devoluciones
- **Manejo contable (Stock):** La devolución (ya sea de cliente por mal estado, o sobre-stock del rutero) siempre **alimenta primero la bodega secundaria/general** mediante un movimiento tipo `IN`. Nunca extingue la existencia de la red hasta que se emite una "Merma" administrativa.
- **Responsabilidad:** La devolución libera la carga nominal del inventario asignado al rutero (`vendor_inventories`).

### 19.5 Rutas Avanzadas
- **Definición implícita:** La ruta no es un polígono geográfico rígido; se maneja por "días de visita" a "clientes". El rutero no despacha "zonas", despacha "bultos atados a un pedido". Su flujo depende de la hoja de ruta dinámica generada cada mañana por el Gestor.

### 19.6 Facturas (Fiscales vs Internas)
- **Alcance MVP:** Todos los comprobantes del entorno móvil son "vouchers" tipo *Comprobante de Venta* interno no-fiscal (Tickets `T-XXX`).
- **Legalidad:** Carecen de valor tributario y operan solo como pagaré y nota de entrega. Si el cliente exige factura final avalada por el DGI, esta se genera post-facto y en lote en el dashboard web. 

### 19.7 Cuentas por Cobrar
- **Nacimiento de Obligación:** La deuda en `accounts_receivable` nace en el t=preciso en que el pedido con pago `CREDITO` se marca en la web/móvil al crear el pedido.
- **Condición material:** Aunque la deuda nace en papel desde el click, el ciclo no exige al rutero cobrar sino hasta el próximo ciclo de visita indicado en la ruta.

### 19.10 Offline - Sincronización Diferida (Flutter)
- **Tolerancia:** Todo el pedido/cobro generado sin internet cae en una base local Hive (`SyncQueueEntry`). 
- **Resolución de conflictos:** La estrategia actual es LWW (Last Writer Wins), dado el bajo riesgo de colisión por mismo documento. Un pedido local retendrá fecha original, pero el servidor asignará ID global al procesar. El usuario no recibe confirmación visual dorada hasta que aparezca "enviado a la nube".
