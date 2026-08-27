/**
 * ЕДИНСТВЕННЫЙ источник личного контента визитки.
 * Данные синхронизированы с резюме (public/cv/*.pdf).
 * После правок выполни `npm run prisma:seed`.
 */

export const profiles = [
  {
    locale: 'RU' as const,
    fullName: 'Никита Берёза',
    title: 'TypeScript Backend-разработчик',
    summary:
      'Backend-разработчик с 3+ годами опыта: Node.js/NestJS, проектирование API, ' +
      'платежи и подписки, Kafka и уведомления в реальном времени. Пишу код, который ' +
      'легко читать, тестировать и сопровождать: строгая типизация, миграции, health-чеки, ' +
      'rate limiting и CI из коробки. Использую Claude Code как инструмент ускорения — ' +
      'с обязательным ревью и тестами, без вайб-кодинга.',
    location: 'Санкт-Петербург · remote',
    email: 'nikita.beryoza@gmail.com',
    github: 'https://github.com/JustContestIt',
    telegram: 'https://t.me/nberyoza',
    websiteUrl: null,
    openToWork: true,
  },
  {
    locale: 'EN' as const,
    fullName: 'Nikita Beryoza',
    title: 'TypeScript Backend Developer',
    summary:
      'Backend developer with 3+ years of experience: Node.js/NestJS, API design, ' +
      'payments and subscriptions, Kafka and real-time notifications. I ship code that is ' +
      'easy to read, test and maintain — strict typing, migrations, health checks, ' +
      'rate limiting and CI included. I use Claude Code as an accelerator — ' +
      'always with review and tests, never vibe-coding.',
    location: 'Saint Petersburg · remote',
    email: 'nikita.beryoza@gmail.com',
    github: 'https://github.com/JustContestIt',
    telegram: 'https://t.me/nberyoza',
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
  { name: 'Kafka', category: 'BACKEND' as const, level: 3, yearsUsed: 1, featured: false, sortOrder: 12 },
  { name: 'Jest', category: 'TOOLING' as const, level: 4, yearsUsed: 3, featured: false, sortOrder: 13 },
  { name: 'S3 Storage', category: 'DEVOPS' as const, level: 3, yearsUsed: 2, featured: false, sortOrder: 14 },
  { name: 'Claude Code', category: 'TOOLING' as const, level: 4, yearsUsed: 1, featured: true, sortOrder: 15 },
];

export const experience = [
  {
    slugOrder: 1,
    startDate: new Date('2025-04-01'),
    endDate: new Date('2025-10-31'),
    stack: ['TypeScript', 'NestJS', 'TypeORM', 'Next.js', 'Jest'],
    ru: {
      company: 'Pandaverse OÜ',
      role: 'Full-stack разработчик',
      description:
        'Онлайн-планировщик на 1000+ пользователей: серверная часть на NestJS + TypeORM ' +
        'с современными архитектурными паттернами, интерфейс на Next.js. Оптимизировал ' +
        'производительность приложения на 70%, отрефакторил кодовую базу и довёл покрытие ' +
        'тестами на Jest до 80%.',
    },
    en: {
      company: 'Pandaverse OÜ',
      role: 'Full-stack Developer',
      description:
        'Online scheduler serving 1000+ users: backend on NestJS + TypeORM with modern ' +
        'architectural patterns, UI on Next.js. Optimized application performance by 70%, ' +
        'refactored the codebase and brought Jest test coverage to 80%.',
    },
  },
  {
    slugOrder: 2,
    startDate: new Date('2024-05-01'),
    endDate: new Date('2025-03-31'),
    stack: ['TypeScript', 'NestJS', 'Kafka', 'Docker'],
    ru: {
      company: 'Dipal',
      role: 'Backend-разработчик',
      description:
        'Сервис подписок и платежей на NestJS, обрабатывающий ~1000 транзакций в день. ' +
        'Кросс-платформенные push-уведомления (iOS/Android), обработка событий из Kafka, ' +
        'управление локальными серверами; руководил миграцией инфраструктуры брокера ' +
        'сообщений и пакетного менеджера.',
    },
    en: {
      company: 'Dipal',
      role: 'Backend Developer',
      description:
        'Subscriptions and payments service on NestJS handling ~1000 transactions per day. ' +
        'Cross-platform push notifications (iOS/Android), Kafka event processing, local ' +
        'server management; led the migration of the message broker and package manager ' +
        'infrastructure.',
    },
  },
  {
    slugOrder: 3,
    startDate: new Date('2023-04-01'),
    endDate: new Date('2023-09-30'),
    stack: ['Flutter', 'Dart', 'JWT'],
    ru: {
      company: 'Стартап «Мой доктор»',
      role: 'Flutter-разработчик',
      description:
        'Модуль авторизации с нуля: вход, регистрация, JWT-аутентификация. ' +
        'Личный кабинет пользователя, дизайн и архитектура приложения.',
    },
    en: {
      company: 'Startup “My Doctor”',
      role: 'Flutter Developer',
      description:
        'Authentication module from scratch: login, registration, JWT-based auth. ' +
        'User account area, application design and architecture.',
    },
  },
  {
    slugOrder: 4,
    startDate: new Date('2022-06-01'),
    endDate: new Date('2023-01-31'),
    stack: ['Node.js', 'React', 'Figma'],
    ru: {
      company: 'M&C Training Center',
      role: 'Full-stack разработчик',
      description:
        'Проектирование интерфейсов в Figma, оптимизация базы данных и backend-сервера ' +
        'на Node.js, внедрение и обновление UI на React.',
    },
    en: {
      company: 'M&C Training Center',
      role: 'Full-stack Developer',
      description:
        'UI design in Figma, database and Node.js backend optimization, ' +
        'React UI implementation and updates.',
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
  {
    slug: 'course-platform',
    stack: ['TypeScript', 'React', 'Next.js', 'MongoDB'],
    repoUrl: null,
    liveUrl: null,
    highlight: false,
    sortOrder: 2,
    ru: {
      name: 'Платформа онлайн-курсов',
      description:
        'Дипломный проект ИТМО: платформа, где пользователи записываются на онлайн-курсы ' +
        'и проходят их. Управление курсами, личный кабинет, взаимодействие студентов ' +
        'и авторов курсов.',
    },
    en: {
      name: 'Online course platform',
      description:
        'ITMO thesis project: a platform where users enroll in and take online courses. ' +
        'Course management, user accounts, student and author interaction.',
    },
  },
];
