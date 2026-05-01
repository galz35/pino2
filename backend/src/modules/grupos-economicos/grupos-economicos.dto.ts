import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateGrupoEconomicoDto {
  @IsString()
  @IsNotEmpty()
  storeId!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsNumber()
  @IsOptional()
  limiteCreditoGlobal?: number;

  @IsString()
  @IsOptional()
  notas?: string;
}

export class UpdateGrupoEconomicoDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsNumber()
  @IsOptional()
  limiteCreditoGlobal?: number;

  @IsString()
  @IsOptional()
  notas?: string;
}
