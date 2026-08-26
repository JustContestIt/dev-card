Add a new field to an existing entity end-to-end: $ARGUMENTS

Checklist (follow in order):
1. prisma/schema.prisma — add the column
2. `npm run prisma:migrate -- --name add-<field>` — generate the migration
3. src/<feature>/models/*.model.ts — expose it in the GraphQL type (or skip if internal)
4. src/content/card-content.ts + src/content/seed-database.ts — seed data if it is content
5. web/src/api.ts + gui.ts / tty.ts — render it if user-facing
6. Tests: extend the relevant spec; run `npm test` and `npm run test:e2e`
7. Commit schema.prisma + migration + schema.gql + code in one commit
