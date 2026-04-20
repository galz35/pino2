-- ============================================================
-- MIGRACIÓN: Sistema de Distribución Los Pinos
-- Fecha: 2026-04-20
-- Ejecutar: psql -h 190.56.16.85 -U alacaja -d multitienda_db -f migrations/2026-04-20_distribucion.sql
-- ============================================================

BEGIN;

-- 1. Extensión PostGIS (si disponible, no bloqueante)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Tabla: grupos_economicos
CREATE TABLE IF NOT EXISTS grupos_economicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id),
  nombre VARCHAR(200) NOT NULL,
  limite_credito_global NUMERIC(12,2) DEFAULT 0,
  notas TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabla: grupos_clientes (agrupación de ruta, etiqueta libre)
CREATE TABLE IF NOT EXISTS grupos_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id),
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  color VARCHAR(20) DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Columnas nuevas en clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS grupo_economico_id UUID REFERENCES grupos_economicos(id);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS grupo_cliente_id UUID REFERENCES grupos_clientes(id);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS preventa_id UUID REFERENCES users(id);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS zona VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS limite_credito NUMERIC(12,2) DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS saldo_pendiente NUMERIC(12,2) DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS dias_credito INT DEFAULT 8;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS frecuencia_visita VARCHAR(50) DEFAULT 'semanal';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS dia_visita VARCHAR(20);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notas_entrega TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lat NUMERIC(10,7);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lng NUMERIC(10,7);

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_grupo_eco ON clients(grupo_economico_id);
CREATE INDEX IF NOT EXISTS idx_clients_grupo_cli ON clients(grupo_cliente_id);
CREATE INDEX IF NOT EXISTS idx_clients_preventa ON clients(preventa_id);

-- 5. Columnas nuevas en orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tipo_pedido VARCHAR(30) DEFAULT 'VENTA_ESTANDAR';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS requiere_cobro BOOLEAN DEFAULT true;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS requiere_autorizacion BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS autorizado_por UUID REFERENCES users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fecha_autorizacion TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rutero_id UUID REFERENCES users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS camion_id VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fecha_entrega_programada DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS grupo_carga_id UUID;

CREATE INDEX IF NOT EXISTS idx_orders_auth_pending ON orders(requiere_autorizacion) WHERE requiere_autorizacion = true;
CREATE INDEX IF NOT EXISTS idx_orders_rutero ON orders(rutero_id);
CREATE INDEX IF NOT EXISTS idx_orders_tipo ON orders(tipo_pedido);
CREATE INDEX IF NOT EXISTS idx_orders_carga ON orders(grupo_carga_id);

-- 6. Permisos RBAC en users
ALTER TABLE users ADD COLUMN IF NOT EXISTS permisos JSONB DEFAULT '[]'::JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS comision_porcentaje NUMERIC(5,2) DEFAULT 0;

-- 7. Tabla: arqueos
CREATE TABLE IF NOT EXISTS arqueos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id),
  rutero_id UUID NOT NULL REFERENCES users(id),
  realizado_por UUID NOT NULL REFERENCES users(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  efectivo_declarado NUMERIC(12,2) NOT NULL DEFAULT 0,
  efectivo_contado NUMERIC(12,2) NOT NULL DEFAULT 0,
  diferencia NUMERIC(12,2) DEFAULT 0,
  cheques NUMERIC(12,2) DEFAULT 0,
  depositos NUMERIC(12,2) DEFAULT 0,
  notas TEXT,
  status VARCHAR(20) DEFAULT 'PENDIENTE',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Tabla: liquidaciones_ruta
CREATE TABLE IF NOT EXISTS liquidaciones_ruta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id),
  rutero_id UUID NOT NULL REFERENCES users(id),
  fecha_ruta DATE NOT NULL,
  total_pedidos INT DEFAULT 0,
  total_entregados INT DEFAULT 0,
  total_rechazados INT DEFAULT 0,
  total_cobrado_contado NUMERIC(12,2) DEFAULT 0,
  total_cobrado_credito NUMERIC(12,2) DEFAULT 0,
  total_devoluciones NUMERIC(12,2) DEFAULT 0,
  efectivo_esperado NUMERIC(12,2) DEFAULT 0,
  efectivo_entregado NUMERIC(12,2) DEFAULT 0,
  diferencia NUMERIC(12,2) DEFAULT 0,
  arqueo_id UUID REFERENCES arqueos(id),
  status VARCHAR(20) DEFAULT 'PENDIENTE',
  liquidado_por UUID REFERENCES users(id),
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Tabla: cargas_camion
CREATE TABLE IF NOT EXISTS cargas_camion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id),
  rutero_id UUID NOT NULL REFERENCES users(id),
  camion_placa VARCHAR(20),
  fecha_carga DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_salida TIMESTAMP,
  status VARCHAR(20) DEFAULT 'ALISTANDO',
  total_pedidos INT DEFAULT 0,
  total_bultos INT DEFAULT 0,
  total_unidades_sueltas INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. Tabla: historial_asignacion_clientes
CREATE TABLE IF NOT EXISTS historial_asignacion_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  preventa_anterior_id UUID REFERENCES users(id),
  preventa_nuevo_id UUID REFERENCES users(id),
  motivo TEXT,
  realizado_por UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

COMMIT;
