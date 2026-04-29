import { IsArray, IsDecimal, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  sku: string;

  @IsString()
  nombre_repuesto: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  cantidad?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cantidad_minima?: number;

  @IsOptional()
  costo_unitario?: number;

  @IsOptional()
  @IsString()
  proveedor?: string;
}
