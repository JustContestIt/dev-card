import { registerEnumType } from '@nestjs/graphql';
import { Locale, SkillCategory } from '@prisma/client';

registerEnumType(Locale, {
  name: 'Locale',
  description: 'Card content language',
});

registerEnumType(SkillCategory, {
  name: 'SkillCategory',
});

export { Locale, SkillCategory };
