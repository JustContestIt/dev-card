import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.validation';
import { PrismaService } from '../prisma/prisma.service';
import { StatsModel } from './models/stats.model';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);
  private readonly version: string;
  private readonly environment: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService<Env, true>,
  ) {
    this.environment = config.get('NODE_ENV', { infer: true });
    this.version = this.readVersion();
  }

  private readVersion(): string {
    try {
      const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
        version?: string;
      };
      return pkg.version ?? '0.0.0';
    } catch (e) {
      this.logger.warn(`Could not read package.json version: ${(e as Error).message}`);
      return '0.0.0';
    }
  }

  async getStats(): Promise<StatsModel> {
    const [totalViews, uniqueRows, messagesReceived, endorsements] =
      await this.prisma.$transaction([
        this.prisma.pageView.count(),
        // Prisma's `distinct` materializes every distinct row in memory;
        // COUNT(DISTINCT ...) stays inside the database.
        this.prisma.$queryRaw<{ count: bigint }[]>`
          SELECT count(DISTINCT "ipHash") AS count
          FROM "PageView"
          WHERE "ipHash" IS NOT NULL`,
        this.prisma.contactMessage.count(),
        this.prisma.skill.aggregate({ _sum: { endorsements: true } }),
      ]);

    return {
      totalViews,
      uniqueVisitors: Number(uniqueRows[0]?.count ?? 0),
      messagesReceived,
      totalEndorsements: endorsements._sum.endorsements ?? 0,
      uptimeSeconds: Math.round(process.uptime()),
      version: this.version,
      environment: this.environment,
    };
  }

  async trackView(path: string, ipHash: string | null): Promise<number> {
    await this.prisma.pageView.create({ data: { path, ipHash } });
    return this.prisma.pageView.count({ where: { path } });
  }
}
