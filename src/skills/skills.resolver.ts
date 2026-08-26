import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import { SkillCategory } from '../graphql/enums';
import { SkillModel } from './models/skill.model';
import { SkillsService } from './skills.service';

@Resolver(() => SkillModel)
export class SkillsResolver {
  constructor(private readonly skillsService: SkillsService) {}

  @Query(() => [SkillModel], { description: 'Tech stack, grouped by category on the card' })
  async skills(
    @Args('category', { type: () => SkillCategory, nullable: true })
    category?: SkillCategory,
    @Args('featuredOnly', { defaultValue: false }) featuredOnly?: boolean,
  ): Promise<SkillModel[]> {
    return this.skillsService.list(category, featuredOnly);
  }

  @Mutation(() => SkillModel, { description: 'Upvote a skill you find relevant (rate-limited)' })
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async endorseSkill(@Args('name') name: string): Promise<SkillModel> {
    return this.skillsService.endorse(name);
  }
}
