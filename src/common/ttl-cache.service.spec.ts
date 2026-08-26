import { TtlCacheService } from './ttl-cache.service';

describe('TtlCacheService', () => {
  let cache: TtlCacheService;
  let now: number;

  beforeEach(() => {
    cache = new TtlCacheService();
    now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls the supplier once while the entry is fresh', async () => {
    const supplier = jest.fn().mockResolvedValue(42);

    await expect(cache.wrap('k', 60_000, supplier)).resolves.toBe(42);
    await expect(cache.wrap('k', 60_000, supplier)).resolves.toBe(42);

    expect(supplier).toHaveBeenCalledTimes(1);
  });

  it('re-fetches after the TTL expires', async () => {
    const supplier = jest.fn().mockResolvedValueOnce('old').mockResolvedValueOnce('new');

    await expect(cache.wrap('k', 60_000, supplier)).resolves.toBe('old');
    now += 60_001;
    await expect(cache.wrap('k', 60_000, supplier)).resolves.toBe('new');

    expect(supplier).toHaveBeenCalledTimes(2);
  });

  it('invalidates only keys with the given prefix', async () => {
    const skillsSupplier = jest.fn().mockResolvedValue('skills');
    const profileSupplier = jest.fn().mockResolvedValue('profile');

    await cache.wrap('skills:all', 60_000, skillsSupplier);
    await cache.wrap('profile:RU', 60_000, profileSupplier);

    cache.invalidate('skills:');

    await cache.wrap('skills:all', 60_000, skillsSupplier);
    await cache.wrap('profile:RU', 60_000, profileSupplier);

    expect(skillsSupplier).toHaveBeenCalledTimes(2);
    expect(profileSupplier).toHaveBeenCalledTimes(1);
  });

  it('does not cache a rejected supplier', async () => {
    const supplier = jest.fn().mockRejectedValueOnce(new Error('db down')).mockResolvedValueOnce(1);

    await expect(cache.wrap('k', 60_000, supplier)).rejects.toThrow('db down');
    await expect(cache.wrap('k', 60_000, supplier)).resolves.toBe(1);
  });
});
