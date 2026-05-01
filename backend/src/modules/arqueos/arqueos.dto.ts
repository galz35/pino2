import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateArqueoDto {
  @IsString()
  @IsNotEmpty()
  storeId!: string;

  @IsString()
  @IsNotEmpty()
  ruteroId!: string;

  @IsString()
  @IsOptional()
  fecha?: string;

  @IsNumber()
  @IsNotEmpty()
  efectivoContado!: number;

  @IsNumber()
  @IsOptional()
  cheques?: number;

  @IsNumber()
  @IsOptional()
  depositos?: number;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsNumber()
  @IsOptional()
  efectivoDeclarado?: number;
}
