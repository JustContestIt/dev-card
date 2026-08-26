import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TtlCacheService } from '../common/ttl-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { SkillsService } from './skills.service';

const skill = (name: string, endorsements = 0) => ({
  id: name,
  name,
  category: 'BACKEND',
  level: 4,
  yearsUsed: 3,
  featured: false,
  endorsements,
  sortOrder: 1,
});

describe('SkillsService', () => {
  let service: SkillsService;
  let prisma: { skill: { findMany: jest.Mock; update: jest.Mock } };
  let cache: TtlCacheService;

  beforeEach(() => {
    prisma = {
      skill: {
        findMany: jest.fn().mockResolvedValue([skill('NestJS')]),
        update: jest.fn(),
      },
    };
    cache = new TtlCacheService();
    service = new SkillsService(prisma as unknown as PrismaService, cache);
  });

  it('serves repeated list calls from cache', async () => {
    await service.list();
    await service.list();
    expect(prisma.skill.findMany).toHaveBeenCalledTimes(1);
  });

  it('findByNames preserves request order and returns null for misses', async () => {
    prisma.skill.findMany.mockResolvedValue([skill('Docker'), skill('NestJS')]);

    const result = await service.findByNames(['NestJS', 'Cobol', 'Docker']);

    expect(result.map((r) => r?.name ?? null)).toEqual(['NestJS', null, 'Docker']);
    expect(prisma.skill.findMany).toHaveBeenCalledTimes(1);
  });

  it('endorse increments and invalidates the skills cache', async () => {
    prisma.skill.update.mockResolvedValue(skill('NestJS', 1));

    await service.list(); // warm cache
    await service.endorse('NestJS');
    await service.list(); // must hit the DB again

    expect(prisma.skill.update).toHaveBeenCalledWith({
      where: { name: 'NestJS' },
      data: { endorsements: { increment: 1 } },
    });
    expect(prisma.skill.findMany).toHaveBeenCalledTimes(2);
  });

  it('endorse maps Prisma P2025 to NotFoundException', async () => {
    prisma.skill.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('No record', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    await expect(service.endorse('Cobol')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('endorse rethrows unknown errors untouched', async () => {
    prisma.skill.update.mockRejectedValue(new Error('connection reset'));

    await expect(service.endorse('NestJS')).rejects.toThrow('connection reset');
  });
});
