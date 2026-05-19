import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { CreatePartRequestDto } from './dto/create-part-request.dto';
import { request_status, transaction_type } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Catálogo de Inventario ---

  create(dto: CreateInventoryDto) {
    return this.prisma.inventory.create({ data: dto });
  }

  findAll() {
    return this.prisma.inventory.findMany({
      orderBy: { nombre_repuesto: 'asc' },
    });
  }

  findLowStock() {
    return this.prisma.$queryRaw`SELECT * FROM inventory WHERE cantidad <= cantidad_minima ORDER BY "cantidad" ASC`;
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

  // --- Solicitudes de Repuestos (Part Requests) ---

  createRequest(techId: number, dto: CreatePartRequestDto) {
    return this.prisma.part_requests.create({
      data: {
        inventory: { connect: { id: dto.inventory_id } },
        tech: { connect: { id: techId } },
        appointment: dto.appointment_id ? { connect: { id: dto.appointment_id } } : undefined,
        quantity: dto.quantity,
        status: request_status.PENDING,
      },
      include: {
        inventory: true,
        tech: { select: { id: true, nombre: true } },
      }
    });
  }

  getRequests() {
    return this.prisma.part_requests.findMany({
      orderBy: { requested_at: 'desc' },
      include: {
        inventory: true,
        tech: { select: { id: true, nombre: true } },
      }
    });
  }

  async approveRequest(requestId: number, adminId: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verificar la solicitud
      const req = await tx.part_requests.findUnique({ 
        where: { id: requestId },
        include: { inventory: true }
      });

      if (!req) throw new NotFoundException('Solicitud no encontrada');
      if (req.status !== request_status.PENDING) throw new BadRequestException('La solicitud ya fue procesada');

      // 2. Verificar stock
      if (req.inventory.cantidad < req.quantity) {
        throw new BadRequestException('Stock insuficiente para aprobar esta solicitud');
      }

      // 3. Descontar stock
      const updatedItem = await tx.inventory.update({
        where: { id: req.inventory_id },
        data: { cantidad: { decrement: req.quantity } },
      });

      // 4. Crear transacción
      await tx.inventory_transactions.create({
        data: {
          inventory_id: req.inventory_id,
          user_id: adminId, // The admin who approved it
          type: transaction_type.REPAIR_USE,
          quantity: req.quantity,
          appointment_id: req.appointment_id,
          price_at_time: req.inventory.costo_unitario,
        }
      });

      // 5. Marcar solicitud como aprobada
      return tx.part_requests.update({
        where: { id: requestId },
        data: { 
          status: request_status.APPROVED,
          resolved_at: new Date(),
        },
        include: {
          inventory: true,
          tech: { select: { id: true, nombre: true } },
        }
      });
    });
  }

  async rejectRequest(requestId: number, adminId: number) {
    const req = await this.prisma.part_requests.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException('Solicitud no encontrada');
    if (req.status !== request_status.PENDING) throw new BadRequestException('La solicitud ya fue procesada');

    return this.prisma.part_requests.update({
      where: { id: requestId },
      data: {
        status: request_status.REJECTED,
        resolved_at: new Date(),
      },
      include: {
        inventory: true,
        tech: { select: { id: true, nombre: true } },
      }
    });
  }

  // --- Historial de Transacciones ---

  getTransactions(appointmentId?: number) {
    return this.prisma.inventory_transactions.findMany({
      where: appointmentId ? { appointment_id: appointmentId } : {},
      orderBy: { created_at: 'desc' },
      include: {
        inventory: true,
        user: { select: { id: true, nombre: true } },
      }
    });
  }
}
