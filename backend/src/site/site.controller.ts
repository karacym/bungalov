import { Controller, Get, Query } from '@nestjs/common';
import { SiteService } from './site.service';

@Controller('site')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  /** Kimlik dogrulama gerektirmez; header / metadata icin marka alanlari. */
  @Get('branding')
  branding() {
    return this.siteService.getBranding();
  }

  /** Anasayfa: Google kaynakli son yorumlar (herkese acik). */
  @Get('reviews/google')
  googleReviews(@Query('limit') limit?: string) {
    const n = limit ? Number(limit) : 5;
    return this.siteService.listGoogleReviewsForHome(Number.isFinite(n) ? n : 5);
  }
}
