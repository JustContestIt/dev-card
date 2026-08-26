process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { AbstractLoader, ExpressLoader } from '@nestjs/serve-static';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

interface GqlResponse {
  data?: Record<string, unknown>;
  errors?: { message: string; extensions?: { code?: string } }[];
}

describe('dev-card (e2e)', () => {
  let app: NestExpressApplication;

  const gql = (query: string, variables?: Record<string, unknown>) =>
    request(app.getHttpServer())
      .post('/graphql')
      .set('content-type', 'application/json')
      .send({ query, variables });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      // In the testing context the HTTP adapter does not exist yet at compile()
      // time, so ServeStaticModule silently falls back to a NoopLoader.
      // Restore the real loader — the static frontend is part of the contract.
      .overrideProvider(AbstractLoader)
      .useValue(new ExpressLoader())
      .compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('health', () => {
    it('GET /health/live → 200 ok', async () => {
      const res = await request(app.getHttpServer()).get('/health/live').expect(200);
      expect((res.body as { status: string }).status).toBe('ok');
    });

    it('GET /health/ready → 200 with database up', async () => {
      const res = await request(app.getHttpServer()).get('/health/ready').expect(200);
      const body = res.body as { details: { database: { status: string } } };
      expect(body.details.database.status).toBe('up');
    });
  });

  describe('GraphQL queries', () => {
    it('returns the full card in one round-trip', async () => {
      const res = await gql(
        `query Card($locale: Locale!) {
          profile(locale: $locale) { fullName title openToWork }
          skills { name level endorsements }
          experience(locale: $locale) { company role }
          projects(locale: $locale) { name stack skills { name category } }
          stats { totalViews version }
        }`,
        { locale: 'RU' },
      ).expect(200);

      const body = res.body as GqlResponse;
      expect(body.errors).toBeUndefined();
      const data = body.data as {
        profile: { fullName: string };
        skills: unknown[];
        projects: { skills: { name: string }[] }[];
      };
      expect(data.profile.fullName.length).toBeGreaterThan(0);
      expect(data.skills.length).toBeGreaterThan(5);
      // DataLoader resolve-field: stack names resolved into Skill entities
      expect(data.projects[0].skills.length).toBeGreaterThan(0);
    });

    it('serves both locales', async () => {
      const ru = await gql(`{ profile(locale: RU) { title } }`).expect(200);
      const en = await gql(`{ profile(locale: EN) { title } }`).expect(200);

      const titleRu = (ru.body as GqlResponse).data?.profile as { title: string };
      const titleEn = (en.body as GqlResponse).data?.profile as { title: string };
      expect(titleRu.title).not.toEqual(titleEn.title);
    });

    it('rejects malformed queries at the validation phase', async () => {
      const res = await gql(`{ profile(locale: RU) { noSuchField } }`);
      const body = res.body as GqlResponse;
      expect(body.errors?.[0].extensions?.code).toBe('GRAPHQL_VALIDATION_FAILED');
      expect(body.errors?.[0].message).toMatch(/noSuchField/);
    });
  });

  describe('GraphQL mutations', () => {
    it('endorseSkill increments the counter', async () => {
      const before = await gql(`{ skills(featuredOnly: true) { name endorsements } }`);
      const skills = (before.body as GqlResponse).data?.skills as {
        name: string;
        endorsements: number;
      }[];
      const target = skills[0];

      const res = await gql(
        `mutation($name: String!) { endorseSkill(name: $name) { name endorsements } }`,
        { name: target.name },
      ).expect(200);

      const updated = (res.body as GqlResponse).data?.endorseSkill as { endorsements: number };
      expect(updated.endorsements).toBe(target.endorsements + 1);
    });

    it('maps unknown skills to NOT_FOUND', async () => {
      const res = await gql(`mutation { endorseSkill(name: "Cobol") { name } }`);
      const body = res.body as GqlResponse;
      expect(body.errors?.[0].extensions?.code).toBe('NOT_FOUND');
    });

    it('rejects invalid contact input with readable validation details', async () => {
      const res = await gql(
        `mutation { sendMessage(input: { name: "A", email: "nope", message: "short" }) { id } }`,
      );
      const body = res.body as GqlResponse;
      expect(body.errors?.[0].extensions?.code).toBe('BAD_REQUEST');
      expect(body.errors?.[0].message).toMatch(/email must be an email/);
    });
  });

  describe('REST endpoints', () => {
    it('GET /vcard.vcf returns a downloadable vCard', async () => {
      const res = await request(app.getHttpServer()).get('/vcard.vcf').expect(200);

      expect(res.headers['content-type']).toContain('text/vcard');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.text).toContain('BEGIN:VCARD');
      expect(res.text).toContain('VERSION:4.0');
    });

    it('serves the card frontend at /', async () => {
      const res = await request(app.getHttpServer()).get('/').expect(200);
      expect(res.headers['content-type']).toContain('text/html');
      expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    });
  });
});
