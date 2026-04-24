import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

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

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests?: number;
}
