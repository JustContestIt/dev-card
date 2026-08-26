import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import type { Env } from './config/env.validation';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.flushLogs();

  configureApp(app);

  const config = app.get(ConfigService<Env, true>);
  const port = config.get('PORT', { infer: true });
  const publicUrl = config.get('PUBLIC_URL', { infer: true });

  await app.listen(port, '0.0.0.0');
  logger.log(`Card is live: ${publicUrl} · GraphQL: ${publicUrl}/graphql`, 'Bootstrap');
}

void bootstrap();
