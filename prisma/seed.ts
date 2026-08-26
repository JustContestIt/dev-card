/* eslint-disable no-console */
import { PrismaClient, Locale, SkillCategory } from '@prisma/client';
import { profiles, skills, experience, projects } from './content';

const prisma = new PrismaClient();

async function main() {
  // Content tables are fully re-seeded (idempotent).
  // User-generated data (ContactMessage, PageView, endorsements) is preserved.
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

  const counts = {
    profiles: await prisma.profile.count(),
    skills: await prisma.skill.count(),
    experience: await prisma.experience.count(),
    projects: await prisma.project.count(),
  };
  console.log('Seed complete:', counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
