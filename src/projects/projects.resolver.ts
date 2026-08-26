import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import type { Skill } from '@prisma/client';
import { Locale } from '../graphql/enums';
import { SkillModel } from '../skills/models/skill.model';
import { GqlLoaders } from '../skills/skills.loader';
import { ProjectModel } from './models/project.model';
import { ProjectsService } from './projects.service';

@Resolver(() => ProjectModel)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  @Query(() => [ProjectModel], { description: 'Selected projects' })
  async projects(
    @Args('locale', { type: () => Locale, defaultValue: Locale.RU }) locale: Locale,
    @Args('highlightedOnly', { defaultValue: false }) highlightedOnly?: boolean,
  ): Promise<ProjectModel[]> {
    return this.projectsService.list(locale, highlightedOnly);
  }

  /**
   * Stack entries that match a Skill are resolved into typed entities.
   * Batched through DataLoader: one SQL query per request, not per project (N+1).
   */
  @ResolveField(() => [SkillModel])
  async skills(
    @Parent() project: ProjectModel,
    @Context('loaders') loaders: GqlLoaders,
  ): Promise<SkillModel[]> {
    const results = await loaders.skillByName.loadMany(project.stack);
    return results.filter((r): r is Skill => r !== null && !(r instanceof Error));
  }
}
