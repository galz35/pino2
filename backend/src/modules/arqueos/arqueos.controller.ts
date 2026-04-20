import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ArqueosService } from './arqueos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('arqueos')
@UseGuards(JwtAuthGuard)
export class ArqueosController {
  constructor(private readonly service: ArqueosService) {}

  @Post()
  create(@Body() dto: any, @Req() req: any) {
    return this.service.create({ ...dto, realizadoPor: req.user.sub });
  }

  @Get()
  findAll(
    @Query('storeId') storeId: string,
    @Query('fecha') fecha?: string,
  ) {
    return this.service.findAll(storeId, fecha);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
