import { Field, ObjectType } from '@nestjs/graphql';
import { Locale } from '../../graphql/enums';

@ObjectType('Profile')
export class ProfileModel {
  @Field()
  id!: string;

  @Field(() => Locale)
  locale!: Locale;

  @Field()
  fullName!: string;

  @Field()
  title!: string;

  @Field()
  summary!: string;

  @Field()
  location!: string;

  @Field()
  email!: string;

  @Field()
  github!: string;

  @Field()
  telegram!: string;

  @Field(() => String, { nullable: true })
  websiteUrl!: string | null;

  @Field()
  openToWork!: boolean;

  @Field()
  updatedAt!: Date;
}
