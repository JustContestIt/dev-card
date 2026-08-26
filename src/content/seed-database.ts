import { Locale, PrismaClient, SkillCategory } from '@prisma/client';
import { experience, profiles, projects, skills } from './card-content';

/**
 * Framework-free seeding logic, shared by:
 *  - `prisma db seed` (CLI, local development)
 *  - SeederService (auto-seed on boot when the database is empty)
 *
 * Content tables are fully re-created; user-generated data
 * (contact messages, page views, endorsement counts) is preserved.
 */
export async function seedDatabase(prisma: PrismaClient): Promise<Record<string, number>> {
  const existingSkills = await prisma.skill.findMany({
    select: { name: true, endorsements: true },
  });
  const endorsementsByName = new Map(existingSkills.map((s) => [s.name, s.endorsements]));

  await prisma.$transaction([
    prisma.profile.deleteMany(),
    prisma.experience.deleteMany(),
    prisma.project.deleteMany(),
    prisma.skill.deleteMany(),
  ]);

  await prisma.profile.createMany({
    data: profiles.map((p) => ({ ...p, locale: Locale[p.locale] })),
  });

  await prisma.skill.createMany({
    data: skills.map((s) => ({
      ...s,
      category: SkillCategory[s.category],
      endorsements: endorsementsByName.get(s.name) ?? 0,
    })),
  });

  await prisma.experience.createMany({
    data: experience.flatMap((e) =>
      (['ru', 'en'] as const).map((loc) => ({
        locale: loc === 'ru' ? Locale.RU : Locale.EN,
        company: e[loc].company,
        role: e[loc].role,
        description: e[loc].description,
        startDate: e.startDate,
        endDate: e.endDate,
        stack: e.stack,
        sortOrder: e.slugOrder,
      })),
    ),
  });

  await prisma.project.createMany({
    data: projects.flatMap((p) =>
      (['ru', 'en'] as const).map((loc) => ({
        slug: p.slug,
        locale: loc === 'ru' ? Locale.RU : Locale.EN,
        name: p[loc].name,
        description: p[loc].description,
        stack: p.stack,
        repoUrl: p.repoUrl,
        liveUrl: p.liveUrl,
        highlight: p.highlight,
        sortOrder: p.sortOrder,
      })),
    ),
  });

  return {
    profiles: await prisma.profile.count(),
    skills: await prisma.skill.count(),
    experience: await prisma.experience.count(),
    projects: await prisma.project.count(),
  };
}
