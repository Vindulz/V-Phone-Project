import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  // Make sure uploads folder exists
  const uploadsDir = join(__dirname, '..', 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve uploads folder as static files at /uploads
  app.useStaticAssets(join(__dirname, '..', 'public', 'uploads'), {
    prefix: '/uploads',
  });

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('VPhone API')
    .setDescription('Backend API for VPhone website')
    .setVersion('1.0')
    .addTag('users')
    .addTag('orders')
    .addTag('auth')
    .addTag('products')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }));

  await app.listen(3000);
  console.log('Server running at http://localhost:3000');
  console.log('Swagger docs at http://localhost:3000/api-docs');
}
bootstrap();