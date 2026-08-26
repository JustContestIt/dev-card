import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { AppModule } from './app.module';
import type { Env } from './config/env.validation';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.flushLogs();

  const config = app.get(ConfigService<Env, true>);
  const port = config.get('PORT', { infer: true });
  const publicUrl = config.get('PUBLIC_URL', { infer: true });
  const corsOrigins = config.get('CORS_ORIGINS', { infer: true });

  // Real client IPs behind a reverse proxy / load balancer (Render, Railway, nginx).
  app.set('trust proxy', 1);

  // Strict CSP for the card itself; /graphql is exempt because the embedded
  // Apollo Sandbox loads its explorer bundle from Apollo's CDN.
  const strictHelmet = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });
  const sandboxHelmet = helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false });
  app.use((req: Request, res: Response, next: NextFunction) =>
    req.path.startsWith('/graphql')
      ? sandboxHelmet(req, res, next)
      : strictHelmet(req, res, next),
  );

  app.enableCors({
    origin: corsOrigins === '*' ? true : corsOrigins.split(',').map((o) => o.trim()),
  });

  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );

  // SIGTERM/SIGINT → onModuleDestroy (Prisma disconnect) → clean exit.
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  logger.log(`Card is live: ${publicUrl} · GraphQL: ${publicUrl}/graphql`, 'Bootstrap');
}

void bootstrap();
