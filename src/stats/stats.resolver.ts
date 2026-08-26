import { BadRequestException } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Request } from 'express';
import { IpHashService } from '../common/ip-hash.service';
import { StatsModel } from './models/stats.model';
import { StatsService } from './stats.service';

@Resolver(() => StatsModel)
export class StatsResolver {
  constructor(
    private readonly statsService: StatsService,
    private readonly ipHash: IpHashService,
  ) {}

  @Query(() => StatsModel, { description: 'Live counters of this very card' })
  async stats(): Promise<StatsModel> {
    return this.statsService.getStats();
  }

  @Mutation(() => Int, {
    description: 'Register a page view; returns the total for that path',
  })
  async trackView(
    @Args('path', { defaultValue: '/' }) path: string,
    @Context('req') req: Request,
  ): Promise<number> {
    if (!path.startsWith('/') || path.length > 200) {
      throw new BadRequestException('path must start with "/" and be at most 200 chars');
    }
    return this.statsService.trackView(path, this.ipHash.hash(req.ip));
  }
}
