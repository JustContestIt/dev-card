import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('SendMessageResult')
export class SendMessageResultModel {
  @Field()
  id!: string;

  @Field()
  createdAt!: Date;

  @Field({ description: 'Human-readable confirmation in the request locale' })
  confirmation!: string;
}
