import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, Length } from 'class-validator';

@InputType()
export class SendMessageInput {
  @Field()
  @Length(2, 80)
  name!: string;

  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @Length(10, 2000)
  message!: string;
}
