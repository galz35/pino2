import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateCargaCamionDto {
  @IsString()
  @IsNotEmpty()
  storeId!: string;

  @IsString()
  @IsNotEmpty()
  ruteroId!: string;

  @IsString()
  @IsOptional()
  camionPlaca?: string;

  @IsArray()
  @IsString({ each: true })
  orderIds!: string[];

  @IsString()
  @IsOptional()
  fechaEntrega?: string;
}
