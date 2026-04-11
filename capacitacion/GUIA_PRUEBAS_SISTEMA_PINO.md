# Guía de Pruebas: Sistema Los Pinos Logistics & POS

Esta guía detalla los pasos exactos que cada usuario debe realizar para validar que el sistema esté operando al 100%, incluyendo las mejoras recientes en sincronización móvil, importación/exportación de Excel y finanzas.

---

## 1. Perfil: Administrador de Cadena (Chain Admin)
**Objetivo:** Validar la visibilidad corporativa multi-tienda.

1.  **Dashboard Corporativo:**
    *   Ingresar al sistema y verificar que es redirigido a `/chain-admin/dashboard`.
    *   Confirmar que aparecen las métricas de **todas las tiendas** asignadas a su cadena.
    *   Verificar que la lista de sucursales muestra el estado (Activa/Inactiva) y el personal total.

## 2. Perfil: Administrador de Tienda (Store Admin)
**Objetivo:** Control operativo, inventario y finanzas.

1.  **Importación/Exportación Excel (NUEVO):**
    *   Ir a **Productos**.
    *   Hacer clic en **Exportar Excel**. Validar que se descarga el archivo `productos.xlsx`.
    *   Abrir el archivo, cambiar el precio o stock de un producto y guardar.
    *   En el sistema, usar el botón **Importar**, subir el archivo y confirmar cambios.
2.  **Cuentas por Pagar (CxP):**
    *   Ir al módulo **Finanzas** -> **Cuentas por Pagar**.
    *   Verificar facturas pendientes y **Registrar Pago** (Efectivo/Transferencia).
    *   Confirmar actualización de saldo en tiempo real.

## 3. Perfil: Cajero (Cashier)
**Objetivo:** Facturación rápida y control de flujo de efectivo.

1.  **Punto de Venta (POS):**
    *   Realizar ventas buscando por nombre o escáner.
    *   Procesar cobros mixtos (Efectivo + Transferencia).
    *   Realizar el **Cierre de Caja** y verificar el arqueo.

## 4. Perfil: Vendedor / Preventa (Mobile App)
**Objetivo:** Captura de pedidos en calle (Online/Offline).

1.  **Prueba Offline (CRÍTICO):**
    *   Poner el teléfono en **Modo Avión**.
    *   Crear un pedido. Ver que se guarda en "Cola offline".
    *   Quitar Modo Avión y presionar **Sincronizar ahora**.
2.  **Gestión de Conflictos:**
    *   Si un pedido falla, usar el botón **Descartar** en la lista de operaciones locales para limpiar la cola.

## 5. Perfil: Rutero / Entregador (Mobile App)
**Objetivo:** Despacho y cobro final.

1.  **Entrega y Cobro:**
    *   Entrar a **Ruta y Entrega**.
    *   Marcar entregado y registrar el cobro en el sitio.
    *   Verificar sincronización con la Factura en el Panel Web.

---
**Nota:** Utilizar datos de prueba como "Sucursal Centro" y productos de prueba para no afectar indicadores reales.
