import { Injectable, NotFoundException } from '@nestjs/common';
import { Locale, Profile } from '@prisma/client';
import { TtlCacheService } from '../common/ttl-cache.service';
import { PrismaService } from '../prisma/prisma.service';

const CACHE_TTL_MS = 60_000;

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: TtlCacheService,
  ) {}

  async getProfile(locale: Locale): Promise<Profile> {
    const profile = await this.cache.wrap(`profile:${locale}`, CACHE_TTL_MS, () =>
      this.prisma.profile.findUnique({ where: { locale } }),
    );
    if (!profile) {
      throw new NotFoundException(`Profile for locale ${locale} is not seeded`);
    }
    return profile;
  }
}
