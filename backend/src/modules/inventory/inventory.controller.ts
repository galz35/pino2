import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Post('adjust')
  @ApiOperation({ summary: 'Ajustar stock de un producto' })
  adjustStock(
    @Body()
    dto: {
      storeId: string;
      productId: string;
      userId?: string;
      type: 'IN' | 'OUT';
      quantity: number;
      reference: string;
    },
    @Req() req: any,
  ) {
    return this.service.adjustStock({
      ...dto,
      userId: dto.userId || req.user?.sub,
    });
  }

  @Get('movements')
  @ApiOperation({ summary: 'Obtener historial de movimientos de inventario' })
  getMovements(
    @Query('storeId') storeId: string,
    @Query('date') date?: string,
    @Query('type') type?: string,
  ) {
    return this.service.getMovements(storeId, date, type);
  }

  @Get('warehouse')
  @ApiOperation({ summary: 'Obtener inventario de bodega por tienda' })
  getWarehouseInventory(@Query('storeId') storeId: string) {
    return this.service.getWarehouseInventory(storeId);
  }

  @Get('vendor')
  @ApiOperation({ summary: 'Obtener inventario asignado a un rutero/vendedor' })
  getVendorInventory(@Query('vendorId') vendorId: string) {
    return this.service.getVendorInventory(vendorId);
  }
}
