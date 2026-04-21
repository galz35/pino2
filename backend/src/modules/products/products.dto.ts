import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  storeId!: string;

  @IsString()
  @IsOptional()
  departmentId?: string | null;

  @IsString()
  @IsOptional()
  department?: string | null;

  @IsString()
  @IsOptional()
  barcode?: string | null;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  alternateBarcodes?: string[];

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  brand?: string | null;

  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @IsNumber()
  @IsOptional()
  wholesalePrice?: number;

  @IsNumber()
  @IsOptional()
  price1?: number;

  @IsNumber()
  @IsOptional()
  price2?: number;

  @IsNumber()
  @IsOptional()
  price3?: number;

  @IsNumber()
  @IsOptional()
  price4?: number;

  @IsNumber()
  @IsOptional()
  price5?: number;

  @IsNumber()
  @IsOptional()
  currentStock?: number;

  @IsNumber()
  @IsOptional()
  unitsPerBulk?: number;

  @IsNumber()
  @IsOptional()
  stockBulks?: number;

  @IsNumber()
  @IsOptional()
  stockUnits?: number;

  @IsNumber()
  @IsOptional()
  minStock?: number;

  @IsBoolean()
  @IsOptional()
  usesInventory?: boolean;

  @IsString()
  @IsOptional()
  supplierId?: string | null;

  @IsString()
  @IsOptional()
  subDepartment?: string | null;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  storeId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @IsNumber()
  @IsOptional()
  wholesalePrice?: number;

  @IsNumber()
  @IsOptional()
  price1?: number;

  @IsNumber()
  @IsOptional()
  price2?: number;

  @IsNumber()
  @IsOptional()
  price3?: number;

  @IsNumber()
  @IsOptional()
  price4?: number;

  @IsNumber()
  @IsOptional()
  price5?: number;

  @IsNumber()
  @IsOptional()
  currentStock?: number;

  @IsNumber()
  @IsOptional()
  unitsPerBulk?: number;

  @IsNumber()
  @IsOptional()
  stockBulks?: number;

  @IsNumber()
  @IsOptional()
  stockUnits?: number;

  @IsNumber()
  @IsOptional()
  minStock?: number;

  @IsBoolean()
  @IsOptional()
  usesInventory?: boolean;

  @IsString()
  @IsOptional()
  supplierId?: string;

  @IsString()
  @IsOptional()
  subDepartment?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export interface Product {
  id: string;
  storeId: string;
  departmentId?: string;
  departmentName?: string;
  department?: string;
  barcode: string;
  description: string;
  brand: string;
  salePrice: number;
  costPrice: number;
  wholesalePrice: number;
  price1: number;
  price2: number;
  price3: number;
  price4: number;
  price5: number;
  currentStock: number;
  unitsPerBulk: number;
  stockBulks: number;
  stockUnits: number;
  minStock: number;
  usesInventory: boolean;
  supplierId?: string;
  subDepartment: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
