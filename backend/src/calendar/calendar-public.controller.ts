import { Controller, Get, Header, NotFoundException, Param } from '@nestjs/common';
import { CalendarExportService } from './calendar-export.service';

@Controller('calendar')
export class CalendarPublicController {
  constructor(private readonly calendarExport: CalendarExportService) {}

  @Get('export/:token')
  @Header('Content-Type', 'text/calendar; charset=utf-8')
  @Header('Cache-Control', 'private, max-age=300')
  async export(@Param('token') token: string): Promise<string> {
    const body = await this.calendarExport.buildIcs(token);
    if (!body) {
      throw new NotFoundException();
    }
    return body;
  }
}
