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
    .setDescription('API documentation')
    .setVersion('1.0')
    .addTag('Auth') // entry point — login/register/refresh
    .addTag('Users') // the authenticated user's own data
    .addTag('Applications') // core resource — job applications
    .addTag('ApplicationNotes') // tightly coupled to Application, right after it
    .addTag('Companies') // linked to applications
    .addTag('Roles') // linked to applications
    .addTag('Sources') // where the application came from
    .addTag('Technologies') // tags/stack associated with applications
    .addTag('Preferences') // user settings, least frequently touched
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
