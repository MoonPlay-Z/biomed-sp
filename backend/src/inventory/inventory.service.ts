import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateInventoryDto) {
    return this.prisma.inventory.create({ data: dto });
  }

  findAll() {
    return this.prisma.inventory.findMany({
      orderBy: { nombre_repuesto: 'asc' },
    });
  }

  // Repuestos con stock bajo
  findLowStock() {
    return this.prisma.inventory.findMany({
      where: {
        cantidad: { lte: this.prisma.inventory.fields.cantidad_minima },
      },
      orderBy: { cantidad: 'asc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.inventory.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Repuesto #${id} no encontrado.`);
    return item;
  }

  async update(id: number, dto: UpdateInventoryDto) {
    await this.findOne(id);
    return this.prisma.inventory.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.inventory.delete({ where: { id } });
  }
}
