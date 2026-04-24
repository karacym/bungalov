import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type SiteBrandingDto = {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  metaTitle: string;
  metaDescription: string;
  footerTagline: string;
  contactPhone: string;
  contactEmail: string;
  footerLocations: string;
};

const DEFAULTS: SiteBrandingDto = {
  siteName: 'Bungalov',
  logoUrl: '',
  faviconUrl: '',
  whatsapp: '',
  instagram: '',
  facebook: '',
  metaTitle: '',
  metaDescription: '',
  footerTagline:
    'Doganin icinde, sade cizgilerle tasarlanmis bungalov deneyimi. Sessizlik, konfor ve guvenli rezervasyon.',
  contactPhone: '+90 500 000 00 00',
  contactEmail: 'info@savaskara.com',
  footerLocations: 'Sapanca · Bolu · Bursa',
};

@Injectable()
export class SiteService {
  constructor(private readonly prisma: PrismaService) {}

  async getBranding(): Promise<SiteBrandingDto> {
    const row = await this.prisma.adminSetting.findUnique({
      where: { key: 'operations' },
    });
    const raw = (row?.value ?? {}) as Record<string, unknown>;
    return {
      siteName: typeof raw.siteName === 'string' && raw.siteName ? raw.siteName : DEFAULTS.siteName,
      logoUrl: typeof raw.logoUrl === 'string' ? raw.logoUrl : '',
      faviconUrl: typeof raw.faviconUrl === 'string' ? raw.faviconUrl : '',
      whatsapp: typeof raw.whatsapp === 'string' ? raw.whatsapp : '',
      instagram: typeof raw.instagram === 'string' ? raw.instagram : '',
      facebook: typeof raw.facebook === 'string' ? raw.facebook : '',
      metaTitle: typeof raw.metaTitle === 'string' ? raw.metaTitle : '',
      metaDescription: typeof raw.metaDescription === 'string' ? raw.metaDescription : '',
      footerTagline: typeof raw.footerTagline === 'string' ? raw.footerTagline : DEFAULTS.footerTagline,
      contactPhone: typeof raw.contactPhone === 'string' ? raw.contactPhone : DEFAULTS.contactPhone,
      contactEmail: typeof raw.contactEmail === 'string' ? raw.contactEmail : DEFAULTS.contactEmail,
      footerLocations: typeof raw.footerLocations === 'string' ? raw.footerLocations : DEFAULTS.footerLocations,
    };
  }
}
