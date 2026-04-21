import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateProductBarcodeDto {
  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsNotEmpty()
  barcode!: string;

  @IsString()
  @IsOptional()
  label?: string;
}

export class UpdateProductBarcodeDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export interface ProductBarcode {
  id: string;
  productId: string;
  storeId: string;
  barcode: string;
  label: string | null;
  isPrimary: boolean;
  createdAt: Date;
}
