import { Global, Module } from '@nestjs/common';
import { IpHashService } from './ip-hash.service';
import { TtlCacheService } from './ttl-cache.service';

@Global()
@Module({
  providers: [TtlCacheService, IpHashService],
  exports: [TtlCacheService, IpHashService],
})
export class CommonModule {}
