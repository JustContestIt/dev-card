import { Field, ObjectType } from '@nestjs/graphql';
import { Locale } from '../../graphql/enums';

@ObjectType('Project')
export class ProjectModel {
  @Field()
  id!: string;

  @Field()
  slug!: string;

  @Field(() => Locale)
  locale!: Locale;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field(() => [String], { description: 'Raw tech names; see also `skills` for typed entities' })
  stack!: string[];

  @Field(() => String, { nullable: true })
  repoUrl!: string | null;

  @Field(() => String, { nullable: true })
  liveUrl!: string | null;

  @Field()
  highlight!: boolean;
}
