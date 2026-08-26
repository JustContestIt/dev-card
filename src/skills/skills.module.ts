import { Module } from '@nestjs/common';
import { SkillsLoaderFactory } from './skills.loader';
import { SkillsResolver } from './skills.resolver';
import { SkillsService } from './skills.service';

@Module({
  providers: [SkillsService, SkillsResolver, SkillsLoaderFactory],
  exports: [SkillsService, SkillsLoaderFactory],
})
export class SkillsModule {}
