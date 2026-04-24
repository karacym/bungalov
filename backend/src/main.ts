import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { static as expressStatic } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const frontendRaw = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  const origins = frontendRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins.length > 1 ? origins : origins[0] ?? true,
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', expressStatic(uploadsDir));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Bungalov API')
    .setDescription('Bungalow rental backend API documentation')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const http = app.getHttpAdapter().getInstance() as {
    get: (path: string, handler: (req: unknown, res: { json: (b: unknown) => void }) => void) => void;
  };
  http.get('/', (_req, res) => {
    res.json({
      service: 'bungalov-backend',
      api: '/api',
      docs: '/api/docs',
      bungalows: '/api/bungalows',
    });
  });

  const port = Number(process.env.PORT) || Number(configService.get('PORT')) || 4000;
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
