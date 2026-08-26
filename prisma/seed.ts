/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { seedDatabase } from '../src/content/seed-database';

const prisma = new PrismaClient();

seedDatabase(prisma)
  .then((counts) => {
    console.log('Seed complete:', counts);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
