import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { seedDatabase } from './seed-database';

/**
 * Self-healing content: a freshly deployed instance (empty database)
 * seeds itself on boot, so the public link never shows an empty card.
 * A non-empty database is left untouched — explicit re-seeding is
 * `npm run prisma:seed`.
 */
@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    const profiles = await this.prisma.profile.count();
    if (profiles > 0) {
      return;
    }
    this.logger.log('Empty database detected — seeding card content…');
    const counts = await seedDatabase(this.prisma);
    this.logger.log(`Seeded: ${JSON.stringify(counts)}`);
  }
}
