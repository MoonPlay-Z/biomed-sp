import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para el frontend en producción y local
  app.enableCors({
    origin: [
      'https://biomed-sp.netlify.app',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
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
