import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // ── Headers de seguridad HTTP (Helmet) ──────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // Swagger y SPA friendly
    }),
  );

  // ── Prefijo global de la API ───────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Cookie parser (necesario para Refresh Token en cookie) ──
  app.use(cookieParser());

  // ── CORS ───────────────────────────────────────────────
  app.enableCors({
    origin: config.get<string>('FRONTEND_URL', 'http://localhost:5173'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // ── Validación global de DTOs ──────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
      transform: true,           // Transforma payloads al tipo del DTO
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Swagger (solo en desarrollo) ───────────────────────
  if (config.get<string>('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('HYTICON — API de Cotizaciones')
      .setDescription('Sistema de gestión y cotizaciones para HYTICON')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  // ── Inicio del servidor ────────────────────────────────
  const port = config.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 HYTICON API corriendo en: http://localhost:${port}/api/v1`);
  if (config.get<string>('NODE_ENV') !== 'production') {
    console.log(`📚 Swagger disponible en: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
