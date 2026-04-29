import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para el frontend de Next.js
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Ignora campos extra no declarados en el DTO
      forbidNonWhitelisted: true,
      transform: true, // Convierte automáticamente los tipos (string -> number, etc.)
    }),
  );

  // Prefijo global de la API
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 JaMechanic API corriendo en: http://localhost:${port}/api`);
}
void bootstrap();
