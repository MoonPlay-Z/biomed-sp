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
  console.log('[Lambda] Bootstrap starting...');
  console.log('[Lambda] DATABASE_URL set:', !!process.env.DATABASE_URL);

  try {
    const app = await NestFactory.create(ServerlessAppModule, {
      logger: ['error', 'warn', 'log'],
    });

    app.setGlobalPrefix('api');

    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );

    await app.init();
    console.log('[Lambda] NestJS app initialized successfully');

    const expressApp = app.getHttpAdapter().getInstance();
    return serverlessExpress({ app: expressApp });
  } catch (err) {
    console.error('[Lambda] Bootstrap FAILED:', err);
    throw err;
  }
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.source === 'serverless-plugin-warmup') {
    return 'Lambda is warm!';
  }

  try {
    cachedServer = cachedServer ?? (await bootstrap());
    return cachedServer(event, context, callback);
  } catch (err) {
    console.error('[Lambda] Handler error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: err instanceof Error ? err.message : String(err),
      }),
    };
  }
};
