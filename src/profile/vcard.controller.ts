import { Controller, Get, Header, Query } from '@nestjs/common';
import { Locale } from '@prisma/client';
import { ProfileService } from './profile.service';

/** Escapes special characters per RFC 6350 (vCard 4.0). */
function esc(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

/**
 * A business card should be saveable to contacts — this endpoint returns
 * a standards-compliant vCard built from the same database the card renders from.
 */
@Controller()
export class VcardController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('vcard.vcf')
  @Header('Content-Type', 'text/vcard; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="nikita-beryoza.vcf"')
  async vcard(@Query('locale') localeRaw?: string): Promise<string> {
    const locale = localeRaw?.toUpperCase() === 'EN' ? Locale.EN : Locale.RU;
    const p = await this.profileService.getProfile(locale);

    const [firstName, ...rest] = p.fullName.split(' ');
    const lastName = rest.join(' ');

    const lines = [
      'BEGIN:VCARD',
      'VERSION:4.0',
      `FN:${esc(p.fullName)}`,
      `N:${esc(lastName)};${esc(firstName)};;;`,
      `TITLE:${esc(p.title)}`,
      `EMAIL:${esc(p.email)}`,
      `URL:${esc(p.github)}`,
      `URL:${esc(p.telegram)}`,
      p.websiteUrl ? `URL:${esc(p.websiteUrl)}` : null,
      `NOTE:${esc(p.summary)}`,
      `REV:${new Date().toISOString()}`,
      'END:VCARD',
    ].filter((line): line is string => line !== null);

    return lines.join('\r\n') + '\r\n';
  }
}
