import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
})
export class AppModule {}
