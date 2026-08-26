import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Stats')
export class StatsModel {
  @Field(() => Int)
  totalViews!: number;

  @Field(() => Int, { description: 'Distinct hashed visitors — raw IPs are never stored' })
  uniqueVisitors!: number;

  @Field(() => Int)
  messagesReceived!: number;

  @Field(() => Int)
  totalEndorsements!: number;

  @Field(() => Int)
  uptimeSeconds!: number;

  @Field()
  version!: string;

  @Field()
  environment!: string;
}
