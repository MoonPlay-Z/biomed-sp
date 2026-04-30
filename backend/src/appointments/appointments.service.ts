import { Injectable, NotFoundException } from '@nestjs/common';
import { appointment_status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ReceptionDto } from './dto/reception.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async reception(dto: ReceptionDto) {
    // 1. Buscar o crear cliente
    const client = await this.prisma.users.upsert({
      where: { email: `${dto.clientRif.toLowerCase()}@jamechanic.local` }, // Email temporal si no hay uno real
      update: {
        nombre: dto.clientName,
        telefono: dto.clientPhone,
        rif_cedula: dto.clientRif,
      },
      create: {
        nombre: dto.clientName,
        email: `${dto.clientRif.toLowerCase()}@jamechanic.local`,
        password_hash: 'no-password', // Los clientes creados así no tienen acceso directo hasta ser invitados
        rif_cedula: dto.clientRif,
        telefono: dto.clientPhone,
        role: 'CLIENT',
      },
    });

    // 2. Buscar o crear equipo
    const equipment = await this.prisma.equipments.upsert({
      where: { serial_number: dto.serialNumber },
      update: {
        marca: dto.brand,
        modelo: dto.model,
      },
      create: {
        tipo_equipo: 'EQUIPO MÉDICO',
        marca: dto.brand,
        modelo: dto.model,
        serial_number: dto.serialNumber,
      },
    });

    // 3. Crear la cita
    return this.prisma.appointments.create({
      data: {
        client_id: client.id,
        equipment_id: equipment.id,
        descripcion_falla: dto.issueDescription,
        fecha_cita: new Date(),
        status: 'RECEIVED',
        notas_tecnicas: dto.notes,
      },
      include: {
        client: { select: { nombre: true, email: true } },
        equipment: true,
      },
    });
  }

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

  findAll(params: {
    status?: appointment_status;
    clientId?: number;
    techId?: number;
  }) {
    const { status, clientId, techId } = params;
    return this.prisma.appointments.findMany({
      where: {
        status,
        client_id: clientId,
        tech_id: techId,
      },
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
