import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { IpHashService } from '../common/ip-hash.service';
import { ContactService } from './contact.service';
import { SendMessageInput } from './dto/send-message.input';
import { SendMessageResultModel } from './models/send-message-result.model';

@Resolver()
export class ContactResolver {
  constructor(
    private readonly contactService: ContactService,
    private readonly ipHash: IpHashService,
  ) {}

  @Mutation(() => SendMessageResultModel, {
    description: 'Leave a message for the card owner (validated + rate-limited)',
  })
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async sendMessage(
    @Args('input') input: SendMessageInput,
    @Context('req') req: Request,
  ): Promise<SendMessageResultModel> {
    const saved = await this.contactService.send(input, this.ipHash.hash(req.ip));
    return {
      id: saved.id,
      createdAt: saved.createdAt,
      confirmation: 'Message received — I will get back to you soon.',
    };
  }
}
