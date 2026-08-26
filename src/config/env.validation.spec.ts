import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  const minimal = { DATABASE_URL: 'postgresql://root@localhost:26257/db' };

  it('applies documented defaults', () => {
    const env = validateEnv(minimal);

    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(3000);
    expect(env.CONTACT_RATE_LIMIT).toBe(3);
    expect(env.LOG_LEVEL).toBe('info');
  });

  it('coerces numeric strings from the environment', () => {
    const env = validateEnv({ ...minimal, PORT: '8080', CONTACT_RATE_LIMIT: '5' });

    expect(env.PORT).toBe(8080);
    expect(env.CONTACT_RATE_LIMIT).toBe(5);
  });

  it('fails fast without DATABASE_URL', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });

  it('rejects a non-numeric port with a readable message', () => {
    expect(() => validateEnv({ ...minimal, PORT: 'abc' })).toThrow(/PORT/);
  });

  it('rejects unknown log levels', () => {
    expect(() => validateEnv({ ...minimal, LOG_LEVEL: 'verbose' })).toThrow(/LOG_LEVEL/);
  });
});
