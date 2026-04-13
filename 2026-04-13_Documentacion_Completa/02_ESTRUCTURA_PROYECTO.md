# 🏗️ ESTRUCTURA DEL PROYECTO
### Sistema MultiTienda Los Pinos · 13 abril 2026

---

## Árbol de Directorios Principal

```
sistema_final/
├── backend/                    # API NestJS + Fastify (Puerto 3010)
│   ├── src/
│   │   ├── app.module.ts       # Raíz de módulos (31 imports)
│   │   ├── main.ts             # Bootstrap del servidor
│   │   ├── common/             # EventsModule (Socket.IO)
│   │   ├── database/
│   │   │   ├── database.module.ts   # Pool PostgreSQL
│   │   │   └── database.service.ts  # Query + Transacciones + Slow Query Audit
│   │   └── modules/
│   │       ├── accounts-payable/    # Cuentas por pagar
│   │       ├── accounts-receivable/ # Cuentas por cobrar
│   │       ├── auth/               # Login, JWT, Refresh Token
│   │       ├── authorizations/     # Autorizaciones de precios
│   │       ├── cash-shifts/        # Turnos de caja
│   │       ├── chains/             # Cadenas de tiendas
│   │       ├── clients/            # Clientes
│   │       ├── collections/        # Cobros
│   │       ├── config/             # Configuración global
│   │       ├── daily-closings/     # Cierres de caja rutero
│   │       ├── departments/        # Departamentos/categorías
│   │       ├── errors/             # Registro de errores
│   │       ├── inventory/          # Movimientos, ajustes, entrada
│   │       ├── invoices/           # Facturas proveedor
│   │       ├── licenses/           # Licencias de tienda
│   │       ├── notifications/      # Push notifications (Firebase)
│   │       ├── orders/             # Pedidos
│   │       ├── pending-deliveries/ # Entregas pendientes
│   │       ├── pending-orders/     # Comandas
│   │       ├── products/           # Catálogo de productos
│   │       ├── returns/            # Devoluciones
│   │       ├── routes/             # Rutas de venta
│   │       ├── sales/              # Ventas POS
│   │       ├── store-zones/        # Sub-zonas por tienda
│   │       ├── stores/             # CRUD tiendas
│   │       ├── suppliers/          # Proveedores
│   │       ├── sync/               # Sincronización offline
│   │       ├── users/              # Usuarios y roles
│   │       ├── vendor-inventories/ # Inventario del vendedor/rutero
│   │       ├── visit-logs/         # Registro de visitas
│   │       └── zones/              # Zonas globales
│   ├── test/                   # Tests e2e
│   ├── .env                    # Variables de entorno
│   ├── package.json
│   └── tsconfig.json
│
├── web/                        # Frontend React + Vite (Puerto 5173)
│   ├── src/
│   │   ├── App.tsx             # Router principal (50+ rutas)
│   │   ├── main.tsx            # Entry point
│   │   ├── components/
│   │   │   ├── app-layout.tsx  # Layout con sidebar y nav por rol
│   │   │   ├── app-header.tsx  # Header con notificaciones
│   │   │   ├── ui/             # Componentes shadcn/ui
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   ├── auth-context.tsx  # Autenticación global
│   │   │   └── pos-context.tsx   # Contexto de punto de venta
│   │   ├── hooks/
│   │   │   └── use-real-time-events.ts  # Socket.IO hook
│   │   ├── lib/
│   │   │   ├── runtime-config.ts  # API_BASE_URL, SOCKET_URL
│   │   │   ├── utils.ts
│   │   │   ├── user-role.ts       # Normalización de roles
│   │   │   ├── redirect-logic.ts  # Redirección post-login
│   │   │   ├── export-excel.ts    # Exportar a Excel
│   │   │   └── swalert.ts         # SweetAlert wrapper
│   │   ├── pages/
│   │   │   ├── login-page.tsx
│   │   │   ├── pos-page.tsx
│   │   │   ├── master-admin/      # 15 páginas maestras
│   │   │   ├── chain-admin/       # Dashboard cadena
│   │   │   └── store-admin/       # 18 carpetas de módulos
│   │   │       ├── billing/       # Facturación POS
│   │   │       ├── cash-register/ # Turnos de caja
│   │   │       ├── dashboard/     # Panel de control
│   │   │       ├── finance/       # CxC, CxP, Aging
│   │   │       ├── inventory/     # Movimientos, ajustes, entrada
│   │   │       ├── products/      # Catálogo + departamentos
│   │   │       ├── vendors/       # Vendedores, rutas, cobros
│   │   │       ├── warehouse/     # Dashboard bodega
│   │   │       ├── dispatcher/    # Despacho
│   │   │       ├── pending-orders/ # Comandas
│   │   │       ├── reports/       # Reportes
│   │   │       ├── suppliers/     # Proveedores
│   │   │       ├── users/         # Gestión de empleados
│   │   │       └── ...
│   │   ├── services/
│   │   │   ├── api-client.ts      # Axios con cache + JWT auto
│   │   │   └── finance-service.ts # Servicio financiero
│   │   └── types/                 # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
│
├── flutter/                    # App Móvil (Android/iOS)
│   ├── lib/
│   │   ├── main.dart           # Entry point
│   │   ├── app/
│   │   │   └── app.dart        # MaterialApp + GoRouter
│   │   ├── core/
│   │   │   ├── config/
│   │   │   │   └── app_config.dart  # API URLs
│   │   │   ├── database/       # Drift (SQLite offline)
│   │   │   ├── documents/      # Generación de PDFs
│   │   │   ├── network/
│   │   │   │   └── api_client.dart  # Dio HTTP client
│   │   │   ├── realtime/       # Socket.IO client
│   │   │   ├── services/
│   │   │   │   └── push_notification_service.dart
│   │   │   ├── storage/        # Secure storage
│   │   │   └── utils/
│   │   └── features/
│   │       ├── auth/           # Login + sesión
│   │       ├── catalog/        # Catálogo de productos
│   │       ├── clients/        # Cartera de clientes
│   │       ├── collections/    # Cobros
│   │       ├── daily_closing/  # Cierre de caja
│   │       ├── deliveries/     # Entregas (ruta)
│   │       ├── home/           # Dashboard
│   │       ├── orders/         # Pedidos
│   │       ├── returns/        # Devoluciones
│   │       ├── sales_history/  # Historial
│   │       ├── startup/        # Splash
│   │       ├── vendor_inventory/ # Stock del vendedor
│   │       └── warehouse/      # Bodega
│   ├── pubspec.yaml
│   └── analysis_options.yaml
│
├── capacitacion/               # Manuales de capacitación
├── docs/                       # Documentación técnica
├── plan/                       # Plan y requerimientos originales
├── tests/                      # Tests de integración
├── usuarios/                   # Info de usuarios
└── 2026-04-13_Documentacion_Completa/  # ← ESTA CARPETA
```

---

## Patrón Arquitectónico

### Backend (Cada módulo sigue):
```
modules/[nombre]/
├── [nombre].module.ts       # Declaración NestJS
├── [nombre].controller.ts   # Endpoints REST
├── [nombre].service.ts      # Lógica de negocio
└── dto/                     # Data Transfer Objects
```

### Flutter (Cada feature sigue):
```
features/[nombre]/
├── data/
│   └── [nombre]_repository.dart   # Acceso a API
├── domain/
│   └── models/                    # Modelos de dominio
└── presentation/
    ├── controllers/               # Riverpod controllers
    └── screens/                   # Pantallas UI
```
