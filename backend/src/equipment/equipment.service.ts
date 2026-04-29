import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateEquipmentDto) {
    return this.prisma.equipments.create({ data: dto });
  }

  findAll() {
    return this.prisma.equipments.findMany({
      include: {
        appointments: {
          select: { id: true, status: true, descripcion_falla: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const equip = await this.prisma.equipments.findUnique({
      where: { id },
      include: { appointments: true },
    });
    if (!equip) throw new NotFoundException(`Equipo #${id} no encontrado.`);
    return equip;
  }

  async findBySerial(serial_number: string) {
    const equip = await this.prisma.equipments.findUnique({
      where: { serial_number },
    });
    if (!equip)
      throw new NotFoundException(
        `Equipo con serial ${serial_number} no encontrado.`,
      );
    return equip;
  }

  async update(id: number, dto: UpdateEquipmentDto) {
    await this.findOne(id);
    return this.prisma.equipments.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.equipments.delete({ where: { id } });
  }
}
