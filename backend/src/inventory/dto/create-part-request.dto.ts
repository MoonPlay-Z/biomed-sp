import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreatePartRequestDto {
  @IsInt()
  @IsNotEmpty()
  inventory_id: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity: number;

  @IsInt()
  @IsOptional()
  appointment_id?: number;
}
