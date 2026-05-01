import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLiquidacionDto {
  @IsString()
  @IsNotEmpty()
  storeId!: string;

  @IsString()
  @IsNotEmpty()
  ruteroId!: string;

  @IsString()
  @IsNotEmpty()
  fechaRuta!: string;

  @IsString()
  @IsOptional()
  arqueoId?: string;

  @IsString()
  @IsOptional()
  notas?: string;
}
