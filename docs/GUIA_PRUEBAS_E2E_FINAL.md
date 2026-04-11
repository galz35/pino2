# 🧪 Guía Rápida de Pruebas End-to-End (E2E) - Los Pinos

Esta guía está diseñada para validar el ciclo de vida completo del negocio, asegurando que los módulos de **Inventario**, **Facturación (Caja)** y **Rutas Móviles (Ventas)** trabajen en perfecta armonía.

---

## 👥 Credenciales Sugeridas
*(Asumiendo contraseñas estándar `123456` para todas. Puedes ajustar en DB según necesites).*
- **Administrador**: `admin_test@lospinos.com` (Control Total)
- **Cajero**: `cajero_test@lospinos.com` (Apertura/Cierre y Ventas)
- **Bodegueros**: Pueden usar las credenciales de bodegueros asignados o directamente el Administrador.

---

## 🚀 FASE 1: Bodega y Trazabilidad (Admin / Bodeguero)
**Objetivo**: Abastecer la tienda inicial, registrar variaciones y realizar un traslado perfecto.
**Perfil**: `admin_test@lospinos.com`

1. **Ingreso Directo (Entrada Rápida)**
   - Ve a **"Entrada Inventario"**.
   - Selecciona un producto cualquiera (ej. *Caja de Leche*). Verifica su stock actual.
   - En la pestaña **Entrada 📦**, regístrale "50" unidades.
   - **Validación:** El stock debe subir inmediatamente y aparecer en el Kardex ("Movimientos").

2. **Merma y Ajuste**
   - Con el mismo producto, ve a la pestaña **Merma 🗑️**.
   - Ingresa una cantidad corta (ej. "2") y pon la razón *"Caja dañada"*.
   - Ve a la pestaña **Ajuste 🔧**. Suma o resta "5" unidades.
   - **Validación:** Tu stock debe verse actualizado `(Stock Inicial + 50 - 2 ± 5)`. 
   - Abre **"Movimientos (Kardex)"** desde el menú izquierdo. Verifica que los badges (Rojo, Verde, Naranja) reflejen correctamente estas acciones operativas.

3. **Traslado Multitienda (La prueba de fuego)**
   - Vuelve a **Entrada Inventario**. Ve a **Traslado 🔄**.
   - Selecciona **Tienda Origen** = Tu Tienda (Central) y **Tienda Destino** = Tienda Norte (o Sur).
   - Traslada "10" unidades.
   - **Validación Mágica:** Abre una pestaña de incógnito, inicia sesión o cambia temporalmente a la Tienda Destino y busca ese mismo producto. *¡El código y TODO su esquema de precios debió ser copiado exacto con stock de 10!*

---

## 🛒 FASE 2: Punto de Venta Local (El Cajero)
**Objetivo**: Vender un producto desde piso, golpear la caja chica y deducir inventario en tiempo real.
**Perfil**: `cajero_test@lospinos.com` (Logueado en la Tienda Destino donde enviaste el stock).

1. **Apertura de Caja**
   - Ve a **"Control de Caja"**.
   - Haz click en "Abrir Caja" con $100 de fondo base operativo.

2. **Ejecutar Venta**
   - Ve a **"Facturación de Caja"** (POS).
   - Busca el producto que enviaste en la Fase 1. (El buscador debe encontrarlo).
   - Selecciónalo, debe traer consigo tu *price1/sale_price* copiado de la base de datos automáticamente.
   - Cobra la venta usando "Efectivo" con el denominativo exacto.

3. **Cierre y Verificación Kardex**
   - Ve al **Kardex** de esa tienda y busca el producto.
   - **Validación:** Debe aparecer un registro nuevo tipo `SALIDA` con la cantidad exacta, referenciando un **Venta Ticket: T-xxx**.
   - Vuelve a **Control de Caja** y ejecuta el "Cierre". Todo el monto físico vendido debe verse reflejado matemáticamente.

---

## 🚚 FASE 3: Ruta Desconectada (Integración Flutter)
**Objetivo**: Simulador logístico. Enviar y vender este mismo stock por un agente móvil, usando la API.
**Perfil Móvil**: Aplicación Flutter (`rutero_norte@lospinos.com` conectado al Local IP / Evolution).

1. **Sincronización (Mañana del Rutero)**
   - En la APP (*QuickOrderScreen*), asegúrate que el Rutero hace el Pull de Productos y Clientes.
   - **Validación:** El producto recién insertado/trasladado DEBE descargar localmente al Sqlite del dispositivo.

2. **Venta Offline**
   - Activa Modo Avión o apaga el Wifi en el Emulador/Teléfono.
   - Arma una orden offline (`CREATE ORDER`). Agrega productos, sella el pedido.

3. **Impacto Sistémico**
   - Quita el Modo Avión. El sistema detecta la red e impulsa la Venta a la Base Central (`SYNC`).
   - Usa tu sesión de `Admin` en la Web.
   - Ve a **"Gestión de Rutas/Ventas"**
   - **Validación Final:** Esa venta móvil debe de haber entrado al panel web y deducido nuevamente del Kardex del producto en la Tienda Central sin descuadrar.

---
🚀 **¿Por qué esta secuencia?** 
Esta prueba recorre los 3 pilares del negocio completo: la bodega alimentando a una sucursal, la sucursal operando de forma autónoma sin red nacional y el Rutero moviendo un inventario perimetral en tiempo real al conectarse. Si pasa esta prueba, **El Sistema es Production-Ready.**
