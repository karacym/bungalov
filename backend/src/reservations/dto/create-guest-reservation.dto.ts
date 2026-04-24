import { Type } from 'class-transformer';
import { IsDateString, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateGuestReservationDto {
  @IsString()
  @IsNotEmpty()
  bungalowId: string;

  @IsDateString()
  @Type(() => String)
  checkIn: string;

  @IsDateString()
  @Type(() => String)
  checkOut: string;

  @IsString()
  @IsNotEmpty()
  guestName: string;

  @IsEmail()
  guestEmail: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests?: number;
}
