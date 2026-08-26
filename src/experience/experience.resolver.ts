import { Args, Query, Resolver } from '@nestjs/graphql';
import { Locale } from '../graphql/enums';
import { ExperienceModel } from './models/experience.model';
import { ExperienceService } from './experience.service';

@Resolver(() => ExperienceModel)
export class ExperienceResolver {
  constructor(private readonly experienceService: ExperienceService) {}

  @Query(() => [ExperienceModel], { description: 'Work history, newest first' })
  async experience(
    @Args('locale', { type: () => Locale, defaultValue: Locale.RU }) locale: Locale,
  ): Promise<ExperienceModel[]> {
    return this.experienceService.list(locale);
  }
}
