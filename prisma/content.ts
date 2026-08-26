/**
 * ЕДИНСТВЕННЫЙ источник личного контента визитки.
 * Отредактируй этот файл под себя и выполни `npm run prisma:seed`.
 * Поля, помеченные TODO, обязательно замени на реальные данные.
 */

export const profiles = [
  {
    locale: 'RU' as const,
    fullName: 'Никита Берёза',
    title: 'TypeScript Backend-разработчик',
    summary:
      'Разрабатываю надёжные backend-сервисы на TypeScript: NestJS, GraphQL, Prisma, ' +
      'PostgreSQL/CockroachDB, Docker. Пишу код, который легко читать, тестировать и ' +
      'сопровождать: строгая типизация, миграции, health-чеки, rate limiting и CI из коробки. ' +
      'Использую Claude Code как инструмент ускорения — с обязательным ревью и тестами, без вайб-кодинга.',
    location: 'Remote', // TODO: город/страна, например «Алматы, Казахстан»
    email: 'nikita.beryoza@gmail.com',
    github: 'https://github.com/JustContestIt',
    telegram: 'https://t.me/your_telegram', // TODO: реальный Telegram
    websiteUrl: null,
    openToWork: true,
  },
  {
    locale: 'EN' as const,
    fullName: 'Nikita Beryoza',
    title: 'TypeScript Backend Developer',
    summary:
      'I build reliable TypeScript backends: NestJS, GraphQL, Prisma, PostgreSQL/CockroachDB, ' +
      'Docker. I ship code that is easy to read, test and maintain — strict typing, migrations, ' +
      'health checks, rate limiting and CI included. I use Claude Code as an accelerator — ' +
      'always with review and tests, never vibe-coding.',
    location: 'Remote', // TODO
    email: 'nikita.beryoza@gmail.com',
    github: 'https://github.com/JustContestIt',
    telegram: 'https://t.me/your_telegram', // TODO
    websiteUrl: null,
    openToWork: true,
  },
];

export const skills = [
  // category: LANGUAGE | BACKEND | DATABASE | DEVOPS | TOOLING, level: 1..5
  { name: 'TypeScript', category: 'LANGUAGE' as const, level: 5, yearsUsed: 4, featured: true, sortOrder: 1 },
  { name: 'Node.js', category: 'BACKEND' as const, level: 5, yearsUsed: 4, featured: true, sortOrder: 2 },
  { name: 'NestJS', category: 'BACKEND' as const, level: 4, yearsUsed: 3, featured: true, sortOrder: 3 },
  { name: 'GraphQL', category: 'BACKEND' as const, level: 4, yearsUsed: 3, featured: true, sortOrder: 4 },
  { name: 'Prisma', category: 'DATABASE' as const, level: 4, yearsUsed: 3, featured: true, sortOrder: 5 },
  { name: 'PostgreSQL', category: 'DATABASE' as const, level: 4, yearsUsed: 4, featured: false, sortOrder: 6 },
  { name: 'CockroachDB', category: 'DATABASE' as const, level: 3, yearsUsed: 1, featured: true, sortOrder: 7 },
  { name: 'Docker', category: 'DEVOPS' as const, level: 4, yearsUsed: 3, featured: true, sortOrder: 8 },
  { name: 'Git', category: 'TOOLING' as const, level: 5, yearsUsed: 5, featured: false, sortOrder: 9 },
  { name: 'GitHub Actions', category: 'DEVOPS' as const, level: 4, yearsUsed: 2, featured: false, sortOrder: 10 },
  { name: 'REST API', category: 'BACKEND' as const, level: 5, yearsUsed: 4, featured: false, sortOrder: 11 },
  { name: 'Jest', category: 'TOOLING' as const, level: 4, yearsUsed: 3, featured: false, sortOrder: 12 },
  { name: 'S3 Storage', category: 'DEVOPS' as const, level: 3, yearsUsed: 2, featured: false, sortOrder: 13 },
  { name: 'Claude Code', category: 'TOOLING' as const, level: 4, yearsUsed: 1, featured: true, sortOrder: 14 },
];

// TODO: замени опыт на реальные места работы
export const experience = [
  {
    slugOrder: 1,
    startDate: new Date('2023-01-01'),
    endDate: null,
    stack: ['TypeScript', 'NestJS', 'PostgreSQL', 'Prisma', 'Docker'],
    ru: {
      company: 'Коммерческая разработка', // TODO
      role: 'Backend-разработчик',
      description:
        'Проектирование и разработка backend-сервисов: REST/GraphQL API, схемы данных и миграции, ' +
        'интеграции с внешними сервисами, контейнеризация и CI/CD. Код-ревью и написание тестов.',
    },
    en: {
      company: 'Commercial development', // TODO
      role: 'Backend Developer',
      description:
        'Design and development of backend services: REST/GraphQL APIs, data schemas and migrations, ' +
        'third-party integrations, containerization and CI/CD. Code review and testing.',
    },
  },
  {
    slugOrder: 2,
    startDate: new Date('2021-06-01'),
    endDate: new Date('2022-12-31'),
    stack: ['JavaScript', 'Node.js', 'Express', 'MongoDB'],
    ru: {
      company: 'Фриланс-проекты', // TODO
      role: 'Fullstack-разработчик',
      description:
        'Разработка веб-приложений под ключ: от постановки задачи до деплоя. ' +
        'Работа напрямую с заказчиками, оценка сроков, поддержка после релиза.',
    },
    en: {
      company: 'Freelance projects', // TODO
      role: 'Fullstack Developer',
      description:
        'End-to-end web application development: from requirements to deployment. ' +
        'Worked directly with clients, estimated timelines, provided post-release support.',
    },
  },
];

export const projects = [
  {
    slug: 'dev-card',
    stack: ['TypeScript', 'NestJS', 'GraphQL', 'Prisma', 'CockroachDB', 'Docker', 'Claude Code'],
    repoUrl: 'https://github.com/JustContestIt/dev-card', // TODO: реальная ссылка после пуша
    liveUrl: null, // TODO: ссылка после деплоя
    highlight: true,
    sortOrder: 1,
    ru: {
      name: 'Эта визитка',
      description:
        'Цифровая визитка, которую вы сейчас смотрите: NestJS + code-first GraphQL + Prisma + ' +
        'CockroachDB. Rate limiting, кеширование, DataLoader против N+1, health-чеки, ' +
        'миграции, e2e-тесты, CI и multi-stage Docker-сборка.',
    },
    en: {
      name: 'This very card',
      description:
        'The digital business card you are looking at: NestJS + code-first GraphQL + Prisma + ' +
        'CockroachDB. Rate limiting, caching, DataLoader against N+1, health checks, ' +
        'migrations, e2e tests, CI and a multi-stage Docker build.',
    },
  },
  // TODO: добавь 1-2 реальных проекта по этому образцу
  {
    slug: 'api-service',
    stack: ['TypeScript', 'NestJS', 'PostgreSQL', 'Prisma', 'Docker'],
    repoUrl: null,
    liveUrl: null,
    highlight: false,
    sortOrder: 2,
    ru: {
      name: 'Сервис API (пример)',
      description: 'Замени этот блок описанием реального проекта: что делал, какой стек, какой результат.',
    },
    en: {
      name: 'API service (placeholder)',
      description: 'Replace this block with a real project: what you built, the stack, the outcome.',
    },
  },
];
