import { Injectable, NotFoundException } from '@nestjs/common';
import { appointment_status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAppointmentDto) {
    return this.prisma.appointments.create({
      data: {
        client_id: dto.client_id,
        tech_id: dto.tech_id,
        equipment_id: dto.equipment_id,
        descripcion_falla: dto.descripcion_falla,
        fecha_cita: new Date(dto.fecha_cita),
        status: dto.status,
      },
      include: {
        client: { select: { nombre: true, email: true } },
        tech: { select: { nombre: true } },
        equipment: true,
      },
    });
  }

  findAll(status?: appointment_status) {
    return this.prisma.appointments.findMany({
      where: status ? { status } : undefined,
      include: {
        client: { select: { id: true, nombre: true, telefono: true } },
        tech: { select: { id: true, nombre: true } },
        equipment: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const apt = await this.prisma.appointments.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, nombre: true, email: true, telefono: true },
        },
        tech: { select: { id: true, nombre: true } },
        equipment: true,
        messages: {
          include: { sender: { select: { nombre: true, role: true } } },
          orderBy: { created_at: 'asc' },
        },
      },
    });
    if (!apt) throw new NotFoundException(`Cita #${id} no encontrada.`);
    return apt;
  }

  async updateStatus(id: number, dto: UpdateAppointmentDto) {
    await this.findOne(id);
    return this.prisma.appointments.update({
      where: { id },
      data: {
        status: dto.status,
        tech_id: dto.tech_id,
        notas_tecnicas: dto.notas_tecnicas,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.appointments.delete({ where: { id } });
  }
}
