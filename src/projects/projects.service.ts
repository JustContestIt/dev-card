import { Injectable } from '@nestjs/common';
import { Locale, Project } from '@prisma/client';
import { TtlCacheService } from '../common/ttl-cache.service';
import { PrismaService } from '../prisma/prisma.service';

const CACHE_TTL_MS = 60_000;

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: TtlCacheService,
  ) {}

  async list(locale: Locale, highlightedOnly = false): Promise<Project[]> {
    const key = `projects:${locale}:${highlightedOnly}`;
    return this.cache.wrap(key, CACHE_TTL_MS, () =>
      this.prisma.project.findMany({
        where: { locale, ...(highlightedOnly ? { highlight: true } : {}) },
        orderBy: { sortOrder: 'asc' },
      }),
    );
  }
}
