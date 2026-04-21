-- ============================================================
-- MIGRACIÓN: Reestructuración de Códigos de Barras (SKU)
-- Fecha: 2026-04-21
-- Objetivo: product_barcodes es la ÚNICA fuente de verdad.
--           products.barcode queda como campo legacy de solo lectura.
-- Ejecutar: psql -h HOST -U USER -d multitienda_db -f migrations/2026-04-21_barcode_refactor.sql
-- ============================================================

BEGIN;

-- 1. Garantizar que TODOS los productos con barcode principal
--    tengan su registro en product_barcodes.
--    Esto copia los que faltan sin duplicar los que ya existen.
INSERT INTO product_barcodes (product_id, store_id, barcode, label, is_primary)
SELECT id, store_id, barcode, 'Código Principal', true
FROM products
WHERE barcode IS NOT NULL
  AND barcode != ''
  AND is_active = true
ON CONFLICT (barcode, store_id) DO UPDATE
  SET is_primary = true,
      label = COALESCE(EXCLUDED.label, product_barcodes.label);

-- 2. Crear índice único compuesto si no existe
--    Esto garantiza que un mismo código no se repita dentro de una tienda.
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_barcodes_unique_code
  ON product_barcodes(barcode, store_id);

-- 3. Crear índice B-Tree optimizado para búsqueda por escaneo
--    El escáner envía SOLO el barcode, este índice lo resuelve en <1ms.
CREATE INDEX IF NOT EXISTS idx_product_barcodes_barcode_lookup
  ON product_barcodes(barcode);

-- 4. Crear índice para resolver rápido "todos los códigos de un producto"
CREATE INDEX IF NOT EXISTS idx_product_barcodes_product
  ON product_barcodes(product_id);

-- 5. Verificación: Mostrar cuántos códigos se migraron
DO $$
DECLARE
  total_codes INTEGER;
  total_products_with_code INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_codes FROM product_barcodes;
  SELECT COUNT(*) INTO total_products_with_code
    FROM products WHERE barcode IS NOT NULL AND barcode != '';

  RAISE NOTICE '=== MIGRACIÓN COMPLETADA ===';
  RAISE NOTICE 'Total códigos en product_barcodes: %', total_codes;
  RAISE NOTICE 'Total productos con barcode legacy: %', total_products_with_code;
  RAISE NOTICE 'Ahora product_barcodes es la fuente de verdad.';
END $$;

COMMIT;
