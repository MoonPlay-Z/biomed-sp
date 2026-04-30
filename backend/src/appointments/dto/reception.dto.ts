import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class ReceptionDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsNotEmpty()
  clientRif: string;

  @IsString()
  @IsNotEmpty()
  clientPhone: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsNotEmpty()
  issueDescription: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
