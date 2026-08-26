import { Module } from '@nestjs/common';
import { SkillsModule } from '../skills/skills.module';
import { ProjectsResolver } from './projects.resolver';
import { ProjectsService } from './projects.service';

@Module({
  imports: [SkillsModule],
  providers: [ProjectsService, ProjectsResolver],
})
export class ProjectsModule {}
