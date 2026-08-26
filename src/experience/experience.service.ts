import { Injectable } from '@nestjs/common';
import { Experience, Locale } from '@prisma/client';
import { TtlCacheService } from '../common/ttl-cache.service';
import { PrismaService } from '../prisma/prisma.service';

const CACHE_TTL_MS = 60_000;

@Injectable()
export class ExperienceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: TtlCacheService,
  ) {}

  async list(locale: Locale): Promise<Experience[]> {
    return this.cache.wrap(`experience:${locale}`, CACHE_TTL_MS, () =>
      this.prisma.experience.findMany({
        where: { locale },
        orderBy: { sortOrder: 'asc' },
      }),
    );
  }
}
