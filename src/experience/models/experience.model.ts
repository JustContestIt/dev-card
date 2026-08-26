import { Field, ObjectType } from '@nestjs/graphql';
import { Locale } from '../../graphql/enums';

@ObjectType('Experience')
export class ExperienceModel {
  @Field()
  id!: string;

  @Field(() => Locale)
  locale!: Locale;

  @Field()
  company!: string;

  @Field()
  role!: string;

  @Field()
  description!: string;

  @Field()
  startDate!: Date;

  @Field(() => Date, { nullable: true, description: 'null — до настоящего времени' })
  endDate!: Date | null;

  @Field(() => [String])
  stack!: string[];
}
