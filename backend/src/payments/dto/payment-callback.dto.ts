import { IsString } from 'class-validator';

export class PaymentCallbackDto {
  @IsString()
  reservationId: string;

  @IsString()
  paymentStatus: string;
}
