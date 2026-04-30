import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalAppointmentsToday,
      appointmentsByStatus,
      totalUsersByRole,
      lowStockCount,
    ] = await Promise.all([
      // 1. Citas de hoy
      this.prisma.appointments.count({
        where: {
          created_at: { gte: today },
        },
      }),

      // 2. Citas por estado
      this.prisma.appointments.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // 3. Usuarios por rol
      this.prisma.users.groupBy({
        by: ['role'],
        _count: { id: true },
      }),

      // 4. Repuestos con stock bajo (usando la lógica de InventoryService)
      this.getLowStockCount(),
    ]);

    return {
      appointmentsToday: totalAppointmentsToday,
      appointmentsByStatus: appointmentsByStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
      })),
      usersByRole: totalUsersByRole.map((item) => ({
        role: item.role,
        count: item._count.id,
      })),
      lowStockItems: lowStockCount,
    };
  }

  private async getLowStockCount(): Promise<number> {
    const result: any[] = await this.prisma
      .$queryRaw`SELECT COUNT(*)::int as count FROM inventory WHERE cantidad <= cantidad_minima`;
    return result[0]?.count || 0;
  }
}
