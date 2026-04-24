import { Type } from 'class-transformer';
import { IsDateString, IsInt, Min } from 'class-validator';

export class SearchBungalowsDto {
  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests: number;
}
