import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { appointment_status } from '@prisma/client';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsEnum(appointment_status)
  status?: appointment_status;

  @IsOptional()
  @IsInt()
  tech_id?: number;

  @IsOptional()
  @IsString()
  notas_tecnicas?: string;
}
