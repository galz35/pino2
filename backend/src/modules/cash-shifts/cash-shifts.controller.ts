import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CashShiftsService } from './cash-shifts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('CashShifts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-shifts')
export class CashShiftsController {
  constructor(private readonly service: CashShiftsService) {}

  @Post()
  @ApiOperation({ summary: 'Abrir un nuevo turno de caja' })
  openShift(
    @Body() dto: { storeId: string; userId?: string; startingCash: number },
    @Req() req: any,
  ) {
    return this.service.openShift(
      dto.storeId,
      dto.userId || req.user?.sub,
      dto.startingCash,
    );
  }

  @Post('close')
  @ApiOperation({ summary: 'Cerrar un turno de caja' })
  closeShift(
    @Body()
    dto: {
      shiftId: string;
      storeId: string;
      expectedCash: number;
      actualCash: number;
      difference: number;
      userId?: string;
    },
    @Req() req: any,
  ) {
    return this.service.closeShift(
      dto.shiftId,
      dto.storeId,
      dto.expectedCash,
      dto.actualCash,
      dto.difference,
      dto.userId || req.user?.sub,
    );
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener el turno de caja activo para una tienda' })
  getActiveShift(@Query('storeId') storeId: string) {
    return this.service.getActiveShift(storeId);
  }

  @Get('stats/:id')
  @ApiOperation({ summary: 'Obtener estadísticas (totales) de un turno' })
  getStats(@Param('id') id: string) {
    return this.service.getShiftStats(id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los turnos de caja de una tienda' })
  findAll(
    @Query('storeId') storeId: string,
    @Query('status') status?: string,
    @Query('cashierId') cashierId?: string,
  ) {
    return this.service.findAll(storeId, status, cashierId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un turno de caja específico por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Cerrar un turno de caja por ID en URL' })
  closeShiftById(
    @Param('id') id: string,
    @Body()
    dto: {
      storeId: string;
      expectedCash: number;
      actualCash: number;
      difference: number;
      userId?: string;
    },
    @Req() req: any,
  ) {
    return this.service.closeShift(
      id,
      dto.storeId,
      dto.expectedCash,
      dto.actualCash,
      dto.difference,
      dto.userId || req.user?.sub,
    );
  }
}
