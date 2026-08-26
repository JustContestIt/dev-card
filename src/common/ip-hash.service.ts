import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.validation';

/**
 * Privacy by design: raw visitor IPs are never persisted.
 * A salted SHA-256 hash is enough for rate limiting and rough uniqueness.
 */
@Injectable()
export class IpHashService {
  private readonly salt: string;

  constructor(config: ConfigService<Env, true>) {
    this.salt = config.get('IP_HASH_SALT', { infer: true });
  }

  hash(ip: string | undefined): string | null {
    if (!ip) {
      return null;
    }
    return createHash('sha256').update(`${this.salt}:${ip}`).digest('hex');
  }
}
