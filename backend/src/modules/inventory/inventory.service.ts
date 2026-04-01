import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EventsGateway } from '../../common/gateways/events.gateway';

@Injectable()
export class InventoryService {
  constructor(
    private readonly db: DatabaseService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  private parseInteger(value: unknown, fieldName: string): number {
    const parsed =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number.parseFloat(value)
          : Number.NaN;

    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      throw new BadRequestException(`${fieldName} debe ser un numero entero`);
    }

    return parsed;
  }

  async adjustStock(dto: {
    storeId: string;
    productId: string;
    userId: string;
    type: 'IN' | 'OUT';
    quantity: number;
    reference: string;
  }) {
    return await this.db.withTransaction(async (client) => {
      if (!dto.storeId || !dto.productId || !dto.userId) {
        throw new BadRequestException('storeId, productId y userId son obligatorios');
      }

      const quantity = this.parseInteger(dto.quantity, 'quantity');
      if (quantity <= 0) {
        throw new BadRequestException('quantity debe ser mayor que cero');
      }

      const prodRes = await client.query(
        'SELECT current_stock, units_per_bulk FROM products WHERE id = $1 AND store_id = $2 FOR UPDATE',
        [dto.productId, dto.storeId]
      );
      if (prodRes.rowCount === 0) throw new BadRequestException('Producto no encontrado en esta tienda');

      const currentStock = this.parseInteger(prodRes.rows[0].current_stock, 'current_stock');
      const unitsPerBulk = Math.max(
        1,
        this.parseInteger(prodRes.rows[0].units_per_bulk ?? 1, 'units_per_bulk'),
      );

      let newStock = currentStock;
      if (dto.type === 'IN') {
        newStock += quantity;
      } else {
        newStock -= quantity;
        if (newStock < 0) throw new BadRequestException('El ajuste resulta en stock negativo (Operación Denegada)');
      }

      const balanceBulks = Math.floor(newStock / unitsPerBulk);
      const balanceUnits = newStock % unitsPerBulk;

      const qtyBulks = Math.floor(quantity / unitsPerBulk);
      const qtyUnits = quantity % unitsPerBulk;

      await client.query(
        'UPDATE products SET current_stock = $1, stock_bulks = $2, stock_units = $3, updated_at = NOW() WHERE id = $4',
        [newStock, balanceBulks, balanceUnits, dto.productId]
      );

      const movRes = await client.query(
        `INSERT INTO movements (store_id, product_id, user_id, type, quantity, quantity_bulks, quantity_units, balance, balance_bulks, balance_units, reference) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [dto.storeId, dto.productId, dto.userId, dto.type, quantity, qtyBulks, qtyUnits, newStock, balanceBulks, balanceUnits, dto.reference]
      );

      const result = {
        ...movRes.rows[0],
        quantity,
        balance: newStock,
        quantityBulks: qtyBulks,
        quantityUnits: qtyUnits,
        balanceBulks,
        balanceUnits,
      };

      this.eventsGateway.emitSyncUpdate({
        type: 'INVENTORY_UPDATE',
        storeId: dto.storeId,
        payload: {
          productId: dto.productId,
          type: dto.type,
          quantity,
          balance: newStock,
          balanceBulks,
          balanceUnits,
          reference: dto.reference,
        },
      });

      return result;
    });
  }

  async getKardex(storeId: string, productId: string) {
    const res = await this.db.query(
      `SELECT m.*, u.name as user_name 
       FROM movements m 
       LEFT JOIN users u ON m.user_id = u.id 
       WHERE m.store_id = $1 AND m.product_id = $2 
       ORDER BY m.created_at DESC`,
      [storeId, productId]
    );
    return res.rows;
  }

  async getMovements(storeId: string, date?: string, type?: string) {
    let sql = `
      SELECT m.*, p.description as product_description, u.name as user_name 
      FROM movements m
      LEFT JOIN products p ON m.product_id = p.id
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.store_id = $1
    `;
    const params: any[] = [storeId];
    
    if (date) {
      sql += ' AND m.created_at::date = $' + (params.push(date));
    }
    
    if (type && type !== 'all') {
      sql += ' AND m.type = $' + (params.push(type.toUpperCase()));
    }
    
    sql += ' ORDER BY m.created_at DESC LIMIT 200';
    
    const res = await this.db.query(sql, params);
    
    return res.rows.map(row => ({
      id: row.id,
      storeId: row.store_id,
      productId: row.product_id,
      productDescription: row.product_description,
      userId: row.user_id,
      userName: row.user_name,
      type: row.type,
      quantity: Number.parseInt(row.quantity, 10),
      balance: Number.parseInt(row.balance, 10),
      reference: row.reference,
      createdAt: row.created_at
    }));
  }

  async getWarehouseInventory(storeId: string) {
    const res = await this.db.query(
      `SELECT
         p.id,
         p.store_id,
         p.barcode,
         p.description,
         p.current_stock,
         p.stock_bulks,
         p.stock_units,
         p.units_per_bulk,
         p.min_stock
       FROM products p
       WHERE p.store_id = $1
         AND p.is_active = true
         AND p.uses_inventory = true
       ORDER BY p.description ASC`,
      [storeId],
    );

    return res.rows.map((row) => ({
      id: row.id,
      storeId: row.store_id,
      barcode: row.barcode,
      description: row.description,
      currentStock: this.parseInteger(row.current_stock ?? 0, 'current_stock'),
      stockBulks: this.parseInteger(row.stock_bulks ?? 0, 'stock_bulks'),
      stockUnits: this.parseInteger(row.stock_units ?? 0, 'stock_units'),
      unitsPerBulk: Math.max(1, this.parseInteger(row.units_per_bulk ?? 1, 'units_per_bulk')),
      minStock: this.parseInteger(row.min_stock ?? 0, 'min_stock'),
    }));
  }

  async getVendorInventory(vendorId: string) {
    const res = await this.db.query(
      `SELECT
         vi.id,
         vi.vendor_id,
         vi.product_id,
         vi.store_id,
         vi.assigned_quantity,
         vi.sold_quantity,
         vi.current_quantity,
         vi.assigned_bulks,
         vi.assigned_units,
         vi.current_bulks,
         vi.current_units,
         vi.updated_at,
         p.description,
         p.barcode,
         p.units_per_bulk
       FROM vendor_inventories vi
       JOIN products p ON p.id = vi.product_id
       WHERE vi.vendor_id = $1
       ORDER BY p.description ASC`,
      [vendorId],
    );

    return res.rows.map((row) => ({
      id: row.id,
      vendorId: row.vendor_id,
      productId: row.product_id,
      storeId: row.store_id,
      description: row.description,
      barcode: row.barcode,
      assignedQuantity: this.parseInteger(row.assigned_quantity ?? 0, 'assigned_quantity'),
      soldQuantity: this.parseInteger(row.sold_quantity ?? 0, 'sold_quantity'),
      currentQuantity: this.parseInteger(row.current_quantity ?? 0, 'current_quantity'),
      assignedBulks: this.parseInteger(row.assigned_bulks ?? 0, 'assigned_bulks'),
      assignedUnits: this.parseInteger(row.assigned_units ?? 0, 'assigned_units'),
      currentBulks: this.parseInteger(row.current_bulks ?? 0, 'current_bulks'),
      currentUnits: this.parseInteger(row.current_units ?? 0, 'current_units'),
      unitsPerBulk: Math.max(1, this.parseInteger(row.units_per_bulk ?? 1, 'units_per_bulk')),
      updatedAt: row.updated_at,
    }));
  }
}
