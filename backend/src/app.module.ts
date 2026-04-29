import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { InventoryModule } from './inventory/inventory.module';
import { EquipmentModule } from './equipment/equipment.module';

@Module({
  imports: [ChatModule, PrismaModule, UsersModule, AppointmentsModule, InventoryModule, EquipmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
