import { Module } from '@nestjs/common';
import { BlogModule } from '../blog/blog.module';
import { CalendarModule } from '../calendar/calendar.module';
import { ContactModule } from '../contact/contact.module';
import { MailModule } from '../mail/mail.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [ReservationsModule, ContactModule, MailModule, BlogModule, CalendarModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
