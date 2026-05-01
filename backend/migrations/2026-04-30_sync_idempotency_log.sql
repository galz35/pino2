-- Migración: Crear tabla sync_idempotency_log
-- Fecha: 2026-04-30
-- Problema: El código usa esta tabla en sales, orders, collections, returns y sync
--           pero nunca se creó formalmente con DDL.

CREATE TABLE IF NOT EXISTS sync_idempotency_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  external_id UUID NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Constraint único: evita duplicados por tienda + external_id + entity_type
ALTER TABLE sync_idempotency_log
  DROP CONSTRAINT IF EXISTS uq_sync_idempotency_store_ext_entity;
ALTER TABLE sync_idempotency_log
  ADD CONSTRAINT uq_sync_idempotency_store_ext_entity
  UNIQUE (store_id, external_id, entity_type);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_sync_idempotency_store
  ON sync_idempotency_log(store_id);

CREATE INDEX IF NOT EXISTS idx_sync_idempotency_created
  ON sync_idempotency_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sync_idempotency_entity_type
  ON sync_idempotency_log(entity_type);
