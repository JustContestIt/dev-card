import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { GraphQLFormattedError } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { LoggerModule } from 'nestjs-pino';
import { CommonModule } from './common/common.module';
import { GqlThrottlerGuard } from './common/gql-throttler.guard';
import { Env, validateEnv } from './config/env.validation';
import { ContentModule } from './content/content.module';
import { ContactModule } from './contact/contact.module';
import { ExperienceModule } from './experience/experience.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { ProjectsModule } from './projects/projects.module';
import { SkillsLoaderFactory } from './skills/skills.loader';
import { SkillsModule } from './skills/skills.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv, cache: true }),

    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const dev = config.get('NODE_ENV', { infer: true }) === 'development';
        return {
          pinoHttp: {
            level: config.get('LOG_LEVEL', { infer: true }),
            transport: dev
              ? { target: 'pino-pretty', options: { singleLine: true, translateTime: 'SYS:HH:MM:ss' } }
              : undefined,
            redact: { paths: ['req.headers.authorization', 'req.headers.cookie'], remove: true },
            autoLogging: { ignore: (req) => (req.url ?? '').startsWith('/health') },
            genReqId: (req) => (req.headers['x-request-id'] as string | undefined) ?? randomUUID(),
          },
        };
      },
    }),

    PrismaModule,
    CommonModule,

    // Baseline burst protection for every route; stricter per-mutation
    // limits are declared with @Throttle on the resolvers themselves.
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 120 }],
    }),

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [SkillsModule],
      inject: [SkillsLoaderFactory, ConfigService],
      useFactory: (loaderFactory: SkillsLoaderFactory, config: ConfigService<Env, true>) => {
        const isProd = config.get('NODE_ENV', { infer: true }) === 'production';
        return {
          // The generated SDL is committed — schema changes are visible in code review.
          autoSchemaFile: join(process.cwd(), 'schema.gql'),
          sortSchema: true,
          introspection: true,
          playground: false,
          // Apollo Sandbox stays available in production on purpose:
          // the API explorer is part of the "digital business card" demo.
          plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
          // Cheap DoS insurance: deeply nested queries are rejected before
          // execution. Today's schema has no recursive relations, so this is
          // a guard for future ones. Introspection (__-fields) is exempt by
          // design — Apollo Sandbox needs deep introspection queries to work.
          validationRules: [depthLimit(8)],
          context: ({ req, res }: { req: Request; res: Response }) => ({
            req,
            res,
            // A fresh DataLoader per request — batching without cross-request leakage.
            loaders: loaderFactory.create(),
          }),
          formatError: (formatted: GraphQLFormattedError): GraphQLFormattedError => {
            const ext = { ...formatted.extensions };
            const orig = ext.originalError as
              | { statusCode?: number; message?: string | string[] }
              | undefined;

            // Nest HttpExceptions arrive as INTERNAL_SERVER_ERROR — restore real codes.
            if (orig?.statusCode === 404) ext.code = 'NOT_FOUND';
            else if (orig?.statusCode === 400) ext.code = 'BAD_REQUEST';

            // "Bad Request Exception" is useless — surface the validation details.
            let message = formatted.message;
            if (Array.isArray(orig?.message)) {
              message = orig.message.join('; ');
            }

            if (isProd) {
              delete ext.stacktrace;
              delete ext.originalError;
              if (ext.code === 'INTERNAL_SERVER_ERROR') {
                message = 'Internal server error';
              }
            }
            return { ...formatted, message, extensions: ext };
          },
        };
      },
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/graphql'],
    }),

    ContentModule,
    HealthModule,
    ProfileModule,
    SkillsModule,
    ExperienceModule,
    ProjectsModule,
    ContactModule,
    StatsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: GqlThrottlerGuard }],
})
export class AppModule {}
