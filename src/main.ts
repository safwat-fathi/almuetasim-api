import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { Response } from 'express';
import CONSTANTS from './common/constants';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { QueryFailedExceptionFilter } from './common/filters/query-failed-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Pipes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Global Filters
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new QueryFailedExceptionFilter(),
  );

  // Security headers configuration
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable CSP for Swagger UI
      crossOriginEmbedderPolicy: false, // Required for Swagger UI
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'HEAD', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });

  // Swagger configuration
  // Remove COOP header to fix Swagger UI issues
  app.use((_, res: Response, next) => {
    res.removeHeader('Cross-Origin-Opener-Policy');
    next();
  });

  const options = new DocumentBuilder()
    .setTitle('Almuetasim API')
    .setDescription('Almuetasim API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token **_only_**',
        in: 'header',
      },
      CONSTANTS.ACCESS_TOKEN,
    );

  options.addServer(process.env.APP_URL, process.env.NODE_ENV);

  const config = options.build();
  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger UI
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 8000, () => {
    console.log(`Server started on port ${process.env.PORT ?? 8000}`);
  });
}
void bootstrap();
