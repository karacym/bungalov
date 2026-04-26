import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CalendarExportService } from './calendar-export.service';
import { CalendarPublicController } from './calendar-public.controller';
import { CalendarSyncService } from './calendar-sync.service';

@Module({
  imports: [PrismaModule],
  controllers: [CalendarPublicController],
  providers: [CalendarSyncService, CalendarExportService],
  exports: [CalendarSyncService, CalendarExportService],
})
export class CalendarModule {}
