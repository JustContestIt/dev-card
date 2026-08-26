import { Args, Query, Resolver } from '@nestjs/graphql';
import { Locale } from '../graphql/enums';
import { ProfileModel } from './models/profile.model';
import { ProfileService } from './profile.service';

@Resolver(() => ProfileModel)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => ProfileModel, { description: 'The card owner, in the requested language' })
  async profile(
    @Args('locale', { type: () => Locale, defaultValue: Locale.RU }) locale: Locale,
  ): Promise<ProfileModel> {
    return this.profileService.getProfile(locale);
  }
}
