import { Locale, PrismaClient, SkillCategory } from '@prisma/client';
import { experience, profiles, projects, skills } from './card-content';

/**
 * Framework-free seeding logic, shared by:
 *  - `prisma db seed` (CLI, local development)
 *  - SeederService (auto-seed on boot when the database is empty)
 *
 * Runs as ONE transaction: a failed re-seed must never leave the card
 * half-empty. Content tables are fully re-created; user-generated data
 * (contact messages, page views, endorsement counts) is preserved.
 */
export async function seedDatabase(prisma: PrismaClient): Promise<Record<string, number>> {
  return prisma.$transaction(async (tx) => {
    const existingSkills = await tx.skill.findMany({
      select: { name: true, endorsements: true },
    });
    const endorsementsByName = new Map(existingSkills.map((s) => [s.name, s.endorsements]));

    await tx.profile.deleteMany();
    await tx.experience.deleteMany();
    await tx.project.deleteMany();
    await tx.skill.deleteMany();

    await tx.profile.createMany({
      data: profiles.map((p) => ({ ...p, locale: Locale[p.locale] })),
    });

    await tx.skill.createMany({
      data: skills.map((s) => ({
        ...s,
        category: SkillCategory[s.category],
        endorsements: endorsementsByName.get(s.name) ?? 0,
      })),
    });

    await tx.experience.createMany({
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

    await tx.project.createMany({
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
      profiles: await tx.profile.count(),
      skills: await tx.skill.count(),
      experience: await tx.experience.count(),
      projects: await tx.project.count(),
    };
  });
}
