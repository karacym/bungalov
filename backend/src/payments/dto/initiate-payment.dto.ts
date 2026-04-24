import { IsNumber, IsOptional, IsString } from 'class-validator';

export class InitiatePaymentDto {
  @IsString()
  reservationId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  locale?: string;
}
