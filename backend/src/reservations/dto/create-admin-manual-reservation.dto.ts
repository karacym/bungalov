import { ReservationStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAdminManualReservationDto {
  @IsString()
  @IsNotEmpty()
  bungalowId: string;

  @IsDateString()
  @Type(() => String)
  checkIn: string;

  @IsDateString()
  @Type(() => String)
  checkOut: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  guestName: string;

  @IsEmail()
  guestEmail: string;

  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
