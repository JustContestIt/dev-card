import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { SkillCategory } from '../../graphql/enums';

@ObjectType('Skill')
export class SkillModel {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => SkillCategory)
  category!: SkillCategory;

  @Field(() => Int, { description: 'Self-assessment, 1..5' })
  level!: number;

  @Field(() => Float)
  yearsUsed!: number;

  @Field()
  featured!: boolean;

  @Field(() => Int)
  endorsements!: number;
}
