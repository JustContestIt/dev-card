import { Injectable } from '@nestjs/common';
import { Skill } from '@prisma/client';
import DataLoader from 'dataloader';
import { SkillsService } from './skills.service';

export interface GqlLoaders {
  skillByName: DataLoader<string, Skill | null>;
}

/**
 * DataLoader factory — the classic answer to the GraphQL N+1 problem.
 *
 * `Project.skills` is a resolve-field: without batching, a list of 10 projects
 * would fire 10 separate skill lookups. A fresh loader is created per request
 * (loaders must never be shared between requests — they cache per-request),
 * collapsing all lookups of one tick into a single `WHERE name IN (...)` query.
 */
@Injectable()
export class SkillsLoaderFactory {
  constructor(private readonly skillsService: SkillsService) {}

  create(): GqlLoaders {
    return {
      skillByName: new DataLoader<string, Skill | null>((names) =>
        this.skillsService.findByNames(names),
      ),
    };
  }
}
