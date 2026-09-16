import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import { AppModule, ObserveInstrument } from './app.module.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  const config = new DocumentBuilder()
    .setTitle('Job Tracker API')
    .setDescription('API for managing job applications')
    .setVersion('1.0')
    .build();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // served at /api-docs

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
