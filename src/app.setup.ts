import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import type { Env } from './config/env.validation';

/**
 * Everything the HTTP layer needs, in one place —
 * used by main.ts AND by the e2e suite, so tests exercise
 * the exact pipeline production runs (pipes, helmet, CORS).
 */
export function configureApp(app: NestExpressApplication): void {
  const config = app.get(ConfigService<Env, true>);
  const corsOrigins = config.get('CORS_ORIGINS', { infer: true });

  // Real client IPs behind a reverse proxy / load balancer (Render, Railway,
  // nginx). Configurable: trusting X-Forwarded-For with no proxy in front
  // would let clients spoof their IP and dodge rate limits.
  app.set('trust proxy', config.get('TRUST_PROXY', { infer: true }));

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
    req.path.startsWith('/graphql') ? sandboxHelmet(req, res, next) : strictHelmet(req, res, next),
  );

  app.enableCors({
    origin: corsOrigins === '*' ? true : corsOrigins.split(',').map((o) => o.trim()),
  });

  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );

  // SIGTERM/SIGINT → onModuleDestroy (Prisma disconnect) → clean exit.
  app.enableShutdownHooks();
}
