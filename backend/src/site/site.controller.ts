import { Controller, Get } from '@nestjs/common';
import { SiteService } from './site.service';

@Controller('site')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  /** Kimlik dogrulama gerektirmez; header / metadata icin marka alanlari. */
  @Get('branding')
  branding() {
    return this.siteService.getBranding();
  }
}
