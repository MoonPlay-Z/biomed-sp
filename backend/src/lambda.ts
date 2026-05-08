import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { InventoryModule } from './inventory/inventory.module';
import { EquipmentModule } from './equipment/equipment.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import serverlessExpress from '@vendia/serverless-express';
import { Handler, Context, Callback } from 'aws-lambda';

// AppModule sin WebSockets/Socket.IO — incompatible con Serverless
@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AppointmentsModule,
    InventoryModule,
    EquipmentModule,
    AuthModule,
    DashboardModule,
  ],
})
class ServerlessAppModule {}

let cachedServer: Handler;

async function bootstrap() {
  const app = await NestFactory.create(ServerlessAppModule);

  // Prefijo global de la API para que coincida con la ruta de la función
  app.setGlobalPrefix('api');

  // Habilitar CORS
  app.enableCors({
    origin: '*', // En producción podrías restringirlo a tu dominio de Netlify
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  // Manejo especial para eventos de calentamiento (warming) si es necesario
  if (event.source === 'serverless-plugin-warmup') {
    console.log('WarmUp - Lambda is warm!');
    return 'Lambda is warm!';
  }

  cachedServer = cachedServer ?? (await bootstrap());
  return cachedServer(event, context, callback);
};
