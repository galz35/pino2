import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateChainDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  ownerName?: string;

  @IsEmail()
  @IsOptional()
  ownerEmail?: string;
}

export class UpdateChainDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  ownerName?: string;

  @IsEmail()
  @IsOptional()
  ownerEmail?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
