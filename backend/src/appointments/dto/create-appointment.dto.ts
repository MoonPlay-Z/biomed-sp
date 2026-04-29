import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { appointment_status } from '@prisma/client';

export class CreateAppointmentDto {
  @IsInt()
  client_id: number;

  @IsOptional()
  @IsInt()
  tech_id?: number;

  @IsOptional()
  @IsInt()
  equipment_id?: number;

  @IsString()
  descripcion_falla: string;

  @IsDateString()
  fecha_cita: string;

  @IsOptional()
  @IsEnum(appointment_status)
  status?: appointment_status;
}
