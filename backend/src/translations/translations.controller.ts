import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { TranslationsService } from './translations.service';

@Controller('translations')
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Get()
  all() {
    return this.translationsService.findAll();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  upsert(
    @Body()
    body: {
      key: string;
      tr: string;
      en: string;
      ar: string;
    },
  ) {
    return this.translationsService.upsert(body);
  }
}
