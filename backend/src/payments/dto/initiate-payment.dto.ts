import { IsNumber, IsString } from 'class-validator';

export class InitiatePaymentDto {
  @IsString()
  reservationId: string;

  @IsNumber()
  amount: number;
}
