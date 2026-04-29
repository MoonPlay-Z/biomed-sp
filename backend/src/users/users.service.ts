import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.users.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('El correo ya está registrado.');

    const password_hash = await bcrypt.hash(dto.password, 10);
    return this.prisma.users.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        password_hash,
        rif_cedula: dto.rif_cedula,
        telefono: dto.telefono,
        role: dto.role,
      },
      select: { id: true, nombre: true, email: true, role: true, rif_cedula: true, telefono: true, created_at: true },
    });
  }

  findAll() {
    return this.prisma.users.findMany({
      select: { id: true, nombre: true, email: true, role: true, rif_cedula: true, telefono: true, created_at: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: { id: true, nombre: true, email: true, role: true, rif_cedula: true, telefono: true, created_at: true },
    });
    if (!user) throw new NotFoundException(`Usuario #${id} no encontrado.`);
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.password) {
      data.password_hash = await bcrypt.hash(dto.password, 10);
      delete data.password;
    }
    return this.prisma.users.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.users.delete({ where: { id } });
  }
}
