import { Module } from '@nestjs/common';
import { ContactModule } from '../contact/contact.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [ReservationsModule, ContactModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
