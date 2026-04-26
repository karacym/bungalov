import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { BungalowsModule } from './bungalows/bungalows.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReservationsModule } from './reservations/reservations.module';
import { AvailabilityModule } from './availability/availability.module';
import { TranslationsModule } from './translations/translations.module';
import { AdminModule } from './admin/admin.module';
import { SiteModule } from './site/site.module';
import { ContactModule } from './contact/contact.module';
import { BlogModule } from './blog/blog.module';
import { CalendarModule } from './calendar/calendar.module';
import { GoogleMapsModule } from './google-maps/google-maps.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    BungalowsModule,
    ReservationsModule,
    PaymentsModule,
    AvailabilityModule,
    TranslationsModule,
    AdminModule,
    SiteModule,
    ContactModule,
    BlogModule,
    CalendarModule,
    GoogleMapsModule,
  ],
})
export class AppModule {}
