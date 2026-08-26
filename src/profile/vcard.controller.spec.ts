import { Locale } from '@prisma/client';
import { ProfileService } from './profile.service';
import { VcardController } from './vcard.controller';

describe('VcardController', () => {
  const profile = {
    id: '1',
    locale: Locale.RU,
    fullName: 'Никита Берёза',
    title: 'Backend; Developer, TS',
    summary: 'Строка с запятой, точкой с запятой; и\nпереводом строки',
    location: 'Remote',
    email: 'test@example.com',
    github: 'https://github.com/test',
    telegram: 'https://t.me/test',
    websiteUrl: null,
    openToWork: true,
    updatedAt: new Date(),
  };

  const profileService = {
    getProfile: jest.fn().mockResolvedValue(profile),
  } as unknown as ProfileService;

  const controller = new VcardController(profileService);

  it('produces a well-formed vCard 4.0', async () => {
    const vcf = await controller.vcard('ru');

    expect(vcf.startsWith('BEGIN:VCARD\r\nVERSION:4.0')).toBe(true);
    expect(vcf.trimEnd().endsWith('END:VCARD')).toBe(true);
    expect(vcf).toContain('FN:Никита Берёза');
    expect(vcf).toContain('N:Берёза;Никита;;;');
    expect(vcf).toContain('EMAIL:test@example.com');
  });

  it('escapes commas, semicolons and newlines per RFC 6350', async () => {
    const vcf = await controller.vcard('ru');

    expect(vcf).toContain('TITLE:Backend\\; Developer\\, TS');
    expect(vcf).toContain('NOTE:Строка с запятой\\, точкой с запятой\\; и\\nпереводом строки');
  });

  it('falls back to RU for unknown locale values', async () => {
    await controller.vcard('de');
    expect(profileService.getProfile).toHaveBeenLastCalledWith(Locale.RU);

    await controller.vcard('en');
    expect(profileService.getProfile).toHaveBeenLastCalledWith(Locale.EN);
  });
});
