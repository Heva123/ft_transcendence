import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  if (process.env.DEMO_MODE !== 'true') {
    throw new Error('DEMO_MODE must be enabled for local development.');
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useStaticAssets(join(process.cwd(), 'public'));
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '127.0.0.1');
  console.log(`Socket test: http://127.0.0.1:${port}/demo.html`);
  console.log(`Feed test: http://127.0.0.1:${port}/feed-demo.html`);
}
void bootstrap();
