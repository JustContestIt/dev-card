import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContactMessage } from '@prisma/client';
import { GraphQLError } from 'graphql';
import type { Env } from '../config/env.validation';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageInput } from './dto/send-message.input';

const WINDOW_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class ContactService {
  private readonly hourlyLimit: number;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService<Env, true>,
  ) {
    this.hourlyLimit = config.get('CONTACT_RATE_LIMIT', { infer: true });
  }

  /**
   * Rate limiting here is database-backed on purpose: unlike the in-memory
   * ThrottlerGuard (which also protects this mutation from bursts), the DB
   * check survives restarts and works across replicas.
   */
  async send(input: SendMessageInput, ipHash: string | null): Promise<ContactMessage> {
    if (ipHash) {
      const recent = await this.prisma.contactMessage.count({
        where: {
          ipHash,
          createdAt: { gte: new Date(Date.now() - WINDOW_MS) },
        },
      });
      if (recent >= this.hourlyLimit) {
        throw new GraphQLError(
          `Message limit reached (${this.hourlyLimit}/hour). Please try again later.`,
          { extensions: { code: 'RATE_LIMITED', limit: this.hourlyLimit, windowSeconds: 3600 } },
        );
      }
    }

    return this.prisma.contactMessage.create({
      data: { ...input, ipHash },
    });
  }
}
