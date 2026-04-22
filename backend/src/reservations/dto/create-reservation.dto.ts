import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  bungalowId: string;

  @IsDateString()
  @Type(() => String)
  checkIn: string;

  @IsDateString()
  @Type(() => String)
  checkOut: string;
}
