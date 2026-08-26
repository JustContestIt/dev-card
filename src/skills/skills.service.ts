import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Skill, SkillCategory } from '@prisma/client';
import { TtlCacheService } from '../common/ttl-cache.service';
import { PrismaService } from '../prisma/prisma.service';

const CACHE_TTL_MS = 60_000;
const CACHE_PREFIX = 'skills:';

@Injectable()
export class SkillsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: TtlCacheService,
  ) {}

  async list(category?: SkillCategory, featuredOnly = false): Promise<Skill[]> {
    const key = `${CACHE_PREFIX}${category ?? 'all'}:${featuredOnly}`;
    return this.cache.wrap(key, CACHE_TTL_MS, () =>
      this.prisma.skill.findMany({
        where: {
          ...(category ? { category } : {}),
          ...(featuredOnly ? { featured: true } : {}),
        },
        orderBy: { sortOrder: 'asc' },
      }),
    );
  }

  /** Batch lookup for DataLoader: one SELECT for any number of requested names. */
  async findByNames(names: readonly string[]): Promise<(Skill | null)[]> {
    const found = await this.prisma.skill.findMany({
      where: { name: { in: [...names] } },
    });
    const byName = new Map(found.map((s) => [s.name, s]));
    return names.map((name) => byName.get(name) ?? null);
  }

  async endorse(name: string): Promise<Skill> {
    try {
      const skill = await this.prisma.skill.update({
        where: { name },
        data: { endorsements: { increment: 1 } },
      });
      // The card shows endorsement counts — drop cached lists so the click is visible.
      this.cache.invalidate(CACHE_PREFIX);
      return skill;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException(`Unknown skill: ${name}`);
      }
      throw e;
    }
  }
}
