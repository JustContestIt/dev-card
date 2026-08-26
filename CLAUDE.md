# dev-card — guidance for Claude Code

Digital business card: NestJS + code-first GraphQL + Prisma + CockroachDB,
static frontend (vanilla TS, esbuild) served by the same app.

## Commands

```bash
npm run start:dev      # dev server with watch (needs docker compose up -d db)
npm run build          # nest build + esbuild web bundle
npm run typecheck      # backend + web strict type checking
npm run lint           # eslint (type-aware for src/test, syntax-level for web)
npm test               # unit tests (no DB required)
npm run test:e2e       # e2e against a running CockroachDB
npm run prisma:migrate # create/apply a migration in dev
npm run prisma:seed    # re-seed card content (preserves user data)
```

## Architecture in one breath

`src/<feature>/{feature.module,resolver,service}.ts` + `models/` for GraphQL
object types. PrismaService is global; TtlCacheService and IpHashService come
from CommonModule (also global). GraphQL context carries per-request DataLoaders
(`skills.loader.ts`). HTTP concerns (helmet, CORS, pipes) live in
`app.setup.ts` — shared by main.ts and e2e so tests exercise production wiring.
Card content is data, not code: `src/content/card-content.ts`, seeded by
`prisma db seed` or automatically on boot when the DB is empty.

## Rules

- TypeScript strict; no `any` without an eslint-disable and a reason.
- Every resolver goes through a service; resolvers stay thin.
- New Prisma schema changes: `npm run prisma:migrate -- --name <what-changed>`,
  commit the generated SQL together with schema.prisma and schema.gql.
- List queries that hit the DB get cached via `TtlCacheService.wrap`;
  mutations that change cached data must `invalidate` the matching prefix.
- Errors: throw Nest HttpExceptions in services (formatError maps codes) or
  GraphQLError with an explicit `extensions.code` for domain errors.
- Never store raw IPs — only `IpHashService.hash` results.
- Before committing: `npm run typecheck && npm run lint && npm test`.
- Never commit `.env`; new variables go through `src/config/env.validation.ts`
  AND `.env.example`.

## Gotchas

- ts-jest runs transpile-only; type errors are caught by `npm run typecheck`.
- In e2e, ServeStaticModule needs the AbstractLoader override (see
  test/app.e2e-spec.ts) — the testing context has no HTTP adapter at compile().
- graphql-depth-limit ignores `__`-prefixed fields by design (Apollo Sandbox
  introspection must keep working).
