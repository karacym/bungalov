import { IsEnum } from 'class-validator';
import { ReservationStatus } from '@prisma/client';

export class UpdateReservationDto {
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}
