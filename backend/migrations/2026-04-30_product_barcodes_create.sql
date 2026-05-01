-- Migración: Crear tabla product_barcodes
-- Fecha: 2026-04-30
-- Problema: La migración 2026-04-21_barcode_refactor.sql hace INSERT e INDEX
--           sobre product_barcodes pero nunca la crea. En base nueva falla.
-- NOTA: Esta migración debe correr ANTES de 2026-04-21_barcode_refactor.sql

CREATE TABLE IF NOT EXISTS product_barcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  barcode VARCHAR(100) NOT NULL,
  label VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice único: un barcode por tienda
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_barcodes_unique_code
  ON product_barcodes(barcode, store_id);

-- Índice de búsqueda por barcode
CREATE INDEX IF NOT EXISTS idx_product_barcodes_barcode_lookup
  ON product_barcodes(barcode);

-- Índice por producto
CREATE INDEX IF NOT EXISTS idx_product_barcodes_product
  ON product_barcodes(product_id);
