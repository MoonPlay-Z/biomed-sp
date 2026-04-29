import { IsArray, IsString } from 'class-validator';

export class CreateEquipmentDto {
  @IsString()
  tipo_equipo: string;

  @IsString()
  marca: string;

  @IsString()
  modelo: string;

  @IsString()
  serial_number: string;

  @IsArray()
  @IsString({ each: true })
  imagenes_url: string[];
}
